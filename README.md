# CogniSolve AI — Smart Complaint Management System

**CogniSolve** is your AI-powered customer support assistant. It automatically reads complaints, figures out what they're about, decides how urgent they are, and suggests solutions—all without manual work.

Think of it as having a smart assistant who never sleeps, never misses a deadline, and always explains their reasoning.

## ✨ What It Does

- **Sorts complaints** automatically into the right categories
- **Identifies urgency** — high, medium, or low priority
- **Watches deadlines** so nothing falls through the cracks
- **Suggests resolutions** using AI (no more staring at blank screens)
- **Shows its reasoning** — see exactly why the AI made each decision
- **Real-time dashboards** to track everything at a glance

## 🏗️ How It Works

The system has three main parts:

1. **Backend API** (Flask) — Does all the heavy lifting
2. **Machine Learning** — Makes smart predictions on text
3. **Frontend Dashboard** (Next.js) — Beautiful interface to manage everything

When a complaint comes in, the API feeds it to the ML models, which predict the category and priority, then stores it in the database. Simple as that.

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                           │
│  Next.js Dashboard (Port 3000)                             │
│  - Action Center                                            │
│  - Analytics Dashboard                                      │
│  - SLA Tracking                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP Requests
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                              │
│  Flask Server (Port 5000)                                  │
│  - Complaint Processing                                     │
│  - ML Pipeline Orchestration                               │
│  - SLA Management                                           │
│  - Database Operations                                      │
└──────────┬──────────────────────────────────┬───────────────┘
           │                                  │
           ▼                                  ▼
    ┌─────────────────┐          ┌──────────────────────┐
    │  ML MODELS      │          │   DATABASE           │
    │  - Classifier   │          │   PostgreSQL 14+     │
    │  - Priority     │          │                      │
    │  - Feature Eng  │          │   Tables:            │
    └─────────────────┘          │   - complaints       │
           │                     │   - sla_events       │
           ▼                     │   - agents           │
    ┌─────────────────┐          │   - labels           │
    │  OLLAMA LLM     │          └──────────────────────┘
    │  (Optional)     │
    │  Resolution     │
    │  Generation     │
    └─────────────────┘
```

## 🏢 Project Structure

```
CogniSolve/
├── backend/                    # Python Flask API
│   ├── config/                # Configuration files
│   ├── db/                    # Database schema & connection
│   ├── models/                # Data models (Complaint, SLA, Agent)
│   ├── routes/                # API endpoints
│   ├── services/              # Business logic & ML
│   │   ├── classifier.py      # Classification logic
│   │   ├── feature_engine.py  # Feature extraction
│   │   ├── sla_middleware.py  # SLA tracking
│   │   └── train_model.py     # Model training
│   ├── datasets/              # Training data
│   └── run.py                 # Entry point
│
├── frontend/                  # Next.js React App
│   ├── src/
│   │   ├── app/               # Pages & layouts
│   │   │   ├── action-center/ # Submit complaints
│   │   │   ├── analytics/     # Dashboard & reports
│   │   │   ├── operations/    # Ops management
│   │   │   └── qa/            # QA review board
│   │   └── api/               # API routes
│   └── package.json
│
└── README.md                  # This file
```

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16, React, Tailwind CSS | User Interface & Dashboards |
| **Backend** | Flask, Python 3.10+ | API & Business Logic |
| **ML Engine** | scikit-learn, joblib | Classification & Predictions |
| **LLM** | Ollama (llama3) | Resolution Generation |
| **Database** | PostgreSQL 14+ | Data Storage |
| **Data Processing** | Pandas, NumPy | Feature Engineering |

## 💾 Database Schema

**complaints** table
- ID, Category, Priority, Text, Status
- SLA Deadline, Confidence Score
- Created/Updated timestamps

**sla_events** table
- Event log for tracking ticket lifecycle
- Events: created, assigned, breached, resolved
- Immutable audit trail

**agents** table
- User/agent information
- Roles and permissions

**classification_labels** table
- Reference data for categories and priorities
- Lookup tables for valid values

## 🚀 Getting Started

### Prerequisites
- **Python** 3.10+
- **Node.js** 18+
- **PostgreSQL** 14+ (running on port 5432)
- **Ollama** (optional, for AI-generated resolutions) — `ollama run llama3`

### Setup in 5 Minutes

**1. Create a PostgreSQL database:**
```bash
CREATE DATABASE cognisol;
```

**2. Set up the backend:**
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Train the models (one-time setup)
python -m services.train_model

# Start the API
python run.py
```
The API runs on `http://localhost:5000`

**3. Set up the frontend:**
```bash
cd frontend

npm install
npm run dev
```
Open `http://localhost:3000` and you're ready to go!

## 📖 API Quick Reference

| Method | Endpoint | What It Does |
| :--- | :--- | :--- |
| `POST` | `/api/complaints/submit` | Submit a new complaint for processing |
| `PATCH` | `/api/complaints/:id/status` | Update complaint status |
| `GET` | `/api/dashboard/stats` | Get dashboard statistics |
| `POST` | `/api/dashboard/sla-check` | Check for SLA breaches |
| `GET` | `/api/export/pdf` | Export report as PDF |

## 📚 More Info

For detailed architecture docs, see [ARCHITECTURE_AND_DEPLOYMENT.md](ARCHITECTURE_AND_DEPLOYMENT.md)

---

**Have questions?** Check out the docs or dive into the code. It's well-commented and approachable.
