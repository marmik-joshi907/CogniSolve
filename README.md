# CogniSolve - Project Architecture & Deployment Guide

<div align="center">
  <h1>🤖 CogniSolve AI</h1>
  <p><strong>Intelligent Complaint Classification & Resolution System</strong></p>
  <p>Enterprise-grade customer support automation platform with ML-powered classification, SLA tracking, and AI-driven resolution recommendations.</p>
</div>

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Tech Stack](#tech-stack)
4. [Machine Learning Models](#machine-learning-models)
5. [Project Structure](#project-structure)
6. [Deployment Guide](#deployment-guide)
7. [Configuration](#configuration)
8. [API Documentation](#api-documentation)
9. [Development Setup](#development-setup)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**CogniSolve AI** is an advanced, enterprise-grade customer support platform that automates the entire complaint lifecycle:

### Core Capabilities

✅ **Intelligent Auto-Classification**
- Automatically reads and categorizes complaints into `Product`, `Packaging`, or `Trade` categories
- Uses custom Logistic Regression models trained on historical complaint data
- Provides confidence scores for each prediction

✅ **Predictive Escalation**
- Intelligently predicts priority levels: `High`, `Medium`, or `Low`
- Calculates strict SLA deadlines based on priority
- Exposes top influencing keywords for transparency

✅ **Active SLA Breach Engine**
- Proactive daemon monitors all tickets against calculated deadlines
- Instantly marks tickets as breached if they exceed designated timeframes
- Tracks SLA lifecycle events (created, assigned, escalated, breached, resolved, closed)

✅ **Generative AI Resolution**
- Recommends context-aware resolution paths using integrated Ollama LLM
- Falls back to intelligent template-based suggestions when LLM unavailable
- Priority-specific resolution templates for Product, Packaging, and Trade categories

✅ **Model Explainability (XAI)**
- Eliminates the "Black Box" of ML predictions
- Exposes top 5 influencing keywords for each classification
- Provides natural language reasoning for priority assignments (e.g., *"Model detected high-severity patterns with 85% confidence"*)
- Shows per-class probability mappings

✅ **Executive Dashboards**
- 3 beautiful, role-based dashboards built with Next.js 16
- Real-time countdown SLA timers
- Interactive metrics and KPI tracking
- CSV/PDF export capabilities for complaints and analytics

---

## 🏗️ System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER (Next.js 16)                    │
│  ┌──────────────────┬──────────────────┬──────────────────┐             │
│  │  Dashboard Page  │  Complaint Log   │  Analytics Page  │             │
│  │  (Executive KPIs)│  (CRUD Ops)      │  (Trend Analysis)│             │
│  └────────┬─────────┴────────┬─────────┴────────┬─────────┘             │
│           │                  │                  │                       │
│           └──────────────────┼──────────────────┘                       │
│                              │                                          │
│                    HTTP REST API Calls                                  │
│                              │                                          │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼────────────────────────────────────────────────────────────────┐
│                   BACKEND API LAYER (Flask)                           │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ Routes (Blueprints)                                            │   │
│  │ ├── /api/complaints/submit    → Submit & auto-classify        │   │
│  │ ├── /api/complaints           → Get all/filter complaints     │   │
│  │ ├── /api/complaints/{id}      → Get complaint details         │   │
│  │ ├── /api/dashboard/stats      → KPI metrics                   │   │
│  │ ├── /api/export               → CSV/PDF export                │   │
│  │ ├── /api/sarvam/transcribe    → Voice-to-text conversion      │   │
│  │ └── /api/health               → Service status check          │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ ML Pipeline (Services)                                         │   │
│  │ ├── Classifier Service      → Category + Priority prediction  │   │
│  │ ├── Feature Engine          → TF-IDF + SVD + Domain features  │   │
│  │ ├── Resolution Engine       → LLM-based recommendations       │   │
│  │ ├── SLA Middleware          → Deadline calculation            │   │
│  │ ├── Preprocessing Service   → Text cleaning & normalization   │   │
│  │ ├── Validators Service      → Input validation & sanitization │   │
│  │ └── Logger Service          → Structured logging              │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ Data Models (ORM-like)                                         │   │
│  │ ├── Complaint Model         → CRUD for complaints table       │   │
│  │ ├── SLA Model               → SLA events tracking             │   │
│  │ └── Agent Model             → User/agent management           │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────┬──────────────────────┬──────────────────────────┬────────────┘
          │                      │                          │
          ▼                      ▼                          ▼
  ┌──────────────┐      ┌──────────────┐      ┌──────────────────┐
  │ PostgreSQL   │      │   Ollama     │      │  Sarvam API      │
  │  Database    │      │   LLM (Local)│      │  (Voice-to-Text) │
  └──────────────┘      └──────────────┘      └──────────────────┘
       (Complaints,         (Resolution          (Transcription)
        SLA Events,      Recommendations)
        Agents)
```

### Data Flow - Complaint Submission to Resolution

```
1. Frontend: User submits complaint
         ↓
2. Backend: /api/complaints/submit receives request
         ↓
3. Validation: Input sanitization & channel verification
         ↓
4. Classification Service:
   ├─→ Feature Engineer: Extract TF-IDF + SVD + domain features
   ├─→ Category Model: Predict category (Product/Packaging/Trade)
   └─→ Priority Model: Predict priority (High/Medium/Low)
         ↓
5. SLA Middleware: Calculate deadline based on priority
         ↓
6. Resolution Engine:
   ├─→ Try Ollama LLM: Generate context-aware recommendation
   └─→ Fallback: Use template-based suggestion
         ↓
7. Database: Store complaint + SLA event
         ↓
8. Response: Return complaint with predictions + explainability data
         ↓
9. Frontend: Display classification, priority, SLA timer, resolution
```

---

## 💻 Tech Stack

### Backend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Flask | 3.1.0 | RESTful API server |
| **CORS** | Flask-CORS | 5.0.1 | Cross-origin resource sharing |
| **Database Driver** | psycopg2 | 2.9.10 | PostgreSQL connection |
| **ML - Classification** | scikit-learn | ≥1.4.0 | Logistic Regression models |
| **ML - Gradient Boosting** | XGBoost | ≥2.0.0 | Alternative boosting framework |
| **NLP** | NLTK | ≥3.8.0 | Text preprocessing & tokenization |
| **Data Processing** | Pandas | ≥2.0.0 | DataFrames & analytics |
| **Model Serialization** | joblib | ≥1.3.0 | Save/load trained models |
| **PDF Generation** | ReportLab | ≥4.0.0 | PDF export functionality |
| **HTTP Requests** | requests | ≥2.31.0 | External API calls |
| **Environment Config** | python-dotenv | 1.1.0 | .env file loading |
| **Caching** | Redis | 5.2.1 | Session/cache management |
| **Production Server** | Gunicorn | Latest | WSGI application server |

### Frontend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Next.js | 16.2.4 | React meta-framework with SSR |
| **React** | React | 19.2.4 | UI component library |
| **CSS** | Tailwind CSS | ^4 | Utility-first styling |
| **Linting** | ESLint | ^9 | Code quality |
| **PostCSS** | PostCSS | ^4 | CSS post-processor |

### Database
- **PostgreSQL**: Primary relational database
- **Tables**: `complaints`, `sla_events`, `agents`, `classification_labels`
- **Connection**: psycopg2 (DSN-based)

### External Services
- **Ollama**: Local LLM for resolution recommendations (optional)
- **Sarvam API**: Voice transcription service
- **Vercel**: Recommended frontend hosting
- **Render/Railway**: Recommended backend hosting
- **Supabase**: Recommended PostgreSQL hosting

---

## 🧠 Machine Learning Models

### Model Architecture Overview

CogniSolve uses a **Dual-Model Logistic Regression Pipeline** optimized for complaint text classification:

```
Raw Complaint Text
       ↓
┌──────────────────────────────────┐
│  Preprocessing Service           │
│  • Lowercase conversion           │
│  • Punctuation removal            │
│  • Tokenization                   │
│  • Stopword removal               │
└────────┬─────────────────────────┘
         ↓
┌──────────────────────────────────┐
│  Feature Engineer                │
│  ├─ TF-IDF Vectorization         │
│  │  (max 5,000 features)         │
│  ├─ Truncated SVD                │
│  │  (100 components)             │
│  ├─ Domain Metadata Injection    │
│  │  • Keyword Urgency Scores     │
│  │  • Word Lengths               │
│  │  • Output Counts              │
│  └─ Final Feature Matrix         │
└────────┬─────────────────────────┘
         ↓
      ┌──┴──┐
      ↓     ↓
┌──────────────────┐    ┌──────────────────┐
│ Category Model   │    │ Priority Model   │
│ (Logistic Reg.)  │    │ (Logistic Reg.)  │
│                  │    │                  │
│ Output Classes:  │    │ Output Classes:  │
│ • Product        │    │ • High           │
│ • Packaging      │    │ • Medium         │
│ • Trade          │    │ • Low            │
│ • Other          │    │                  │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         └───────────┬───────────┘
                     ↓
         ┌───────────────────────┐
         │ Model Explainability  │
         │ • Top 5 Keywords      │
         │ • Confidence Score    │
         │ • Priority Reason     │
         │ • Class Probabilities │
         └───────────────────────┘
                     ↓
         Final Prediction Output
```

### Model Training Details

#### 1. **Category Classifier Model**
- **Algorithm**: Logistic Regression (multinomial, lbfgs solver)
- **Input Features**: 100-dimensional (from TF-IDF → SVD + domain features)
- **Output Classes**: `Product`, `Packaging`, `Trade`, `Other`
- **Training Data**: Historical complaint CSV (TS-PS14.csv)
- **Performance**: Optimized for precision and recall balance

#### 2. **Priority Classifier Model**
- **Algorithm**: Logistic Regression (multinomial, lbfgs solver)
- **Input Features**: Same 100-dimensional feature vector
- **Output Classes**: `High`, `Medium`, `Low`
- **Training Data**: Historical complaint severity patterns
- **Importance**: Drives SLA deadline calculation

#### 3. **Feature Engineer Pipeline**
Responsible for transforming raw text into a dense numerical representation:

**Step 1: TF-IDF Vectorization**
- Converts text into term frequency-inverse document frequency matrix
- Maximum 5,000 features extracted
- Captures semantic importance of words

**Step 2: Truncated SVD (Dimensionality Reduction)**
- Reduces from 5,000 features → 100 components
- Filters noise while preserving semantic structure
- Improves model performance and inference speed

**Step 3: Domain Metadata Injection**
Appends domain-specific features to the SVD output:
- **Keyword Urgency Scores**: Presence of urgent terms (urgent, critical, broken, etc.)
- **Word Lengths**: Average word length (indicates technical vs. simple language)
- **Output Counts**: Special character and punctuation analysis

### Explainability (XAI) System

The system extracts interpretable insights from ML predictions:

#### **Top Keywords Extraction**
```python
# Leverages model coefficients to identify most influential words
# For each class, extracts feature importance scores
# Returns top 5 keywords that triggered the prediction
```

Example Output:
```json
{
  "category": "Product",
  "category_confidence": 0.92,
  "top_keywords": ["broken", "defective", "quality", "damaged", "replacement"],
  "priority": "High",
  "priority_confidence": 0.88,
  "priority_reason": "ML model detected high-severity patterns with 88% confidence. Key signals: broken, damaged, urgent, immediate.",
  "class_probabilities": {
    "Product": 0.92,
    "Packaging": 0.05,
    "Trade": 0.02,
    "Other": 0.01
  }
}
```

#### **Priority Reason Templates**
The system generates human-readable explanations based on:
1. **Keyword-based**: If urgency keywords detected
2. **ML-based**: If model confidence high, shows influencing keywords
3. **Default**: Generic explanation if no clear signals

### Model Files

All trained models are serialized using `joblib` and stored in `backend/services/trained_models/`:

| File | Description |
|------|-------------|
| `category_model.joblib` | Trained Logistic Regression for category prediction |
| `priority_model.joblib` | Trained Logistic Regression for priority prediction |
| `feature_engineer.joblib` | Pipeline for TF-IDF, SVD, and domain features |
| `label_encoders.joblib` | Encoder mapping for category/priority labels |
| `keyword_importance.joblib` | Pre-computed keyword importance scores (optional) |

### Fallback Classification

If ML models fail to load, the system gracefully falls back to **rule-based classification**:

```python
# High Priority Keywords
urgent, immediately, asap, critical, emergency, broken, destroyed,
hazard, dangerous, toxic, harm, injury, legal, lawsuit, contaminated,
recall, allergic, severe, terrible

# Medium Priority Keywords
damaged, defective, incorrect, wrong, missing, delayed, late,
poor, bad, disappointed, unhappy, frustrated, faulty, return

# Low Priority (Default)
Any complaint without above keywords
```

### Model Training Pipeline

To retrain models with new data:

```bash
# Run training script
python -m backend.services.train_model

# This will:
# 1. Load training dataset (CSV)
# 2. Preprocess text
# 3. Extract features using FeatureEngineer
# 4. Train category_model (Logistic Regression)
# 5. Train priority_model (Logistic Regression)
# 6. Compute keyword importance scores
# 7. Serialize all models to .joblib files
```

---

## 📁 Project Structure

```
CogniSolve/
│
├── README.md                          # Main project readme
├── ARCHITECTURE_AND_DEPLOYMENT.md     # This file
├── deploy.md                          # Deployment guide
│
├── backend/                           # Python Flask API
│   ├── run.py                         # Application entry point
│   ├── requirements.txt               # Python dependencies
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py                # Configuration loader (.env)
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── connection.py              # PostgreSQL connection pool
│   │   └── schema.sql                 # Database schema
│   │
│   ├── models/                        # Data models (ORM-like)
│   │   ├── __init__.py
│   │   ├── complaint.py               # Complaint CRUD
│   │   ├── sla.py                     # SLA event tracking
│   │   └── agent.py                   # Agent/user management
│   │
│   ├── routes/                        # API endpoints (Blueprints)
│   │   ├── __init__.py
│   │   ├── complaints.py              # /api/complaints/* routes
│   │   ├── dashboard.py               # /api/dashboard/* routes
│   │   ├── export.py                  # /api/export/* routes
│   │   └── sarvam.py                  # /api/sarvam/* routes
│   │
│   ├── services/                      # Business logic & ML
│   │   ├── __init__.py
│   │   ├── classifier.py              # ML classification service
│   │   ├── feature_engine.py          # TF-IDF, SVD, domain features
│   │   ├── resolution_engine.py       # Ollama/template-based resolution
│   │   ├── preprocessing.py           # Text cleaning & normalization
│   │   ├── validators.py              # Input validation
│   │   ├── logger.py                  # Structured logging
│   │   ├── sla_middleware.py          # SLA deadline calculation
│   │   ├── train_model.py             # ML model training pipeline
│   │   ├── mock_classifier.py         # Testing/demo classifier
│   │   │
│   │   └── trained_models/            # Serialized .joblib models
│   │       ├── category_model.joblib
│   │       ├── priority_model.joblib
│   │       ├── feature_engineer.joblib
│   │       ├── label_encoders.joblib
│   │       └── keyword_importance.joblib
│   │
│   ├── datasets/
│   │   └── TS-PS14.csv                # Training data
│   │
│   ├── logs/                          # Application logs
│   │
│   ├── test_api.py                    # API integration tests
│   ├── test_classify.py               # ML classification tests
│   ├── check_db.py                    # DB connection verification
│   └── migrate_sla_constraint.py      # Database migration scripts
│
├── frontend/                          # Next.js React Application
│   ├── package.json                   # Node dependencies
│   ├── next.config.mjs                # Next.js configuration
│   ├── jsconfig.json                  # JS path aliases
│   ├── eslint.config.mjs              # ESLint rules
│   ├── postcss.config.mjs             # PostCSS config
│   ├── tailwind.config.js             # Tailwind CSS config
│   │
│   ├── README.md                      # Frontend readme
│   ├── public/                        # Static assets
│   │
│   ├── src/
│   │   └── app/                       # Next.js 16 App Router
│   │       ├── layout.js              # Root layout
│   │       ├── page.js                # Home/dashboard page
│   │       ├── globals.css            # Global styles
│   │       │
│   │       ├── complaint-log/
│   │       │   └── page.js            # Complaint listing & CRUD
│   │       │
│   │       ├── dashboard/
│   │       │   └── page.js            # Executive dashboard
│   │       │
│   │       ├── analytics/
│   │       │   └── page.js            # Analytics & KPI tracking
│   │       │
│   │       ├── action-center/
│   │       │   └── page.js            # Bulk action management
│   │       │
│   │       ├── operations/
│   │       │   └── page.js            # Ops team dashboard
│   │       │
│   │       ├── qa/
│   │       │   └── page.js            # QA approval dashboard
│   │       │
│   │       └── api/
│   │           └── sarvam/
│   │               └── transcribe/
│   │                   └── route.js   # Voice transcription endpoint
│   │
│   └── [maintenance scripts]
│       ├── patch_sidebar.py
│       ├── patch_settings.py
│       ├── patch_ops_modal.py
│       ├── fix_auth_scope.py
│       ├── fix_syntax.py
│       └── ... (other utility scripts)
│
└── scratch/
    └── test_submit.py                 # Development/testing script
```

---

## 🚀 Deployment Guide

### Prerequisites

Before deployment, ensure you have:

- [ ] GitHub repository with both backend and frontend code
- [ ] PostgreSQL database (Supabase recommended)
- [ ] Ollama LLM installed locally or API endpoint
- [ ] Sarvam API key for voice transcription
- [ ] Production-grade Python environment
- [ ] Node.js 18+ for frontend building

### Architecture Recommendation

```
┌─────────────────────────────────────┐
│  Vercel (Next.js Frontend)          │
│  cognisolve.vercel.app              │
└────────────┬────────────────────────┘
             │ HTTPS API Calls
             │
┌────────────▼────────────────────────┐
│  Render (Python Backend)            │
│  cognisolve-api.onrender.com        │
└────────────┬────────────────────────┘
             │ SQL Queries
             │
┌────────────▼────────────────────────┐
│  Supabase (PostgreSQL)              │
│  [project].supabase.co              │
└─────────────────────────────────────┘
```

### Step-by-Step Deployment

#### **Step 1: Prepare Codebase**

1. Ensure all code is committed to GitHub
2. Verify `.gitignore` includes sensitive files but NOT .joblib models (unless too large)
3. Add `gunicorn` to `requirements.txt` if not present
4. Update `run.py` to use environment-based port:
   ```python
   if __name__ == "__main__":
       port = int(os.environ.get("PORT", 5000))
       app.run(host="0.0.0.0", port=port, debug=Config.APP_DEBUG)
   ```

#### **Step 2: Deploy PostgreSQL (Supabase)**

1. Visit [supabase.com](https://supabase.com/) and sign up with GitHub
2. Create new project with secure password
3. Copy PostgreSQL connection URL from **Project Settings → Database → Connection String**
4. Replace `[YOUR-PASSWORD]` in URL
5. Use SQL Editor to run `db/schema.sql`:
   - Creates `complaints` table
   - Creates `sla_events` table
   - Creates `agents` table
   - Inserts default classification labels

#### **Step 3: Deploy Backend (Render)**

1. Visit [render.com](https://render.com/) and sign up with GitHub
2. Create **New Web Service**
3. Connect your GitHub repository
4. Configuration:
   ```
   Name: cognisolve-api
   Root Directory: / (or /backend if separate repo)
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn run:app
   ```
5. Add Environment Variables:
   ```
   DB_HOST: [from Supabase]
   DB_PORT: 5432
   DB_NAME: postgres
   DB_USER: [from Supabase]
   DB_PASSWORD: [from Supabase]
   DATABASE_URL: postgresql://[user]:[password]@[host]:5432/[db]
   
   SARVAM_API_KEY: [your Sarvam API key]
   APP_DEBUG: false
   APP_SECRET_KEY: [generate random 32-char string]
   REDIS_HOST: localhost
   REDIS_PORT: 6379
   
   SLA_HIGH_HOURS: 4
   SLA_MEDIUM_HOURS: 12
   SLA_LOW_HOURS: 24
   ```
6. Click **Deploy Web Service**
7. Copy deployment URL (e.g., `https://cognisolve-api.onrender.com`)

#### **Step 4: Deploy Frontend (Vercel)**

1. Visit [vercel.com](https://vercel.com/) and sign up with GitHub
2. Create **New Project** from GitHub repo
3. Configuration:
   ```
   Framework: Next.js
   Root Directory: frontend/
   ```
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL: https://cognisolve-api.onrender.com
   ```
5. Click **Deploy**
6. Get frontend URL (e.g., `https://cognisolve.vercel.app`)

#### **Step 5: Update CORS Configuration**

Update `backend/run.py` to allow your Vercel frontend:

```python
CORS(app, resources={r"/api/*": {
    "origins": [
        "https://cognisolve.vercel.app",
        "http://localhost:3000"  # Local development
    ]
}})
```

#### **Step 6: Verification**

1. Visit `https://cognisolve.vercel.app`
2. Check browser console (F12) for CORS errors
3. Submit a test complaint
4. Verify classification and resolution display
5. Check dashboard stats update

### Optional: Custom Domain Setup

**For Frontend (Vercel):**
1. Go to Vercel project settings → Domains
2. Add custom domain (e.g., `complaints.company.com`)
3. Update DNS records as per Vercel instructions

**For Backend (Render):**
1. Go to Render project settings → Custom Domain
2. Add custom domain (e.g., `api.complaints.company.com`)
3. Update DNS records

### Monitoring & Maintenance

**Vercel Dashboard:**
- View deployment logs
- Monitor function execution time
- Check error tracking

**Render Dashboard:**
- Monitor backend logs in real-time
- Set up alerts for errors
- Scale compute resources if needed

**Supabase Dashboard:**
- Check database connection logs
- Monitor query performance
- Manage backups

---

## ⚙️ Configuration

### Environment Variables (.env)

Create a `.env` file in the project root:

```bash
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cognisol
DB_USER=postgres
DB_PASSWORD=postgres

# Redis (for caching/sessions)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Application
APP_HOST=0.0.0.0
APP_PORT=5000
APP_DEBUG=false
APP_SECRET_KEY=your-secret-key-here-min-32-chars

# SLA Deadlines (hours)
SLA_HIGH_HOURS=4
SLA_MEDIUM_HOURS=12
SLA_LOW_HOURS=24

# External APIs
SARVAM_API_KEY=your-sarvam-api-key
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=llama3
```

### Database Configuration

#### PostgreSQL Connection String
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

#### Schema Initialization
The backend automatically initializes the schema on first run if tables don't exist.

To manually initialize:
```bash
psql -h [host] -U [user] -d [database] -f backend/db/schema.sql
```

### Logging Configuration

Logs are stored in `backend/logs/` directory with the following structure:

- `app.log`: General application logs
- `classifier.log`: ML classification debug logs
- `sla.log`: SLA breach detection logs
- `error.log`: Application errors

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### **1. Health Check**
```http
GET /api/health
```
**Response (200):**
```json
{
  "status": "healthy",
  "service": "CogniSol Complaint Classification System",
  "version": "2.0.0",
  "ml_models_loaded": true,
  "classification_method": "ml",
  "resolution_engine": "ollama",
  "ollama_status": {
    "available": true,
    "model": "llama3"
  }
}
```

#### **2. Submit Complaint**
```http
POST /api/complaints/submit
Content-Type: application/json

{
  "text": "Product arrived damaged and broken",
  "channel": "email"
}
```

**Response (201):**
```json
{
  "id": 1,
  "complaint_text": "Product arrived damaged and broken",
  "channel": "email",
  "status": "open",
  "category": "Product",
  "category_confidence": 0.92,
  "priority": "High",
  "priority_confidence": 0.88,
  "confidence_score": 0.90,
  "top_keywords": ["broken", "damaged", "product", "arrived", "quality"],
  "priority_reason": "ML model detected high-severity patterns with 88% confidence. Key signals: broken, damaged, urgent.",
  "resolution_text": "IMMEDIATE: Initiate product recall investigation...",
  "sla_deadline": "2026-04-19T08:00:00",
  "sla_remaining": {
    "hours": 4,
    "minutes": 0,
    "total_seconds": 14400,
    "breached": false,
    "display": "4h 0m remaining"
  },
  "sla_breached": false,
  "created_at": "2026-04-19T04:00:00",
  "updated_at": "2026-04-19T04:00:00"
}
```

#### **3. Get All Complaints**
```http
GET /api/complaints?category=Product&priority=High&status=open
```

**Query Parameters:**
- `category`: Product | Packaging | Trade | Other
- `priority`: High | Medium | Low
- `status`: open | in_progress | resolved | closed
- `channel`: call | email | web

**Response (200):**
```json
[
  {
    "id": 1,
    "complaint_text": "...",
    "category": "Product",
    "priority": "High",
    ...
  }
]
```

#### **4. Get Complaint by ID**
```http
GET /api/complaints/1
```

**Response (200):**
```json
{
  "id": 1,
  "complaint_text": "...",
  ...
}
```

#### **5. Update Complaint Status**
```http
PATCH /api/complaints/1/status
Content-Type: application/json

{
  "status": "in_progress"
}
```

**Valid Status Values:** `open`, `in_progress`, `resolved`, `closed`

#### **6. Dashboard Stats**
```http
GET /api/dashboard/stats
```

**Response (200):**
```json
{
  "total_complaints": 150,
  "by_priority": {
    "high": 25,
    "medium": 75,
    "low": 50
  },
  "by_category": {
    "Product": 60,
    "Packaging": 50,
    "Trade": 40
  },
  "by_status": {
    "open": 30,
    "in_progress": 50,
    "resolved": 60,
    "closed": 10
  },
  "sla_breached_count": 5,
  "avg_resolution_time_hours": 8.5
}
```

#### **7. Export Complaints**
```http
POST /api/export/complaints
Content-Type: application/json

{
  "format": "csv",
  "filters": {
    "category": "Product",
    "priority": "High"
  }
}
```

**Format Options:** `csv`, `pdf`

**Response:** File download (application/csv or application/pdf)

#### **8. Voice Transcription (Sarvam)**
```http
POST /api/sarvam/transcribe
Content-Type: multipart/form-data

file: [audio.wav]
```

**Response (200):**
```json
{
  "transcript": "Product arrived damaged and broken",
  "confidence": 0.95
}
```

---

## 💻 Development Setup

### Backend Setup

1. **Clone Repository**
   ```bash
   git clone [repo-url]
   cd CogniSolve/backend
   ```

2. **Create Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create .env File**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize Database**
   ```bash
   python check_db.py
   ```

6. **Train ML Models** (optional, if .joblib files missing)
   ```bash
   python -m services.train_model
   ```

7. **Run Backend**
   ```bash
   python run.py
   # Server starts on http://localhost:5000
   ```

### Frontend Setup

1. **Navigate to Frontend**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create .env.local**
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   # Opens on http://localhost:3000
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

### Running Tests

**Backend Tests:**
```bash
# API integration tests
python test_api.py

# Classification tests
python test_classify.py

# Database connection test
python check_db.py
```

**Frontend Tests:**
```bash
npm test
```

---

## 🔧 Troubleshooting

### Backend Issues

**Problem: Models not loading**
```
[CogniSol] WARNING: Model file not found
[CogniSol] Falling back to rule-based classification
```

**Solution:**
- Train models: `python -m services.train_model`
- Ensure .joblib files exist in `services/trained_models/`
- Check file permissions

**Problem: PostgreSQL connection failed**
```
psycopg2.OperationalError: could not connect to server
```

**Solution:**
- Verify DB credentials in .env
- Check PostgreSQL is running
- Run `python check_db.py` to diagnose

**Problem: Ollama resolution engine unavailable**
```
[Resolution Engine] Ollama not available, using template fallback
```

**Solution:**
- Start Ollama: `ollama serve`
- Verify model is pulled: `ollama pull llama3`
- Check `OLLAMA_URL` in .env

**Problem: Sarvam API transcription fails**
```
Sarvam API error: 401 Unauthorized
```

**Solution:**
- Verify `SARVAM_API_KEY` in .env
- Check API key hasn't expired
- Verify audio file format is supported

### Frontend Issues

**Problem: API calls fail with CORS error**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Update backend CORS configuration in `run.py`
- Verify `NEXT_PUBLIC_API_URL` is correct in `.env.local`
- Ensure backend is running and accessible

**Problem: Classifications not displaying**
```
TypeError: Cannot read property 'category' of undefined
```

**Solution:**
- Check backend `/api/complaints/submit` response
- Verify API response structure matches frontend expectations
- Check browser console for full error

### Database Issues

**Problem: Table already exists**
```
psycopg2.Error: relation "complaints" already exists
```

**Solution:**
- First run succeeds, subsequent runs are safe (ON CONFLICT DO NOTHING)
- Or manually drop table: `DROP TABLE IF EXISTS complaints CASCADE;`

**Problem: Foreign key constraint violation**
```
psycopg2.IntegrityError: insert or update on table violates foreign key
```

**Solution:**
- Ensure referenced agent IDs exist
- Run schema.sql to create default agent records
- Verify data integrity

---

## 📊 Performance Optimization

### Database
- Indexes on frequently queried columns (status, category, priority, created_at)
- Connection pooling via psycopg2
- Prepared statements for parameterized queries

### ML Models
- Truncated SVD reduces feature dimensionality (5000 → 100)
- Logistic Regression provides fast inference
- Model caching at application startup

### Frontend
- Next.js 16 provides built-in code splitting
- Tailwind CSS purges unused styles
- Server-side rendering for faster initial load

### Caching
- Redis integration for session management
- API response caching where appropriate

---

## 📝 License

CogniSolve is proprietary software. All rights reserved.

---

## 📞 Support & Contact

For issues, questions, or feature requests:
1. Check this documentation
2. Review deployment logs
3. Contact the development team

**Key Contact Information:**
- Backend Support: API logs available in `backend/logs/`
- Frontend Support: Browser console and network tab
- Database Support: Supabase dashboard

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-04-19 | ML classifier, SLA engine, Ollama resolution, dashboards |
| 1.0.0 | 2026-03-01 | Initial release with basic complaint CRUD |

---

**Last Updated:** April 19, 2026
**Project Status:** Production Ready ✅
