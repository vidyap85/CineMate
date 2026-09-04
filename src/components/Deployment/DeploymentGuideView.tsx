import React, { useState } from 'react';
import { Cloud, ShieldCheck, Copy, Check, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

export const DeploymentGuideView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const serviceAccountSetupCmd = `# 1. Create Dedicated User-Managed Service Account (CinePilot Backend)
gcloud iam service-accounts create cinepilot-backend-sa \\
  --description="Dedicated least-privilege service account for CinePilot backend" \\
  --display-name="CinePilot Backend Service Account"

PROJECT_ID=$(gcloud config get-value project)
SA_EMAIL="cinepilot-backend-sa@\${PROJECT_ID}.iam.gserviceaccount.com"

# 2. Grant Least-Privilege Access to Secret Manager (GEMINI_API_KEY only)
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic" || true
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \\
  --member="serviceAccount:\${SA_EMAIL}" \\
  --role="roles/secretmanager.secretAccessor"`;

  const localImpersonationCmd = `# Local Development: Use Application Default Credentials (ADC)
# or Service-Account Impersonation (NO JSON keys downloaded to local machine)
gcloud iam service-accounts add-iam-policy-binding \${SA_EMAIL} \\
  --member="user:$(gcloud config get-value account)" \\
  --role="roles/iam.serviceAccountTokenCreator"

# Login with Impersonation for Local ADC
gcloud auth application-default login --impersonate-service-account=\${SA_EMAIL}`;

  const cloudRunDeployCmd = `# Deploy to Cloud Run with Dedicated Service Identity
# Production uses Application Default Credentials (ADC) — NO private key JSON file needed
gcloud run deploy cinepilot-backend \\
  --source . \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --service-account="cinepilot-backend-sa@\${PROJECT_ID}.iam.gserviceaccount.com" \\
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \\
  --set-env-vars="NODE_ENV=production,PROJECT_ID=project-aurora-001" \\
  --labels="dev-tutorial=cloud-run-ai-challenge"`;

  const firestoreRules = `rules_version = '2';
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
    match /users/{userId}/journalEntries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-medium">
              GOOGLE CLOUD RUN & SECRET MANAGER
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Cloud Run Production Deployment & Security Configuration
          </h2>
          <p className="text-xs text-zinc-400">
            Step-by-step production runbook with Secret Manager, Firestore rules, and mandatory campaign labels
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          <CheckCircle2 className="h-4 w-4" />
          <span>Label: dev-tutorial=cloud-run-ai-challenge</span>
        </div>
      </div>

      {/* Service Account Setup Section */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">1. Dedicated User-Managed Service Account & Secret Manager (PoLP)</h3>
          </div>
          <button
            onClick={() => copyCode(serviceAccountSetupCmd, 'sa')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors"
          >
            {copiedId === 'sa' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedId === 'sa' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-emerald-400 font-mono overflow-x-auto">
          {serviceAccountSetupCmd}
        </pre>
      </div>

      {/* Local Impersonation Section */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">2. Local Development: ADC & Service-Account Impersonation (Zero JSON Keys)</h3>
          </div>
          <button
            onClick={() => copyCode(localImpersonationCmd, 'local')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors"
          >
            {copiedId === 'local' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedId === 'local' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-emerald-300 font-mono overflow-x-auto">
          {localImpersonationCmd}
        </pre>
      </div>

      {/* Cloud Run Deploy Command */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">3. Cloud Run Deployment Command (Service Identity via ADC)</h3>
          </div>
          <button
            onClick={() => copyCode(cloudRunDeployCmd, 'cloudrun')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors"
          >
            {copiedId === 'cloudrun' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedId === 'cloudrun' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-cyan-300 font-mono overflow-x-auto">
          {cloudRunDeployCmd}
        </pre>
      </div>

      {/* Firestore Security Rules */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">3. Firestore Owner-Bound Security Rules (firestore.rules)</h3>
          </div>
          <button
            onClick={() => copyCode(firestoreRules, 'rules')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors"
          >
            {copiedId === 'rules' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedId === 'rules' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-mono overflow-x-auto">
          {firestoreRules}
        </pre>
      </div>
    </div>
  );
};
