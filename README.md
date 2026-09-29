# 🛡️ Incident Response Agent
### *Persistent Memory Decision-Support Assistant for Production Incidents*

Built for Hackathons & Production SRE Teams. Powered by **Hindsight Cloud** & **Groq**.

---

## 💡 The Core Problem & Differentiator

When a production incident occurs, traditional AI agents **start from zero**. They have no organizational context, no record of past outages, and no memory of what previously worked or failed.

**Incident Response Agent** solves this with **true persistent memory**:
* It **RECALLS** matching historical postmortems, symptoms, and previous root causes from **Hindsight Cloud** memory bank (`unicase-incident-memory`).
* It synthesizes live telemetry against historical evidence using **Groq** high-speed LLM inference.
* When the incident is mitigated, the engineer's confirmed root cause and remediation are **RETAINED** directly back into Hindsight Cloud — transforming today's fire into tomorrow's immediate institutional memory.

> ⚠️ **Safety Boundary:** This system provides **diagnostic decision-support and investigation guidance**. It does **not** claim to automatically execute destructive production mutations. All remediation actions are reviewed and executed by authorized engineers.

---

## 🔄 End-to-End Workflow

```
       New Incident Alert (Symptoms, Logs, Service)
                            │
                            ▼
              [ 1. Incident Intake & Analysis ]
                            │
                            ▼
                 [ 2. Hindsight Cloud RECALL ]
             (Target Bank: unicase-incident-memory)
                            │
             ┌──────────────┴──────────────┐
             ▼                             ▼
   [ Historical Evidence ]       [ Current Incident Facts ]
   • Previous Root Causes        • Real-time stack traces
   • Past Successful Fixes       • Service latency & error rates
             │                             │
             └──────────────┬──────────────┘
                            ▼
               [ 3. Groq LLM Reasoning ]
             (Model: qwen/qwen3.8-27b on Groq)
                            │
                            ▼
             [ 4. AI Investigation Report ]
             • Suspected Root Causes with Precedent Citations
             • Safe Diagnostic CLI / Query Commands
             • Telemetry vs Historical Evidence Separation
                            │
                            ▼
             [ 5. Engineer Verifies & Mitigates ]
                            │
                            ▼
                 [ 6. Hindsight Cloud RETAIN ]
             (Target Bank: unicase-incident-memory)
                            │
                            ▼
       [ 7. Eternal Cross-Session Memory for Future Incidents ]
```

---

## 🛠️ Tech Stack

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Axios
* **Backend:** Python 3.10+, FastAPI, Uvicorn, Pydantic v2
* **Memory Layer:** **Hindsight Cloud** (Managed API: `https://api.hindsight.vectorize.io`, Memory Bank: `unicase-incident-memory`)
* **LLM Engine:** **Groq Official API** (`qwen/qwen3.8-27b` / `openai/gpt-oss-120b`)

---

## 📂 Project Structure

```
incident-response-agent/
├── .env                         # Secrets (Groq API Key, Hindsight Cloud Key)
├── .env.example                 # Template for environment variables
├── .gitignore                   # Excludes secrets, venvs, and node_modules
├── start.sh                     # One-click launcher for backend + frontend
├── README.md                    # Project documentation
│
├── backend/
│   ├── requirements.txt         # FastAPI, Groq, Hindsight client, Uvicorn
│   ├── run.sh                   # Backend startup script
│   └── app/
│       ├── main.py              # FastAPI entrypoint & CORS
│       ├── config.py            # Environment & credential configuration
│       ├── memory/
│       │   └── hindsight.py     # Real Hindsight Cloud client (RECALL & RETAIN)
│       ├── llm/
│       │   ├── groq_client.py   # Groq SDK reasoning client
│       │   └── prompts.py       # Fact / Evidence / Suggestion boundary prompts
│       ├── models/
│       │   └── schemas.py       # Pydantic schemas
│       └── routes/
│           ├── incidents.py     # /api/incidents (analyze, recall, resolve)
│           ├── memories.py      # /api/memories (bank inspection, seed)
│           └── health.py        # /api/health (live connectivity status)
│
└── frontend/
    ├── package.json             # React 18, Vite, Tailwind, Lucide
    ├── vite.config.js           # API proxy & dev server config
    └── src/
        ├── App.jsx              # Main incident dashboard
        ├── services/api.js      # Backend API communication
        └── components/
            ├── Header.jsx       # Status badges & memory controls
            ├── IncidentForm.jsx # New incident intake + Demo presets
            ├── MemoryRecallCard.jsx # Recalled Hindsight precedents
            ├── InvestigationReport.jsx # Separated reasoning & diagnostic steps
            ├── ResolutionModal.jsx  # Engineer post-mortem & Hindsight RETAIN
            ├── MemoryBankViewer.jsx # Live inspector of Hindsight Cloud bank
            └── IncidentHistory.jsx  # Active session incident tracker
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Configure Environment
Your `.env` file is already created. For reference, `.env.example` contains:
```bash
# Groq API Configuration
GROQ_API_KEY=gsk_...
GROQ_MODEL=qwen/qwen3.8-27b

# Hindsight Cloud Configuration
HINDSIGHT_API_KEY=hsk_...
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=unicase-incident-memory

# Server Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
```

### 3. Start the Full Application (One-Click)
Run the automated launcher from the repository root:
```bash
./start.sh
```

Or start the services individually:
* **Backend:**
  ```bash
  ./backend/run.sh
  # Runs on http://localhost:8000
  # OpenAPI Docs at http://localhost:8000/docs
  ```
* **Frontend:**
  ```bash
  cd frontend
  npm run dev
  # Runs on http://localhost:5173
  ```

---

## 🧪 Hackathon Demo Script (3-Minute Walkthrough)

1. **Verify Connectivity:**
   Open `http://localhost:5173`. Check the header status indicators:
   * **Hindsight Cloud**: Connected to `unicase-incident-memory` (green badge).
   * **Groq LLM**: Connected to `qwen/qwen3.8-27b` (green badge).

2. **Inspect or Seed Historical Memories:**
   * Click **"Bank Memories"** in the header to view live persistent memory units in Hindsight Cloud.
   * Click **"Seed Precedents"** to load 3 verified real-world outage postmortems (e.g. *Payment Gateway 504 Timeout Surge*, *Kafka Consumer Lag Storm*, *PostgreSQL Deadlock Surge*).

3. **Simulate a New Incident:**
   * In the incident intake form, click the **"Payment Gateway"** preset.
   * Click **"Preview Hindsight RECALL Only"**: witness Hindsight Cloud return matching historical memories with relevance scores in milliseconds without LLM cost.
   * Click **"Analyze Incident (RECALL → LLM Reasoning)"**.

4. **Observe the Investigation Report:**
   * **Historical Evidence (Hindsight Cloud):** Displays the previous Redis pool exhaustion outage from the bank.
   * **Current Facts:** Separates the live 504 status codes and Jedis stack traces.
   * **Suspected Root Causes:** Correlates the current failure to historical precedent.
   * **Safe Diagnostic Commands:** Copyable read-only commands for engineers (`kubectl logs`, Redis stats).

5. **Complete the Feedback Loop (RETAIN):**
   * Click **"Resolve & RETAIN to Hindsight"**.
   * Fill out the remediation (or click *"Auto-fill top hypothesis"*).
   * Click **"Commit Resolution & RETAIN to Hindsight"**.
   * Hindsight Cloud executes a live `POST /v1/default/banks/unicase-incident-memory/memories` call.
   * Reopen **"Bank Memories"** to see your newly retained incident permanently stored in Hindsight Cloud!

---

## 🔒 Security
- All credentials are exclusively loaded from environment variables (`.env`).
- `.env` is strictly excluded in `.gitignore`.
