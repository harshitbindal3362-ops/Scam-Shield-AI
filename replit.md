# Scam Honeypot AI — Cybersecurity Research Tool

## Overview

A full-stack AI-powered honeypot system that detects scam/fraud messages, autonomously engages scammers in multi-turn human-like conversations (as "Ramesh Kumar"), extracts actionable intelligence, and reports results to the GUVI evaluation endpoint.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: Anthropic claude-sonnet-4-6 via Replit AI Integrations (no API key required)
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/               # Express API server
│   └── honeypot/                 # React + Vite frontend (cybersecurity dashboard UI)
├── lib/
│   ├── api-spec/openapi.yaml     # OpenAPI spec for all endpoints
│   ├── api-client-react/         # Generated React Query hooks
│   ├── api-zod/                  # Generated Zod schemas
│   ├── db/                       # Drizzle ORM schema + DB connection
│   └── integrations-anthropic-ai/ # Anthropic AI client
├── scripts/
└── pnpm-workspace.yaml
```

## Key Features

- **Live Monitor**: Paste/submit suspicious messages for real-time scam detection with probability scores
- **Active Sessions**: Multi-turn conversation view between AI agent and scammer
- **Intelligence Board**: Extracted bank accounts, UPI IDs, phishing links, phone numbers, keywords
- **Call Shield**: Toggle panel simulating live call interception with verdict cards
- **Reports**: Session history with finalize/GUVI callback buttons
- **Dark/Light theme**: Persisted in localStorage
- **OmniDimension.io**: Voice widget placeholder integrated in index.html

## API Endpoints

All under `/api`:
- `POST /api/honeypot/analyze` — Analyze a message, detect scam, generate AI agent reply
- `GET /api/honeypot/sessions` — List all sessions
- `GET /api/honeypot/sessions/:id` — Session detail with conversation
- `POST /api/honeypot/sessions/:id/finalize` — Finalize session + GUVI callback
- `GET /api/honeypot/intelligence` — Aggregated intelligence board data

## AI Agent Persona

The AI agent plays "Ramesh Kumar" — a confused retired Indian government employee.
Tactics: urgency mimicry, confusion simulation, slow information reveal, identity fishing.
Never reveals it's an AI. System prompt in: `artifacts/api-server/src/routes/honeypot/agentPersona.ts`

## GUVI Integration

On session finalize: `POST https://hackathon.guvi.in/api/updateHoneyPotFinalResult`
Status tracked in `honeypot_sessions.guvi_callback_status`

## OmniDimension Voice

Placeholder widget script in `artifacts/honeypot/index.html`.
Replace `YOUR_AGENT_ID` and `YOUR_SELECTED_VOICE_ID` with real values from omnidimension.io.
Voice calls use `window.OmniDim.speak(text)` triggered from `playVoice()` in `lib/utils.ts`.

## DB Schema

Table: `honeypot_sessions`
Key fields: sessionId, status, scamDetected, scamType, scamProbability, conversation (JSONB), extractedIntelligence (JSONB), totalMessagesExchanged, engagementDurationSeconds, guviCallbackStatus
