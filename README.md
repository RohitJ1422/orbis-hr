# OrbisHR

Agentic HR platform — Claude-powered onboarding, Angular dashboard, NestJS backend.

## What this is

OrbisHR is an agentic HRMS proof of concept. A single command triggers an autonomous AI
agent that provisions a new employee across multiple systems simultaneously — no human
clicking through dashboards, no sequential checklists.

Built with Claude (Anthropic) as the reasoning engine, NestJS as the backend, and Angular
as the frontend dashboard.

## The agentic loop

When HR submits a new hire, the Provisioner Agent:

1. Creates the employee record in the database
2. Sends a personalised Slack welcome to #onboarding
3. Generates a tailored 30/60/90 day onboarding plan
4. Audit logs every step — success and failure — to PostgreSQL
5. Streams every action live to the Angular dashboard via SSE

If a step fails, the agent recovers autonomously, escalates to HR, and continues. It does
not crash. It does not ask for help unless it genuinely cannot proceed.

## Tech stack

| Layer | Technology |
|---|---|
| LLM | Claude claude-sonnet-4-6 (Anthropic API) |
| Backend | NestJS + TypeScript |
| Frontend | Angular 17 |
| Database | PostgreSQL |
| Messaging | Slack Incoming Webhooks |
| Infra | Docker Compose |
| Agent design | CLAUDE.md + tool-use API |

## Project structure

```
orbis-hr/
├── CLAUDE.md                  ← agent architecture, tool definitions, constraints
├── README.md
├── docker-compose.yml
├── .env.example
└── apps/
    ├── backend/               ← NestJS
    │   └── src/
    │       ├── agent/         ← agentic loop + tool registry
    │       ├── onboarding/    ← hire record CRUD
    │       └── companion/     ← context-aware chat endpoint
    └── frontend/              ← Angular 17
        └── src/app/
            ├── agent-log/     ← live SSE event feed
            ├── hire-form/     ← new hire submission
            └── companion/     ← AI chat panel
```

## Getting started

### Prerequisites

- Node.js 18+
- Docker Desktop
- An Anthropic API key — get one at console.anthropic.com
- A Slack workspace with an Incoming Webhook configured

### Setup

```powershell
# Clone the repo
git clone https://github.com/YOUR_USERNAME/orbis-hr.git
cd orbis-hr

# Copy environment file and fill in your keys
Copy-Item .env.example .env
code .env

# Start PostgreSQL
docker-compose up -d

# Install and run the backend
cd apps\backend
npm install
npm run start:dev
```

### Environment variables

```
ANTHROPIC_API_KEY=sk-ant-...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/orbis
```

### Test the agent

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/onboarding/hire" `
  -ContentType "application/json" `
  -Body '{"name":"Riya Lal","role":"Senior Designer","startDate":"2026-03-30"}'
```

Watch Claude reason through the steps in the terminal. Check your Slack workspace for
the welcome message. Check the database for the audit log.

### Test failure recovery

Set `SLACK_WEBHOOK_URL` to a broken URL in `.env`, re-run the request above, and watch
the agent detect the failure, log an escalation event, and complete the remaining steps
without crashing.

## Agent design

The intelligence of this system lives in two places:

**`CLAUDE.md`** defines the agent's persona, tool contracts, execution order, error
handling rules, and SSE event schema. This is the architectural document — read it to
understand how the agent thinks.

**`apps/backend/src/agent/tools/tool.types.ts`** defines the TypeScript interfaces for
each tool the agent can call. Tool design is the core skill in agentic AI engineering —
the description string on each tool is itself a prompt that Claude reads to decide when
and how to use it.

## Status

- [x] CLAUDE.md — agent architecture complete
- [ ] NestJS backend scaffold
- [ ] Tool registry + handlers
- [ ] Agentic loop with Claude tool-use
- [ ] SSE streaming
- [ ] Angular dashboard
- [ ] Companion chat panel

---

Built by Rohit Jain · OrbisHR agentic HRMS · March 2026
