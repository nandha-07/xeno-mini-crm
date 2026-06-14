# Xeno mini CRM — AI-Native Mini CRM

> **"Your brand. Your shoppers. One AI that connects them."**

Xeno mini CRM is a full-stack, AI-native mini CRM for D2C and retail brands. It helps marketers decide **who to talk to**, **what to say**, and **how well it worked** — powered by Groq + Llama 3.3 70B, agentic tool calling, and a fully simulated two-service messaging loop.

Built for the **Xeno Engineering Take-Home Assignment** (June 2026).

### 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://frontend-delta-lovat-49.vercel.app](https://frontend-delta-lovat-49.vercel.app) |
| **CRM API** | [https://orbit-crm.onrender.com](https://orbit-crm.onrender.com/health) |
| **Channel Service** | [https://orbit-channel.onrender.com](https://orbit-channel.onrender.com/health) |

> ⚠️ Render free-tier services sleep after 15 min of inactivity — first request takes ~60s to wake up.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Tech Stack](#tech-stack)
3. [AI Features](#ai-features)
4. [Frontend Screens](#frontend-screens)
5. [API Endpoints](#api-endpoints)
6. [Data Models](#data-models)
7. [Repository Structure](#repository-structure)
8. [Environment Variables](#environment-variables)
9. [Running Locally](#running-locally)
10. [Deployment](#deployment)
11. [Design Decisions & Tradeoffs](#design-decisions--tradeoffs)

---

## Architecture

```
┌───────────────┐       ┌─────────────────────┐         ┌──────────────────────────────────────────┐
│  Google Auth  │◀─SSO─▶│   Next.js Frontend  │──REST──▶│           CRM Backend (FastAPI)          │
│  (OAuth 2.0)  │       │   (Vercel)          │◀──JSON──│                (Render)                  │
└───────────────┘       └─────────────────────┘         │                                          │
                                                        │  ┌──────────────┐  ┌──────────────────┐  │
                                                        │  │  REST API    │  │    AI Engine     │  │
                                                        │  │  15 routers  │  │  Groq + Llama    │  │
                                                        │  └──────────────┘  └──────────────────┘  │
                                                        │  ┌──────────────┐  ┌──────────────────┐  │
                                                        │  │  RFM Scorer  │  │  Embeddings      │  │
                                                        │  │  (pandas)    │  │  (Groq API)      │  │
                                                        │  └──────────────┘  └──────────────────┘  │
                                                        │  ┌──────────────────────────────────┐    │
                                                        │  │ Supabase (PostgreSQL + pgvector) │    │
                                                        │  └──────────────────────────────────┘    │
                                                        └────────────────┬───────────────────────┘
                                                            POST /send   │   POST /receipts ▲       
                                                                         ▼                  │       
                                                        ┌─────────────────────────────────────────┐ 
                                                        │      Channel Service (FastAPI, Render)  │ 
                                                        │  • Email (SMTP) / SMS+WhatsApp (Twilio) │ 
                                                        │  • Simulated delivery lifecycle         │ 
                                                        │  • Fires receipt callbacks → CRM        │ 
                                                        └─────────────────────────────────────────┘ 

Redis ──── Celery task queue (shared by both services)
Google ─── OAuth 2.0 Identity Provider
Groq  ──── LLM API (Llama 3.3 70B) + Embeddings API
```

### Two-Service Design

The CRM and Channel Service are **separate FastAPI processes** communicating via HTTP:

1. CRM calls `POST /send` on the Channel Service with message payload
2. Channel Service returns `202 Accepted` immediately
3. Channel Service simulates delivery lifecycle via Celery (delay, probabilistic outcomes)
4. Channel Service fires `POST /receipts` back to CRM with delivery status
5. CRM updates the communication record and broadcasts via Supabase Realtime

This models how real messaging providers (Twilio, Gupshup) work — webhook callbacks, not synchronous responses.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| CRM Backend | Python 3.11 + FastAPI | AI libraries are Python-native; async support |
| Channel Service | Python 3.11 + FastAPI | Separate process, same stack |
| Task Queue | Celery 5 + Redis | Async jobs, retry logic, webhook simulation |
| Database | Supabase (PostgreSQL 15 + pgvector) | Free hosted Postgres with realtime + vector search |
| LLM | Groq API (Llama 3.3 70B) | Free tier, ~200 tok/s, function/tool calling |
| Embeddings | Groq API (384-dim) | API-based, zero local memory footprint |
| RFM Scoring | pandas + numpy | Lightweight, no external ML service |
| Frontend | Next.js 14 (App Router) + Tailwind CSS | SSR, fast routing, modern React |
| Auth | PBKDF2-HMAC-SHA256 + Google OAuth | Demo-grade, org-based multi-tenancy |
| Hosting | Render (backend) + Vercel (frontend) | Free tier deployment |

---

## AI Features

Xeno mini CRM has **8 distinct AI capabilities**, all powered by Groq + Llama 3.3 70B:

### 1. NL2Segment — Natural Language → Database Query
Type a description like *"customers who spent over ₹5000 but haven't ordered in 60 days"* and the AI translates it into a structured `filter_spec` JSON, executes it against Supabase, and returns matching customer count + preview.

### 2. AI Import Agent
Upload **any** CSV/XLSX file with **any column names**. The AI reads headers + sample rows, detects whether it's customer or order data, maps columns to the canonical schema, and proposes value normalizations (e.g., `"WA"` → `"whatsapp"`).

### 3. Per-Customer Message Personalization
Every recipient in a campaign gets a unique, context-aware message. The AI considers their name, city, purchase history, last product, and churn risk to write Zomato-style personalized copy in batches of 20.

### 4. Agentic AI Copilot (Tool Calling)
A chat interface where the LLM autonomously plans and executes campaigns using 7 tools:
- `get_segments` — list saved audience segments
- `semantic_customer_search` — RAG vector search over customer profiles
- `create_segment_from_nl` — create segment from natural language
- `draft_message` — write campaign copy
- `create_campaign` — set up a campaign
- `launch_campaign` — send it (requires user confirmation)
- `get_campaign_stats` — track delivery progress

The frontend renders each tool call as a visible reasoning trace.

### 5. Customer 360 AI Summary
Each customer profile gets a 2-sentence AI summary for the marketer — purchase patterns, churn risk reason, and a suggested action.

### 6. Post-Campaign Analyst
After every campaign completes, the AI writes a post-mortem analysis with specific numbers and one concrete recommendation.

### 7. Semantic Smart Search (RAG)
Customer profiles are embedded as 384-dim vectors via the Groq API and stored in pgvector. Marketers can search by meaning (e.g., *"price-sensitive skincare lovers"*) instead of just name/phone.

### 8. AI Growth Strategist
Generates actionable growth strategies and can produce PDF reports for customers, campaigns, and executive summaries.

---

## Frontend Screens

| Screen | Route | Description |
|--------|-------|-------------|
| **Login** | `/login` | Org signup/login, Google OAuth, admin login |
| **Dashboard** | `/dashboard` | KPI cards, campaign status, churn risk breakdown, AI briefing |
| **Customers** | `/customers` | Sortable table with RFM scores, churn risk badges, detail drawer with AI 360 |
| **Smart Search** | `/smart-search` | Semantic vector search — type meaning, find customers |
| **Segments** | `/segments` | NL2Segment + visual filter builder, live count preview |
| **Campaigns** | `/campaigns` | List + multi-step wizard (segment → channel → message → launch) |
| **Campaign Detail** | `/campaigns/[id]` | Live delivery tracking with Supabase Realtime, per-customer status, AI post-mortem |
| **AI Copilot** | `/copilot` | Chat interface with tool-calling reasoning trace |
| **AI Strategist** | `/strategist` | Growth strategy generation |
| **Data Explorer** | `/data` | Raw data tables |
| **Analytics** | `/analytics` | Campaign performance charts, channel comparison |
| **Reports** | `/reports` | PDF report generation |
| **Settings** | `/settings` | CSV/XLSX import, API credentials, brand profile |

---

## API Endpoints

All endpoints are prefixed with `/api/v1`. Multi-tenant scoping via `X-Org-Id` header.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/org/signup` | Register organization (auto-generates org ID) |
| POST | `/auth/org/login` | Org ID + password login |
| POST | `/auth/admin/login` | Admin login (demo: admin/admin) |
| POST | `/auth/google` | Google OAuth token exchange |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | Paginated list with RFM scores, search, filters |
| GET | `/customers/{id}` | Full profile with orders, campaigns, AI 360 summary |
| POST | `/customers` | Create single customer |
| PUT | `/customers/{id}` | Update customer |
| DELETE | `/customers/{id}` | Delete customer |

### Data Import (AI-Assisted)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/imports/analyze` | Upload file → AI maps headers to schema |
| POST | `/imports/run` | Execute import with approved mapping |

### Segments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/segments` | List all segments |
| POST | `/segments` | Create from filter spec |
| POST | `/segments/nl2segment` | Natural language → segment |
| POST | `/segments/{id}/refresh` | Re-execute and update count |

### Campaigns
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/campaigns` | List campaigns |
| POST | `/campaigns` | Create draft campaign |
| POST | `/campaigns/{id}/launch` | Launch campaign |
| GET | `/campaigns/{id}/stats` | Live delivery stats |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/copilot/chat` | Agentic copilot (SSE streaming) |
| POST | `/strategist/generate` | AI growth strategy |
| GET | `/semantic/search` | Vector-based customer search |
| POST | `/reports/generate` | PDF report generation |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/receipts` | Channel service delivery callbacks |
| GET | `/analytics/overview` | Dashboard KPIs |
| GET | `/analytics/campaigns` | Per-campaign performance |
| GET | `/channels/status` | Which channels are configured |
| GET | `/health` | Health check |

---

## Data Models

### Core Tables (Supabase/PostgreSQL)

**`organizations`** — multi-tenant org registry
- `id` (UUID), `org_id` (text, human-readable), `name`, `password_hash`, `created_at`

**`customers`** — with `org_id` scoping
- `id`, `external_id`, `first_name`, `last_name`, `phone` (E.164), `email`, `city`, `channel_pref`, `embedding` (vector 384-dim), `org_id`

**`orders`**
- `id`, `customer_id` (FK), `order_date`, `amount` (INR), `category`, `product_name`, `status`, `org_id`

**`customer_scores`** — RFM metrics (auto-computed)
- `customer_id` (FK), `recency_days`, `frequency`, `monetary`, `rfm_score` (0–100), `churn_risk` (low/medium/high/critical), `top_category`, `last_product`, `org_id`

**`segments`**
- `id`, `name`, `description`, `filter_spec` (JSONB), `nl_query`, `customer_count`, `org_id`

**`campaigns`**
- `id`, `name`, `segment_id` (FK), `channel`, `message_template`, `personalized`, `status`, `total_sent/delivered/opened/clicked/failed`, `ai_postmortem`, `org_id`

**`communications`** — per-customer delivery tracking
- `id`, `campaign_id` (FK), `customer_id` (FK), `channel`, `personalized_message`, `status` (queued→sent→delivered→opened→clicked), `idempotency_key`, timestamps

**`imports`** — import history + error log

---

## Repository Structure

```
xeno-mini-crm/
├── crm/                              # CRM Backend (FastAPI)
│   ├── main.py                       # App entry point, CORS, router mounting
│   ├── config.py                     # Settings, lazy Supabase/Redis clients
│   ├── celery_app.py                 # Celery instance, beat schedule
│   ├── deps.py                       # OrgContext — multi-tenant scoping
│   ├── routers/
│   │   ├── auth.py                   # Signup, login, Google OAuth
│   │   ├── customers.py              # CRUD + list with RFM joined
│   │   ├── orders.py                 # Order CRUD
│   │   ├── imports.py                # AI-assisted CSV/XLSX import
│   │   ├── segments.py               # CRUD + NL2Segment
│   │   ├── campaigns.py              # CRUD + launch
│   │   ├── receipts.py               # Delivery callbacks from channel service
│   │   ├── tracking.py               # Email open-pixel, click-redirect, unsubscribe
│   │   ├── analytics.py              # KPIs, per-campaign, channel stats
│   │   ├── copilot.py                # Agentic AI Copilot (SSE)
│   │   ├── strategist.py             # AI growth strategist
│   │   ├── semantic.py               # Vector/semantic search (pgvector)
│   │   ├── reports.py                # PDF report generation
│   │   ├── settings.py               # Env settings management
│   │   └── feedback.py               # User feedback for AI learning
│   ├── services/
│   │   ├── ai_engine.py              # All LLM interactions (NL2Seg, personalize, copilot, postmortem)
│   │   ├── rfm_scorer.py             # RFM scoring with pandas
│   │   ├── segment_executor.py       # filter_spec → parameterized SQL
│   │   ├── embeddings.py             # Groq API embeddings (384-dim, zero local memory)
│   │   ├── semantic.py               # Vector search helpers (pgvector RAG)
│   │   ├── customer_embedder.py      # Background embedding builder
│   │   ├── campaign_sender.py        # HTTP calls to channel service
│   │   ├── import_mapper.py          # AI header-mapping helpers
│   │   ├── email_templates.py        # HTML email rendering
│   │   ├── delivery_events.py        # Open/click event handling
│   │   ├── report_builder.py         # PDF rendering (ReportLab)
│   │   ├── strategist.py             # Growth strategy prompt orchestration
│   │   └── org_learning.py           # Per-org feedback → prompt tuning
│   ├── tasks/
│   │   ├── score_customers.py        # RFM scoring tasks (sync + Celery + nightly batch)
│   │   └── campaigns.py              # Campaign launch + finalize + postmortem
│   ├── db/
│   │   ├── schema.sql                # Base schema
│   │   └── migrations/               # Incremental migrations
│   └── requirements.txt
│
├── channel/                           # Channel Service (messaging provider)
│   ├── main.py                        # FastAPI app
│   ├── config.py                      # SMTP, Twilio, Redis settings
│   ├── celery_app.py                  # Celery instance
│   ├── senders.py                     # Email (SMTP) + SMS/WhatsApp (Twilio) senders
│   ├── routers/send.py                # POST /send → 202 Accepted
│   ├── tasks/deliver.py               # Simulate lifecycle + fire receipt callbacks
│   └── requirements.txt
│
├── frontend/                          # Next.js 14 (App Router) + Tailwind
│   ├── app/
│   │   ├── login/                     # Auth (org/admin/Google login)
│   │   ├── welcome/                   # Org picker (admin mode)
│   │   ├── dashboard/                 # KPIs + AI briefing
│   │   ├── customers/                 # Customer list + detail
│   │   ├── smart-search/              # Semantic search
│   │   ├── segments/                  # Segment builder (NL + filters)
│   │   ├── campaigns/                 # Campaign wizard + live stats
│   │   ├── copilot/                   # AI chat with tool traces
│   │   ├── strategist/                # AI growth strategist
│   │   ├── data/                      # Data explorer
│   │   ├── analytics/                 # Charts + channel comparison
│   │   ├── reports/                   # PDF reports
│   │   └── settings/                  # Import, API keys, brand profile
│   ├── lib/
│   │   ├── api.ts                     # Typed API client
│   │   ├── auth.ts                    # Session management
│   │   └── supabase.ts                # Supabase client
│   └── package.json
│
├── render.yaml                        # Render Blueprint (infrastructure-as-code)
├── docker-compose.yml                 # Local dev with containers
├── start.ps1 / stop.ps1               # Windows one-command launcher
└── README.md
```

---

## Environment Variables

### CRM Service (`crm/.env`)

```env
# Supabase
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...          # service_role key

# Groq (LLM + Embeddings)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.3-70b-versatile

# Redis
REDIS_URL=redis://localhost:6379/0

# Run tasks in-process (set true on Render free tier to save memory)
CELERY_TASK_ALWAYS_EAGER=false

# Channel service
CHANNEL_SERVICE_URL=http://localhost:8001

# Public URL (for email tracking pixels/links)
PUBLIC_BASE_URL=http://localhost:8000

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# App
PORT=8000
DEBUG=true
ALLOWED_ORIGINS=http://localhost:3000
```

### Channel Service (`channel/.env`)

```env
# Redis
REDIS_URL=redis://localhost:6379/0

# CRM callback URL
CRM_RECEIPT_URL=http://localhost:8000/api/v1/receipts

# SMTP (Email)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com

# Twilio (WhatsApp/SMS) — optional
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_SMS_FROM=+1234567890
TWILIO_WHATSAPP_FROM=whatsapp:+1234567890
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_CRM_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## Running Locally

### Prerequisites

- Python 3.11+
- Node.js 18+
- Redis (Docker or portable binary)

### Quick Start (Windows)

```powershell
# Start everything (Redis, both APIs, Celery workers, frontend):
powershell -File .\start.ps1

# Stop everything:
powershell -File .\stop.ps1
```

### Manual Setup (Cross-Platform)

```bash
# 1. Clone
git clone https://github.com/nandha-07/xeno-mini-crm
cd xeno-mini-crm

# 2. Redis
docker run -d -p 6379:6379 redis:7-alpine

# 3. CRM Backend
cd crm
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # fill in Supabase + Groq keys

# 4. Run Supabase schema
# Paste crm/db/schema.sql into Supabase SQL editor, then run migrations

# 5. Start CRM
uvicorn main:app --reload --port 8000

# 6. Start Celery worker (new terminal)
celery -A celery_app worker --loglevel=info --queues=crm

# 7. Channel Service (new terminal)
cd ../channel
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8001

# 8. Channel Celery (new terminal)
celery -A celery_app worker --loglevel=info --queues=channel

# 9. Frontend (new terminal)
cd ../frontend
npm install
cp .env.local.example .env.local  # fill in URLs
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

### Render (Backend)

The `render.yaml` Blueprint defines all three services:

**orbit-crm:**
| Setting | Value |
|---------|-------|
| Runtime | Python 3.11 |
| Root Dir | `crm` |
| Build | `pip install -r requirements.txt` |
| Start | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

**orbit-channel:**
| Setting | Value |
|---------|-------|
| Runtime | Python 3.11 |
| Root Dir | `channel` |
| Build | `pip install -r requirements.txt` |
| Start | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

**orbit-redis:** Render Redis (free tier)

> **Free-tier note:** Set `CELERY_TASK_ALWAYS_EAGER=true` on `orbit-crm` to run background tasks in-process (saves ~150MB RAM). Embeddings use the Groq API instead of local ONNX models (saves ~300MB RAM).

**After first deploy, cross-link the services:**
- `orbit-crm` → `CHANNEL_SERVICE_URL` = `https://orbit-channel.onrender.com`
- `orbit-channel` → `CRM_RECEIPT_URL` = `https://orbit-crm.onrender.com/api/v1/receipts`

### Vercel (Frontend)

1. Connect GitHub repo → set root directory to `frontend`
2. Framework preset: Next.js
3. Add env vars: `NEXT_PUBLIC_CRM_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
4. Auto-deploys on push to `main`

---

## Design Decisions & Tradeoffs

| Decision | Rationale |
|----------|-----------|
| **Multi-tenant via `org_id`** | Every table scoped by org; `X-Org-Id` header enforced in app layer. At scale: push to Supabase RLS. |
| **Groq API embeddings (no local ONNX)** | Eliminates ~300MB memory footprint — critical for Render's 512MB free tier. Falls back to hash-based embeddings if API unavailable. |
| **In-process Celery (`CELERY_TASK_ALWAYS_EAGER`)** | Saves ~150MB by avoiding a separate worker process. Tasks run synchronously in the request thread. |
| **Two-service messaging loop** | Models real provider behavior (Twilio-style webhook callbacks). Channel service is a separate deployable process. |
| **RFM scoring in pandas** | Works up to ~1M customers. At scale: push to PostgreSQL `GROUP BY` + window functions. |
| **Client-side sessions** | Demo-grade auth (localStorage). At scale: server-side JWT with RBAC roles. |
| **Groq free tier** | Rate-limited at ~30 req/min. Production: add a queue, or upgrade to paid tier / self-host via vLLM. |
| **Supabase free tier** | 500MB DB, 2GB egress. Production: dedicated Postgres with read replicas. |

---

## Author

**Nandha Kumar K**
- GitHub: [@nandha-07](https://github.com/nandha-07)
