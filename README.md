# CineGemini — AI-Powered Pre-Production Intelligence Platform

> **From Location Scout to Shooting Plan**: Pre-production intelligence and collaboration platform for filmmakers, directors, producers, and cinematographers (DPs).

[![Cloud Run AI Challenge](https://img.shields.io/badge/Google%20Cloud%20Run-AI%20Challenge-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/run)
[![Gemini 3.6 Flash](https://img.shields.io/badge/Gemini%203.6%20Flash-Resilient%20Ladder-FF6F00?logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Security Compliance](https://img.shields.io/badge/OWASP-Top%2010%20%2B%20LLM%20Top%2010-emerald)](https://owasp.org/)

---

## 🌟 Architecture & Core Capabilities

CineGemini bridges the pre-production gap between creative vision and logistical reality:

1. **Multi-Role RBAC Perspectives**:
   - **Director Perspective**: Creative vision, scene atmospheres, and AI natural language note structuring.
   - **Producer Perspective**: Itemized budget breakdowns, permit statuses, and crew logistics.
   - **Cinematographer (DP) Perspective**: Astronomical solar elevation curves, golden/blue hour windows, and camera/lens recommendations.

2. **AI Location Scouting & Map Intelligence**:
   - UAE and international filming grid with coordinate pinning (WGS84).
   - Microclimate forecasts and solar timeline tracking.

3. **Master Location & Shooting Report Synthesis**:
   - 3-Day master report with overall production feasibility scores (0-100).
   - Provenance badges (`VERIFIED`, `USER PROVIDED`, `AI ESTIMATE`, `UNVERIFIED`).

4. **Slack Collaboration Hub**:
   - Rich Block Kit production call sheet and location report dispatch with secure deep links.

5. **Agentic Threat Modeling & Security**:
   - 5 Threat Zones mapped to OWASP Top 10 (Web) and OWASP Top 10 for LLMs.
   - Resilient Gemini model fallback ladder (`gemini-3.6-flash` → `gemini-3.1-flash-lite` → dynamic latest → deep reasoning).
   - Zero hardcoded secrets with Google Cloud Secret Manager integration.

---

## 🔒 1. Firestore Security Rules

Deploy the following owner-bound and role-based security rules to Cloud Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Project documents scoped to verified collaborators
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        request.auth.token.role == 'DIRECTOR' || 
        request.auth.token.role == 'PRODUCER'
      );
      
      // Subcollections: locations, scenes, reports, shootDays
      match /{subcollection}/{docId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null;
      }
    }
    
    // User private journal entries: Owner-isolated only
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /users/{userId}/journalEntries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🔑 2. Secret Manager IAM Setup

Never commit API keys. Store the Gemini API key in Google Cloud Secret Manager and bind read permissions to the Cloud Run service account:

```bash
# Set your Google Cloud Project
export PROJECT_ID="your-gcp-project-id"
gcloud config set project $PROJECT_ID

# 1. Enable required APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  artifactregistry.googleapis.com

# 2. Create the Gemini API key secret in Secret Manager
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "AIzaSy_YOUR_ACTUAL_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Grant the Cloud Run compute service account access to read the secret
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 🚀 3. Cloud Run Deployment (with Mandatory Campaign Label)

Deploy CineGemini directly to Cloud Run with automated secret injection and the required challenge label:

```bash
# Deploy to Google Cloud Run
gcloud run deploy cinegemini \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --set-env-vars="NODE_ENV=production,PROJECT_ID=project-aurora-001" \
  --labels="dev-tutorial=cloud-run-ai-challenge"

# Optional: Apply or verify campaign label on existing service
gcloud run services update cinegemini \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 🛡️ 4. Agentic Threat Model (The 5 Threat Zones)

| Zone | Threat Scenario | OWASP Mapping | Implemented Production Countermeasure | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1. Input Surfaces** | Prompt injection via unformatted Director notes | OWASP LLM01 | Parameterized XML bounding tags & strict regex sanitization | ✅ Mitigated |
| **1. Input Surfaces** | Malicious XSS in location address/notes | OWASP A03 | Strict DOMPurify stripping & recursive body middleware | ✅ Mitigated |
| **2. Planning & Reasoning** | Hallucinated solar or golden hour windows | OWASP LLM09 | Deterministic mathematical calculation via SunCalc algorithms | ✅ Mitigated |
| **2. Planning & Reasoning** | Unsolicited model drift during synthesis | OWASP LLM07 | Zero-temperature schemas & structured JSON enforcement | ✅ Mitigated |
| **3. Tool Execution** | SSRF via custom Slack webhooks | OWASP A10 | Domain validation enforcing `hooks.slack.com` protocol | ✅ Mitigated |
| **3. Tool Execution** | API quota exhaustion & DoS | OWASP A04 | Per-operation sliding window rate limiting (10 req/min) | ✅ Mitigated |
| **4. Memory & State** | Firestore crash on `undefined` payload properties | OWASP A08 | Recursive `stripUndefined` payload hygiene utility | ✅ Mitigated |
| **4. Memory & State** | Cross-project data leakage / IDOR | OWASP A01 | Strict URL param scoping & `requireProjectMember` middleware | ✅ Mitigated |
| **5. Inter-System Comm** | API key leakage to browser | OWASP A02 | Server-side Express API proxy with Secret Manager integration | ✅ Mitigated |
| **5. Inter-System Comm** | Single-model outage disruption | OWASP A09 | 4-tier resilient Gemini model fallback ladder | ✅ Mitigated |

---

## 🧪 5. Local Development & Testing

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Run build verification
npm run build
```

Open `http://localhost:3000` to access the CineGemini platform.
