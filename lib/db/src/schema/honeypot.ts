import { pgTable, serial, text, timestamp, boolean, real, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const honeypotSessions = pgTable("honeypot_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  status: text("status").notNull().default("scanning"),
  scamDetected: boolean("scam_detected").notNull().default(false),
  scamType: text("scam_type"),
  scamProbability: real("scam_probability").notNull().default(0),
  channel: text("channel").notNull().default("SMS"),
  language: text("language").notNull().default("English"),
  locale: text("locale").notNull().default("IN"),
  conversation: jsonb("conversation").notNull().default([]),
  extractedIntelligence: jsonb("extracted_intelligence").notNull().default({}),
  engagementDurationSeconds: integer("engagement_duration_seconds").notNull().default(0),
  totalMessagesExchanged: integer("total_messages_exchanged").notNull().default(0),
  agentNotes: text("agent_notes"),
  guviCallbackStatus: text("guvi_callback_status"),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).defaultNow().notNull(),
  finalizedAt: timestamp("finalized_at", { withTimezone: true }),
});

export const insertHoneypotSessionSchema = createInsertSchema(honeypotSessions).omit({
  id: true,
  startedAt: true,
  lastActivityAt: true,
});

export type HoneypotSession = typeof honeypotSessions.$inferSelect;
export type InsertHoneypotSession = z.infer<typeof insertHoneypotSessionSchema>;
