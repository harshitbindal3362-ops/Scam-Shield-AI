import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { honeypotSessions } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import {
  detectScamProbability,
  detectScamType,
  extractIntelligence,
  mergeIntelligence,
  type ExtractionResult,
} from "./scamDetector.js";
import { HONEYPOT_SYSTEM_PROMPT, buildScamTypeContext } from "./agentPersona.js";

const router: IRouter = Router();

const GUVI_CALLBACK_URL = "https://hackathon.guvi.in/api/updateHoneyPotFinalResult";

const emptyIntelligence = (): ExtractionResult => ({
  bankAccounts: [],
  upiIds: [],
  phishingLinks: [],
  phoneNumbers: [],
  suspiciousKeywords: [],
});

async function generateAgentReply(
  scamType: string,
  conversationHistory: Array<{ role: string; content: string; timestamp: string }>,
  incomingMessage: string
): Promise<string> {
  const scamContext = buildScamTypeContext(scamType);

  const systemPrompt = `${HONEYPOT_SYSTEM_PROMPT}

CURRENT SCAM TYPE DETECTED: ${scamType}
ENGAGEMENT STRATEGY: ${scamContext}`;

  const messages: Array<{ role: "user" | "assistant"; content: string }> = conversationHistory.map((turn) => ({
    role: turn.role === "scammer" ? "user" : "assistant",
    content: turn.content,
  }));

  messages.push({ role: "user", content: incomingMessage });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: systemPrompt,
    messages,
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "Ji haan, please repeat that again?";
}

router.post("/analyze", async (req, res) => {
  try {
    const { sessionId, message, conversationHistory = [], metadata = {} } = req.body;

    if (!sessionId || !message?.text) {
      return res.status(400).json({ error: "sessionId and message.text are required" });
    }

    const incomingText = message.text;
    const scamProbability = detectScamProbability(incomingText);
    const scamDetected = scamProbability >= 30;
    const scamType = scamDetected ? detectScamType(incomingText) : "None";

    const newIntelligence = extractIntelligence(incomingText);

    let existingSession = await db.select().from(honeypotSessions).where(eq(honeypotSessions.sessionId, sessionId)).limit(1);

    let agentReply = "";
    let updatedConversation: Array<{ role: string; content: string; timestamp: string }> = [];
    let cumulativeIntelligence: ExtractionResult = emptyIntelligence();
    let totalMessages = 0;
    let engagementDuration = 0;

    if (existingSession.length > 0) {
      const session = existingSession[0];
      const existingConv = (session.conversation as Array<{ role: string; content: string; timestamp: string }>) || [];
      const existingIntel = (session.extractedIntelligence as ExtractionResult) || emptyIntelligence();

      cumulativeIntelligence = mergeIntelligence(existingIntel, newIntelligence);

      existingConv.push({
        role: "scammer",
        content: incomingText,
        timestamp: message.timestamp || new Date().toISOString(),
      });

      const mergedHistory = existingConv;

      if (scamDetected || session.scamDetected) {
        agentReply = await generateAgentReply(
          scamType !== "None" ? scamType : (session.scamType || "General Scam"),
          mergedHistory.slice(0, -1),
          incomingText
        );
      } else {
        agentReply = "Hello, how can I help you today?";
      }

      updatedConversation = [...mergedHistory, {
        role: "agent",
        content: agentReply,
        timestamp: new Date().toISOString(),
      }];

      totalMessages = session.totalMessagesExchanged + 2;
      const startTime = new Date(session.startedAt).getTime();
      engagementDuration = Math.floor((Date.now() - startTime) / 1000);

      const newStatus = scamDetected ? "engaged" : session.status;

      await db.update(honeypotSessions).set({
        scamDetected: session.scamDetected || scamDetected,
        scamType: scamType !== "None" ? scamType : session.scamType,
        scamProbability: Math.max(session.scamProbability, scamProbability / 100),
        conversation: updatedConversation,
        extractedIntelligence: cumulativeIntelligence,
        totalMessagesExchanged: totalMessages,
        engagementDurationSeconds: engagementDuration,
        status: newStatus,
        lastActivityAt: new Date(),
      }).where(eq(honeypotSessions.sessionId, sessionId));
    } else {
      if (scamDetected) {
        agentReply = await generateAgentReply(scamType, conversationHistory, incomingText);
      } else {
        agentReply = "Hello, who is this? How can I help?";
      }

      cumulativeIntelligence = newIntelligence;

      updatedConversation = [
        {
          role: "scammer",
          content: incomingText,
          timestamp: message.timestamp || new Date().toISOString(),
        },
        {
          role: "agent",
          content: agentReply,
          timestamp: new Date().toISOString(),
        },
      ];

      totalMessages = 2;
      engagementDuration = 0;

      await db.insert(honeypotSessions).values({
        sessionId,
        status: scamDetected ? "engaged" : "scanning",
        scamDetected,
        scamType: scamType !== "None" ? scamType : null,
        scamProbability: scamProbability / 100,
        channel: metadata.channel || "SMS",
        language: metadata.language || "English",
        locale: metadata.locale || "IN",
        conversation: updatedConversation,
        extractedIntelligence: cumulativeIntelligence,
        totalMessagesExchanged: totalMessages,
        engagementDurationSeconds: engagementDuration,
        agentNotes: null,
        guviCallbackStatus: null,
        finalizedAt: null,
      });
    }

    const agentNotes = scamDetected
      ? `Scammer used ${scamType} tactics. ${cumulativeIntelligence.suspiciousKeywords.length > 0 ? `Detected keywords: ${cumulativeIntelligence.suspiciousKeywords.slice(0, 3).join(", ")}. ` : ""}${cumulativeIntelligence.phishingLinks.length > 0 ? "Contains phishing links. " : ""}${cumulativeIntelligence.upiIds.length > 0 ? "UPI IDs extracted. " : ""}`
      : "No scam detected in this message.";

    return res.json({
      status: "success",
      sessionId,
      scamDetected,
      scamProbability: scamProbability,
      scamType,
      agentReply,
      extractedIntelligence: cumulativeIntelligence,
      engagementMetrics: {
        engagementDurationSeconds: engagementDuration,
        totalMessagesExchanged: totalMessages,
      },
      agentNotes,
    });
  } catch (err) {
    console.error("Error in /analyze:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/sessions", async (_req, res) => {
  try {
    const sessions = await db.select().from(honeypotSessions).orderBy(honeypotSessions.lastActivityAt);

    const result = sessions.map((s) => ({
      sessionId: s.sessionId,
      status: s.status,
      scamDetected: s.scamDetected,
      scamType: s.scamType,
      scamProbability: Math.round((s.scamProbability || 0) * 100),
      totalMessages: s.totalMessagesExchanged,
      startedAt: s.startedAt.toISOString(),
      lastActivityAt: s.lastActivityAt.toISOString(),
      channel: s.channel,
    }));

    return res.json(result);
  } catch (err) {
    console.error("Error in GET /sessions:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/sessions/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessions = await db.select().from(honeypotSessions).where(eq(honeypotSessions.sessionId, sessionId)).limit(1);

    if (sessions.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const s = sessions[0];
    return res.json({
      sessionId: s.sessionId,
      status: s.status,
      scamDetected: s.scamDetected,
      scamType: s.scamType,
      scamProbability: Math.round((s.scamProbability || 0) * 100),
      startedAt: s.startedAt.toISOString(),
      lastActivityAt: s.lastActivityAt.toISOString(),
      channel: s.channel,
      conversation: s.conversation,
      extractedIntelligence: s.extractedIntelligence || emptyIntelligence(),
      agentNotes: s.agentNotes,
    });
  } catch (err) {
    console.error("Error in GET /sessions/:id:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sessions/:sessionId/finalize", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessions = await db.select().from(honeypotSessions).where(eq(honeypotSessions.sessionId, sessionId)).limit(1);

    if (sessions.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const session = sessions[0];
    const intel = (session.extractedIntelligence as ExtractionResult) || emptyIntelligence();
    const conv = (session.conversation as Array<{ role: string; content: string; timestamp: string }>) || [];

    const startTime = new Date(session.startedAt).getTime();
    const engagementDuration = Math.floor((Date.now() - startTime) / 1000);
    const totalMessages = session.totalMessagesExchanged;

    let agentNotes = session.agentNotes || "";
    if (!agentNotes && session.scamDetected) {
      agentNotes = `Scammer used ${session.scamType || "unknown"} tactics. Engagement lasted ${engagementDuration} seconds with ${totalMessages} messages exchanged. Intelligence extracted: ${intel.upiIds.length} UPI IDs, ${intel.bankAccounts.length} bank accounts, ${intel.phishingLinks.length} phishing links, ${intel.phoneNumbers.length} phone numbers.`;
    }

    await db.update(honeypotSessions).set({
      status: "complete",
      agentNotes,
      guviCallbackStatus: "not_sent",
      engagementDurationSeconds: engagementDuration,
      finalizedAt: new Date(),
    }).where(eq(honeypotSessions.sessionId, sessionId));

    return res.json({
      status: "success",
      sessionId,
      scamDetected: session.scamDetected,
      engagementMetrics: {
        engagementDurationSeconds: engagementDuration,
        totalMessagesExchanged: totalMessages,
      },
      extractedIntelligence: intel,
      agentNotes,
      guviCallbackStatus: "not_sent",
    });
  } catch (err) {
    console.error("Error in POST /sessions/:id/finalize:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/intelligence", async (_req, res) => {
  try {
    const sessions = await db.select().from(honeypotSessions);

    const allBankAccounts = new Set<string>();
    const allUpiIds = new Set<string>();
    const allPhishingLinks = new Set<string>();
    const allPhoneNumbers = new Set<string>();
    const keywordCounts = new Map<string, number>();

    for (const session of sessions) {
      const intel = (session.extractedIntelligence as ExtractionResult) || emptyIntelligence();
      intel.bankAccounts?.forEach((x: string) => allBankAccounts.add(x));
      intel.upiIds?.forEach((x: string) => allUpiIds.add(x));
      intel.phishingLinks?.forEach((x: string) => allPhishingLinks.add(x));
      intel.phoneNumbers?.forEach((x: string) => allPhoneNumbers.add(x));
      intel.suspiciousKeywords?.forEach((k: string) => {
        keywordCounts.set(k, (keywordCounts.get(k) || 0) + 1);
      });
    }

    const topKeywords = [...keywordCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([k]) => k);

    const scamCount = sessions.filter((s) => s.scamDetected).length;

    return res.json({
      totalSessions: sessions.length,
      scamSessionsCount: scamCount,
      allBankAccounts: [...allBankAccounts],
      allUpiIds: [...allUpiIds],
      allPhishingLinks: [...allPhishingLinks],
      allPhoneNumbers: [...allPhoneNumbers],
      topKeywords,
    });
  } catch (err) {
    console.error("Error in GET /intelligence:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
