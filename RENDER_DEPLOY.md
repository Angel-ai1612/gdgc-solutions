# Render Backend Deployment

This repo is configured for Render with `render.yaml` and `backend/Dockerfile`.

Use Render Blueprint deploy:

1. Open Render Dashboard.
2. New > Blueprint.
3. Connect `Angel-ai1612/gdgc-solutions`.
4. Select branch `main`.
5. Render will read `render.yaml` and create `spoproof-backend`.
6. Fill the `sync: false` environment variables when prompted.

Required production values:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://spoproof-backend.onrender.com/api/auth/google/callback
GEMINI_API_KEY=
BITMIND_API_KEY=
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_CX=
ZENSERP_API_KEY=
REDIS_URL=
```

`REDIS_URL` can be left empty. The app will run without Redis, but rate limiting will be disabled.

After Render gives the final service URL:

1. Set Vercel `VITE_API_URL` to `https://<your-render-service>.onrender.com/api`.
2. Set Render `FRONTEND_URL` to the exact Vercel URL if it is not `https://spoproof.vercel.app`.
3. Set Render `GOOGLE_CALLBACK_URL` to `https://<your-render-service>.onrender.com/api/auth/google/callback`.
4. Add that callback URL in Google Cloud OAuth authorized redirect URIs.

The Docker image installs `yt-dlp` and `ffmpeg`, so social media URL extraction works in production.
