# Straddly Frontend - Setup Guide

## What's Been Done

✅ **Complete frontend duplicate created** with all branding changed from "Trading Nexus" to "Straddly"

### Changes Made:
1. **Text branding** - All instances of "Trading Nexus" replaced with "Straddly"
2. **Package naming** - `package.json` name changed to `straddly-ui`
3. **App ID** - Capacitor app ID changed to `com.straddly.app`
4. **URLs** - Learning portal and API endpoints updated to Straddly domain references:
   - `learn.tradingnexus.pro` → `learn.straddly.com`
   - `api.tradingnexus.pro` → `api.straddly.com`
5. **Docker files** - `Dockerfile` and `nginx.conf` copied for containerization

### Folder Structure:
```
frontend-straddly/
├── src/                 (React source code with Straddly branding)
├── public/              (Assets - including logo.png that needs updating)
├── package.json         (Updated to straddly-ui)
├── capacitor.config.ts  (Updated app ID)
├── index.html           (Title: Straddly)
├── Dockerfile           (Ready for deployment)
├── nginx.conf           (Nginx reverse proxy config)
└── vite.config.ts       (Vite build config)
```

---

## What You Need to Do

### 1. **Update the Logo** (REQUIRED)
The folder uses `public/logo.png` as the brand logo. You need to:

- **Option A:** Replace `frontend-straddly/public/logo.png` with your Straddly logo
- **Option B:** Create a new logo with the same look/style as Trading Nexus but branded as "Straddly"

**File location:** `frontend-straddly/public/logo.png`

### 2. **Choose a Domain for Straddly** (REQUIRED)
You need to decide:
- **Main domain:** `www.straddly.com` (or similar)
- **Learning portal:** `learn.straddly.com` (matches the hardcoded reference)
- **Backend connection:** Will connect to the existing backend via `VITE_API_URL`

### 3. **Backend Connection** (OPTIONAL - only if backend domain differs)
By default, the frontend connects to the backend using:
- **For development:** `http://localhost:8000/api/v2` (via Vite dev proxy)
- **For production:** The backend serves at `/api/v2` on the same domain

If you want the Straddly frontend to connect to a **different backend domain**, you can set the `VITE_API_URL` environment variable during Docker build:
```bash
# Example: Connect to a specific backend API
VITE_API_URL=https://api.tradingnexus.pro/api/v2
```

---

## Deployment Options

### Option 1: Deploy as Separate Container on New Domain (Recommended)

#### Step 1: Update docker-compose.prod.yml

Add a new service for Straddly frontend:

```yaml
  straddly-frontend:
    build:
      context: ./frontend-straddly
      dockerfile: Dockerfile
      args:
        # Connect to the SAME backend as Trading Nexus
        VITE_API_URL: ${STRADDLY_API_URL:-/api/v2}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.straddly.rule=Host(`www.straddly.com`) || Host(`straddly.com`)"
      - "traefik.http.routers.straddly.entrypoints=http,https"
      - "traefik.http.routers.straddly.tls=true"
      - "traefik.http.routers.straddly.tls.certresolver=letsencrypt"
      - "traefik.http.services.straddly-frontend.loadbalancer.server.port=80"
    environment:
      - VITE_API_URL=${STRADDLY_API_URL:-/api/v2}
    restart: always
```

#### Step 2: Update docker-compose.yml (Local Development)

Add for local testing:

```yaml
  straddly-frontend-dev:
    build:
      context: ./frontend-straddly
      dockerfile: Dockerfile
      args:
        VITE_API_URL: /api/v2
    ports:
      - "5174:80"
    environment:
      - VITE_API_URL=/api/v2
    depends_on:
      - backend
```

#### Step 3: Deploy via Coolify

1. Create a new Coolify app for `frontend-straddly`
2. Connect to your GitHub repository
3. Set build context: `frontend-straddly`
4. Set environment variables:
   - `VITE_API_URL`: URL to your backend API
5. Deploy on your new Straddly domain

### Option 2: Deploy via SSH (Quick Test)

```bash
# SSH into VPS
ssh root@your-vps-ip

# Clone/pull the updated repository
cd /path/to/trading-nexus
git pull origin main

# Build the Straddly frontend image
docker build \
  -f frontend-straddly/Dockerfile \
  --build-arg VITE_API_URL=https://api.tradingnexus.pro/api/v2 \
  -t straddly-frontend:latest \
  ./frontend-straddly

# Run on port 3001
docker run -d \
  -p 3001:80 \
  --name straddly-frontend \
  --restart always \
  straddly-frontend:latest

# Then use Nginx/Traefik to route straddly.com → localhost:3001
```

---

## Data Sharing Between Trading Nexus and Straddly

✅ **Both frontends share the same backend automatically!**

This means:
- **User accounts:** Users can use the same login on both Trading Nexus and Straddly
- **Trading data:** Positions, orders, and trades are shared across both frontends
- **Real-time data:** Both get live market prices from the same WebSocket connection
- **Database:** Single PostgreSQL database serves both frontends

**Key benefit:** No data duplication. Both brands view the same user data securely.

---

## Development Workflow

### Local Development:

```bash
# Install dependencies
cd frontend-straddly
npm install

# Start dev server (connects to http://localhost:8000 via Vite proxy)
npm run dev
# Access at http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables:

**`.env` file in `/frontend-straddly/`:**
```
VITE_API_URL=/api/v2    # For local dev with Vite proxy
```

**For Docker build (production):**
```bash
docker build \
  --build-arg VITE_API_URL=https://api.straddly.com/api/v2 \
  -t straddly-frontend:latest \
  .
```

---

## Troubleshooting

### Issue: "Cannot connect to backend"
- **Cause:** `VITE_API_URL` not set correctly or backend not accessible
- **Solution:** Verify the backend domain is reachable and matches your setup

### Issue: "CORS errors"
- **Backend CORS config:** Check `app/config.py` in the backend
- **Current setting:** `CORS_ORIGINS_RAW` allows all origins (`*`)
- **To restrict:** Add Straddly domain to `CORS_ORIGINS_RAW` in `.env`

### Issue: "Logo not showing"
- **Solution:** Replace `frontend-straddly/public/logo.png` with your Straddly logo

### Issue: "Cookies/Auth not persisting"
- **Cause:** CORS `Credentials: include` may need SameSite=None
- **Solution:** This should work automatically if on same backend domain

---

## Next Steps

1. ✏️ **Replace the logo** - Update `frontend-straddly/public/logo.png`
2. 🌐 **Choose domain** - Decide on straddly.com URLs
3. 🚀 **Deploy to Coolify** - Add as new application
4. 🔗 **Update DNS** - Point your domain to the Coolify app
5. 🧪 **Test** - Login, trade, and verify data sync between both frontends

---

## Summary

Your Straddly frontend is now ready to:
- ✅ Run as an independent container on a separate domain
- ✅ Connect to the **same FastAPI backend** (no backend code changes needed)
- ✅ Share user accounts and trading data with Trading Nexus
- ✅ Display with Straddly branding throughout the UI

Both frontends will use the same PostgreSQL database, user authentication system, and market data streams - but with completely separate branding and domains.
