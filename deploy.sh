#!/usr/bin/env bash
# ==============================================================================
# CineMate: Production Cloud Run Deployment Script
# Includes mandatory campaign verification label: dev-tutorial=cloud-run-ai-challenge
# ==============================================================================

set -euo pipefail

echo "======================================================================"
echo "🎬 CineMate — Google Cloud Run Automated Deployment"
echo "Target Campaign Label: dev-tutorial=cloud-run-ai-challenge"
echo "======================================================================"

# 1. Resolve Project ID
PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || echo '')}"

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
  echo "Error: No Google Cloud Project ID found in gcloud config."
  read -rp "Please enter your GCP Project ID: " PROJECT_ID
  gcloud config set project "$PROJECT_ID"
fi

REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-cinepilot-backend}"
SA_NAME="cinepilot-backend-sa"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Project ID    : ${PROJECT_ID}"
echo "Region        : ${REGION}"
echo "Service Name  : ${SERVICE_NAME}"
echo "Service Acct  : ${SA_EMAIL}"
echo "======================================================================"

# 2. Enable Required APIs
echo "▶ Step 1/5: Enabling required Google Cloud APIs..."
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  artifactregistry.googleapis.com \
  iamcredentials.googleapis.com \
  --project="${PROJECT_ID}"

# 3. Create/Verify Secret in Secret Manager
echo "▶ Step 2/5: Configuring Secret Manager for GEMINI_API_KEY..."
if ! gcloud secrets describe GEMINI_API_KEY --project="${PROJECT_ID}" >/dev/null 2>&1; then
  echo "Creating GEMINI_API_KEY secret in Secret Manager..."
  gcloud secrets create GEMINI_API_KEY --replication-policy="automatic" --project="${PROJECT_ID}"
  
  if [ -n "${GEMINI_API_KEY:-}" ]; then
    echo -n "${GEMINI_API_KEY}" | gcloud secrets versions add GEMINI_API_KEY --data-file=- --project="${PROJECT_ID}"
  else
    read -rsp "Enter your Gemini API Key: " INPUT_KEY
    echo
    echo -n "${INPUT_KEY}" | gcloud secrets versions add GEMINI_API_KEY --data-file=- --project="${PROJECT_ID}"
  fi
else
  echo "GEMINI_API_KEY secret already exists."
fi

# 4. Create Dedicated Least-Privilege Service Account (PoLP)
echo "▶ Step 3/5: Provisioning dedicated service account..."
if ! gcloud iam service-accounts describe "${SA_EMAIL}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud iam service-accounts create "${SA_NAME}" \
    --description="Dedicated least-privilege service identity for CineMate" \
    --display-name="CineMate Backend Service Account" \
    --project="${PROJECT_ID}"
  echo "Created service account ${SA_EMAIL}."
else
  echo "Service account ${SA_EMAIL} already exists."
fi

# Grant Secret Accessor to Service Account
echo "Granting Secret Accessor permission..."
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor" \
  --project="${PROJECT_ID}" >/dev/null

# 5. Build and Deploy to Cloud Run
echo "▶ Step 4/5: Deploying to Cloud Run with campaign label..."
gcloud run deploy "${SERVICE_NAME}" \
  --source . \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --service-account="${SA_EMAIL}" \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --set-env-vars="NODE_ENV=production,PROJECT_ID=project-aurora-001" \
  --labels="dev-tutorial=cloud-run-ai-challenge" \
  --project="${PROJECT_ID}"

# 6. Verify Labels
echo "▶ Step 5/5: Verifying campaign label registration..."
LABELS=$(gcloud run services describe "${SERVICE_NAME}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --format="value(metadata.labels)")

echo "Registered Labels: ${LABELS}"

if echo "$LABELS" | grep -q "dev-tutorial"; then
  echo "======================================================================"
  echo "SUCCESS! CineMate is published with 'dev-tutorial=cloud-run-ai-challenge'."
  echo "Service URL:"
  gcloud run services describe "${SERVICE_NAME}" --region "${REGION}" --project "${PROJECT_ID}" --format="value(status.url)"
  echo "======================================================================"
else
  echo "Updating label..."
  gcloud run services update "${SERVICE_NAME}" \
    --region "${REGION}" \
    --project "${PROJECT_ID}" \
    --update-labels="dev-tutorial=cloud-run-ai-challenge"
fi
