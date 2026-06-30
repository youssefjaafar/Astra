# Vercel Deployment

## 1. Connect Repository

1. Push the Astra repository to GitHub.
2. In Vercel, create a new project from the repo.
3. Framework preset: Next.js.

## 2. Build Settings

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: leave default for Next.js

No custom output configuration is required.

## 3. Environment Variables

Set these in Vercel Project Settings:

```bash
NEXT_PUBLIC_APP_URL=https://<your-production-domain>
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
AI_REQUEST_TIMEOUT_MS=15000
```

Only `NEXT_PUBLIC_*` values are exposed to the browser. Keep `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` server-only.

## 4. Supabase Redirect URLs

In Supabase Auth URL configuration, add:

- Local site URL: `http://localhost:3000`
- Production site URL: `https://<your-production-domain>`
- Local callback: `http://localhost:3000/auth/callback`
- Production callback: `https://<your-production-domain>/auth/callback`

If testing preview deployments, add each trusted preview callback URL.

## 5. Deploy

1. Trigger a Vercel deployment.
2. Confirm `npm run build` succeeds in Vercel.
3. Open the production URL.
4. Test login/signup callbacks.
5. Complete onboarding with a test user.
6. Verify dashboard and core modules load with the test account.

## 6. Post-Deploy Smoke Test

- `/login` renders.
- `/signup` renders.
- Unauthenticated `/dashboard` redirects to `/login`.
- Authenticated `/dashboard` loads.
- Tasks create/edit/delete works.
- Quick Capture handles AI unavailable/quota states gracefully.
- Settings saves profile and targets.
- Mobile bottom navigation works.
