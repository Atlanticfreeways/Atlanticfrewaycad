# Atlantic Freeway Card - Server Operations Guide

This guide details the commands to build, start, and manage the monolithic server deployment (Backend + Static Frontend).

## 🚀 Quick Start (Production Mode)

To run the application exactly as it runs on Render:

```bash
# 1. Build everything (Backend deps + Frontend static export)
npm run build

# 2. Start the server (Serves API + Frontend from port 5000)
npm start
```

**URL:** `http://localhost:5000`

---

## 🛠 Development Mode

For active development with hot-reloading:

### Option A: Run concurrently (Recommended)
This requires `concurrently` to be installed or a script setup. If not configured, use Option B.

### Option B: Run separately (Standard)

**Terminal 1 (Backend API):**
```bash
# From root directory
npm run dev:server
# OR
node server.js
```
*Port: 5000*

**Terminal 2 (Frontend UI):**
```bash
# From root directory
cd frontend
npm run dev
```
*Port: 3000* (Proxies API requests to 5000 via `next.config.js`)

---

## 🔄 Rebuild & Redeploy

If you make changes to the **frontend**, you must rebuild the static assets for them to be served by the production server:

```bash
# From root directory
npm run build
```

*Note: Changes to `server.js` or backend API code only require a server restart, not a full frontend rebuild.*

---

## 🐳 Docker Deployment

If you are testing the Docker container locally:

```bash
# Build and start
docker-compose up --build

# Stop
docker-compose down
```

## 🔍 Troubleshooting

**1. "Address already in use"**
Kill the process running on port 5000:
```bash
lsof -i :5000
kill -9 <PID>
```

**2. Frontend changes not showing (Production)**
Ensure you ran `npm run build`. The server serves files from `frontend/out`, which are only updated during the build process.

**3. API 404s**
Check `NEXT_PUBLIC_API_URL`.
- **Production (Monolith):** Should be relative `/api/v1` or match the domain.
- **Development (Separate):** Should be full URL `http://localhost:5000/api/v1`.
