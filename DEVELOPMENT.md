# Development Setup Guide

## Quick Start

### Option 1: Using Docker Compose (Recommended)
Run both backend and frontend together in containers:

```bash
docker-compose up
```

Then access:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

**Advantages:**
- Both services run automatically
- Proper network isolation
- Same environment as production

### Option 2: Running Backend and Frontend Separately
If you prefer to run services individually:

#### Terminal 1 - Start Backend:
```bash
cd fairplay-cloud-backend
npm install
npm run dev
```
Backend will run on: `http://localhost:3001`

#### Terminal 2 - Start Frontend:
```bash
cd fairplay-cloud-frontend
npm install
npm run dev
```
Frontend will run on: `http://localhost:5173`

### Option 3: Using Root Scripts (Requires concurrently)
From project root, run both services with one command:

```bash
npm install
npm run dev
```

This runs backend and frontend in parallel from the root directory.

## Troubleshooting

### Error: "http proxy error: ECONNREFUSED"
This means the frontend cannot reach the backend. Solutions:

1. **Check if backend is running:**
   ```bash
   curl http://localhost:3001
   ```

2. **If using Docker Compose:**
   - Ensure `docker-compose up` is running
   - Check container status: `docker-compose ps`
   - View logs: `docker-compose logs backend`

3. **If running services separately:**
   - Make sure you've started the backend terminal
   - Backend should be on port 3001
   - Frontend proxy automatically tries `http://localhost:3001`

4. **Backend configuration:**
   - Check `fairplay-cloud-backend/.env` has AWS credentials
   - Verify DynamoDB tables are accessible

## Environment Variables

### Frontend (.env.local)
- `VITE_API_BASE_URL=/api` - API endpoint prefix
- `BACKEND_URL=http://localhost:3001` - Optional custom backend URL (for non-Docker)

### Backend (.env)
- `AWS_REGION` - AWS region
- `JWT_SECRET` - Secret for JWT tokens
- `DYNAMODB_ENDPOINT` - DynamoDB endpoint (optional, for local testing)
- Table names for: Players, Incidents, Audit Logs, Health Metrics, Admin Users

## Auto-Refresh Data

The Observability page automatically refreshes every 30 seconds to show live backend data:
- Fetches from `/api/observability`
- Displays real-time metrics from all connected services
- No manual refresh needed

## Next Steps

1. Start services using Option 1 (Docker) or Option 2 (Separate)
2. Access frontend at http://localhost:5173
3. Login with credentials from your backend setup
4. Navigate to Observability page to see live data
