# CogniSolve Deployment Plan

This guide outlines the step-by-step process for deploying the CogniSolve platform from a local development environment to a production environment. 

## 🏗️ 1. Architecture & Tech Stack Recommendations

Based on your tech stack (Next.js 16+, Flask/Python, Scikit-Learn/XGBoost Models, PostgreSQL), here are the best hosting platforms for a seamless deployment:

1. **Frontend (Next.js + Tailwind CSS): Vercel**
   - **Why?** Vercel is the creator of Next.js. It natively supports the App Router, Server Components, and zero-config deployment.
2. **Backend (Flask + ML Models): Render or Railway**
   - **Why?** Both platforms make Python web service deployment extremely easy from a GitHub repository. They handle `requirements.txt` natively and provide enough RAM to load your ML pipelines and `.joblib` models.
3. **Database (PostgreSQL): Supabase**
   - **Why?** Supabase gives you a powerful serverless PostgreSQL database with an instant connection URL that seamlessly plugs into your backend. It also features a built-in SQL Editor to easily initialize your schema.

---

## 🚀 2. Step-by-Step Deployment Process

### Step 1: Prepare the Codebase for Production

1. **Commit your code to GitHub:** Ensure both your `frontend/` and backend root directories are pushed to a single GitHub repo (or split into two repos for backend/frontend separation).
2. **Include the ML Models:** Ensure `services/trained_models/*.joblib` are not ignored in your `.gitignore` (unless they are too large, in which case you need Git LFS. Yours are likely small enough for standard git).
3. **Tweak the Backend:** Your `run.py` should run dynamically on the port assigned by the host. (Ensure it uses `port=int(os.environ.get("PORT", 5000))`).

### Step 2: Deploy the Database (Using Supabase)

1. Go to [Supabase.com](https://supabase.com/) and sign in with GitHub, then click **New Project**.
2. Set your organization, project name, and a secure database password (don't lose this!).
3. Once the project is provisioned, go to **Project Settings -> Database**.
4. Scroll down to the **Connection string** section, select **URI**, and copy the string (starts with `postgresql://...`). *Make sure to replace `[YOUR-PASSWORD]` in the string with the password you set.*
5. Go to the **SQL Editor** tab on the left sidebar.
6. Paste your local `db/schema.sql` code into the editor and click **Run** to create the `complaints` and `sla_events` tables.

### Step 3: Deploy the Python Backend (On Render)

1. Sign up on [Render](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. **Configuration:**
   - **Name:** `cognisolve-api`
   - **Root Directory:** Keep blank (`/`) if your Python app is at the root.
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt` (Render often auto-detects this).
   - **Start Command:** `gunicorn run:app` (You will need to run `pip install gunicorn` and add it to your `requirements.txt` first).
5. **Environment Variables:** Add the following:
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
     *(Or pass the single PostgeSQL URL via a `DATABASE_URL` variable if your `db.py` supports it)*
   - `SARVAM_API_KEY` (Your actual Sarvam key)
   - `APP_DEBUG`: `false`
6. Click **Deploy Web Service`.
7. Once successfully deployed, copy the Render URL (e.g., `https://cognisolve-api.onrender.com`).

*Note regarding Ollama (AI Generation)*: If you use the Ollama Resolution Engine, Ollama cannot easily run on a standard PaaS like Render because it requires GPU or heavy CPU virtualization. For production, either:
- Continue using the system's template fallback feature.
- Use a hosted API like OpenAI / Anthropic instead of Ollama.
- Deploy a dedicated VPS on DigitalOcean or AWS EC2 specifically to run the Ollama docker container.

### Step 4: Deploy the Next.js Frontend (On Vercel)

1. Go to [Vercel](https://vercel.com/) and sign in with GitHub.
2. Click **Add New... -> Project**.
3. Select your GitHub repository.
4. **Configuration:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend` (Since your Next.js app is inside the `frontend/` folder).
5. **Environment Variables:**
   - You need to connect your frontend to the new backend. 
   - Add an environment variable (often `NEXT_PUBLIC_API_URL` or however your HTTP requests in React are coded): `https://cognisolve-api.onrender.com` 
   - *Important:* You'll need to globally update your `fetch("/api/...")` routes in React to point to the live backend URL instead of hardcoded strings unless you setup Vercel Rewrites (`next.config.js`).
6. Click **Deploy**. Vercel will build the frontend and give you a live URL (e.g., `cognisolve.vercel.app`).

### Step 5: Final Connectivity Check

1. Go to your new frontend Vercel URL.
2. Try submitting a new complaint via the Dashboard.
3. If it fails, open your browser Console (F12) and check if CORS is failing or if the API endpoint is incorrect. You may need to update `flask-cors` in your backend `run.py` to allow traffic from your Vercel URL: 
   ```python
   # In app initialization
   CORS(app, resources={r"/*": {"origins": ["https://cognisolve.vercel.app"]}})
   ```
4. Verify the Dashboard stats update.
5. Create a test PDF/CSV export.

---

## Technical Checklist Before Launch

- [ ] Add `gunicorn` to `requirements.txt`.
- [ ] Make sure CORS allows your frontend domain.
- [ ] Connect your frontend API calls dynamically using `process.env.NEXT_PUBLIC_API_URL`.
- [ ] Turn off Debug mode (`APP_DEBUG=false`) on the production backend.
- [ ] Create initial tables on the production Postgres instance.
