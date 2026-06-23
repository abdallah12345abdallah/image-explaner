# Image Explainer (Ionic Vue)

Take or upload a photo of a document and get an **Arabic** explanation of it
(document type, and — if it's an appointment — date, time, location, and what's
required of you). Built with Ionic + Vue 3 + Capacitor + Vite.

The AI vision model is **Google Gemini** (free tier), called through a small
backend proxy in `server/` so the API key never ships inside the mobile app.

```
.
├── server/          # Express proxy → Claude vision (holds the API key)
└── src/             # Ionic Vue app (camera / gallery / file upload + result UI)
```

## 1. Backend proxy

```bash
cd server
npm install            # already done
cp .env.example .env   # then edit .env and paste your real GEMINI_API_KEY
npm start              # http://localhost:3001
```

`server/.env` (get a free key at https://aistudio.google.com → "Get API key"):

```
GEMINI_API_KEY=...
# GEMINI_MODEL=gemini-2.0-flash   # default; free + vision
```

Endpoints: `GET /health`, `POST /api/explain` with body `{ image: <base64>, mediaType: "image/jpeg" }`.

## 2. Web app (dev)

```bash
npm install            # already done
ionic serve            # or: npm run dev
```

The app reads the proxy URL from `.env` → `VITE_API_BASE_URL` (defaults to
`http://localhost:3001`).

## 3. Mobile (Android)

```bash
ionic build
ionic cap add android
ionic cap run android
```

On a real device, set `VITE_API_BASE_URL` in `.env` to your computer's LAN IP
(e.g. `http://192.168.1.20:3001`) instead of `localhost`, then rebuild.

## Notes / next steps

- The proxy endpoint is currently open — add an app token / rate limiting before
  any public deployment.
- Output language is Arabic; the prompt + JSON schema live in `server/index.js`.
