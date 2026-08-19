# 🐳 Docker Verification Checklist

A complete guide to verify your FinFlow project is dockerized perfectly.

---

## ✅ Phase 1: Pre-Flight Checks (Before Starting)

### 1.1 Check Docker is Running
```bash
docker --version
docker compose version
```
**Expected**: Version numbers displayed (no errors)

### 1.2 Validate Docker Compose Configuration
```bash
docker compose config
```
**Expected**: YAML output with no errors, all services listed

### 1.3 Check Port Availability
```bash
# Check if ports are free (Windows)
netstat -ano | findstr :5432
netstat -ano | findstr :5000
netstat -ano | findstr :3001
```
**Expected**: No output (ports are free) OR stop conflicting services

### 1.4 Verify Environment Variables
```bash
# Check .env file exists
type .env
```
**Expected**: All required variables present (DB, JWT, SMTP, Cloudinary)

---

## ✅ Phase 2: Build & Start (The Main Test)

### 2.1 Clean Start (Remove Old Containers)
```bash
docker compose down -v
docker system prune -f
```

### 2.2 Build Images
```bash
docker compose build
```
**What to watch for**:
- ✅ No build errors
- ✅ All 3 images created (postgres, server, client)
- ✅ "Successfully built" messages
- ⚠️ Any npm WARN is usually okay
- ❌ Any ERROR means build failed

**Time**: ~5-10 minutes on first build

### 2.3 Start All Services
```bash
docker compose up -d
```
**Expected**:
```
✔ Container finflow_db       Started
✔ Container finflow_server   Started  
✔ Container finflow_client   Started
```

---

## ✅ Phase 3: Health Verification (Critical Tests)

### 3.1 Check Container Status
```bash
docker compose ps
```
**Expected Output**:
```
NAME              STATUS         PORTS
finflow_db        Up (healthy)   0.0.0.0:5432->5432/tcp
finflow_server    Up (healthy)   0.0.0.0:5000->5000/tcp
finflow_client    Up             0.0.0.0:3001->3000/tcp
```

**Red Flags**:
- ❌ Status: "Exited" or "Restarting" = Something is broken
- ❌ Missing "(healthy)" for db/server after 30s = Health check failing

### 3.2 View Real-Time Logs
```bash
docker compose logs -f
```
**What to look for**:

**✅ PostgreSQL (finflow_db)**:
```
database system is ready to accept connections
```

**✅ Server (finflow_server)**:
```
⏳ Running Prisma migrations...
✅ Migrations done. Starting server...
Server running on http://localhost:5000
```

**✅ Client (finflow_client)**:
```
ready - started server on 0.0.0.0:3000
```

**❌ Error Patterns** (common issues):
- `ECONNREFUSED` = Can't connect to database
- `exec format error` = Line ending issue in entrypoint.sh
- `prisma migrate` errors = Database schema issues
- `MODULE_NOT_FOUND` = Missing dependencies

Press `Ctrl+C` to stop following logs

### 3.3 Check Individual Service Logs
```bash
# Database logs
docker compose logs postgres

# Server logs  
docker compose logs server

# Client logs
docker compose logs client
```

---

## ✅ Phase 4: Functional Testing (Does It Work?)

### 4.1 Test Database Connection
```bash
docker exec -it finflow_db psql -U postgres -d finflow -c "\dt"
```
**Expected**: List of tables (User, Account, Transaction, etc.)

### 4.2 Test Server API Health Endpoint
```bash
# Windows PowerShell
curl http://localhost:5000/api/health

# Or in browser
# Navigate to: http://localhost:5000/api/health
```
**Expected**: `{"status":"ok"}`

### 4.3 Test Server API (More Endpoints)
```bash
# Check if routes are responding
curl http://localhost:5000/api/auth/me
```
**Expected**: Error response (401 Unauthorized) is GOOD - means server is working

### 4.4 Test Client Frontend
**Open in browser**: http://localhost:3001

**Expected**:
- ✅ Page loads (no "This site can't be reached")
- ✅ UI renders (login/register page visible)
- ✅ No console errors in browser DevTools (F12)
- ✅ Can see FinFlow interface

**Try**:
- Navigate between pages
- Open browser console (F12) - check for errors
- Check Network tab - API calls should go to `http://localhost:5000/api`

---

## ✅ Phase 5: Integration Testing (Full Flow)

### 5.1 Test User Registration
1. Go to http://localhost:3001/register
2. Fill in registration form
3. Submit

**Check logs**:
```bash
docker compose logs server | findstr "POST"
```
**Expected**: See POST requests logged

### 5.2 Check Database Updated
```bash
docker exec -it finflow_db psql -U postgres -d finflow -c "SELECT email FROM \"User\";"
```
**Expected**: Your registered email appears

### 5.3 Test Email Verification (if SMTP configured)
Check server logs for email sending:
```bash
docker compose logs server | findstr "email"
```

---

## ✅ Phase 6: Container Deep Dive (Advanced)

### 6.1 Enter Running Containers
```bash
# Enter server container
docker exec -it finflow_server sh

# Check files are there
ls -la
cat index.js
exit

# Enter client container  
docker exec -it finflow_client sh
ls -la
exit
```

### 6.2 Check Resource Usage
```bash
docker stats --no-stream
```
**Expected**:
- finflow_db: ~50-100MB RAM
- finflow_server: ~50-150MB RAM  
- finflow_client: ~50-100MB RAM

### 6.3 Inspect Networks
```bash
docker network ls
docker network inspect finflow_default
```
**Expected**: All 3 containers on same network

---

## ✅ Phase 7: Restart & Recovery Testing

### 7.1 Test Restart Resilience
```bash
# Stop everything
docker compose down

# Start again (should be fast)
docker compose up -d
```
**Expected**: 
- Starts in ~10 seconds
- Database data persists (volume preserved)

### 7.2 Test Individual Container Restart
```bash
docker restart finflow_server
docker compose logs server -f
```
**Expected**: Server restarts cleanly with migrations

### 7.3 Test Data Persistence
```bash
# Create some data, then restart
docker compose down
docker compose up -d

# Check data still exists
docker exec -it finflow_db psql -U postgres -d finflow -c "SELECT COUNT(*) FROM \"User\";"
```
**Expected**: User count unchanged

---

## ✅ Phase 8: Cleanup Testing

### 8.1 Stop Services
```bash
docker compose down
```
**Expected**: All containers stopped

### 8.2 Full Cleanup (Remove Everything)
```bash
# Remove containers, networks, volumes (DESTRUCTIVE!)
docker compose down -v

# Remove unused images
docker image prune -f
```

---

## 🎯 Quick Pass/Fail Summary

Run these commands in order. If all pass, you're **100% dockerized**:

```bash
# 1. Config valid?
docker compose config > nul 2>&1 && echo "✅ Config OK" || echo "❌ Config Failed"

# 2. Build successful?
docker compose build > nul 2>&1 && echo "✅ Build OK" || echo "❌ Build Failed"

# 3. Start successful?
docker compose up -d && echo "✅ Start OK" || echo "❌ Start Failed"

# 4. All healthy?
timeout /t 30 > nul
docker compose ps

# 5. Health check
curl http://localhost:5000/api/health

# 6. Frontend loads?
curl http://localhost:3001

# 7. Database accessible?
docker exec finflow_db psql -U postgres -d finflow -c "SELECT 1;"
```

---

## 🚨 Common Issues & Solutions

| Symptom | Cause | Solution |
|---------|-------|----------|
| `port already in use` | Something else on 5000/3001/5432 | Stop other services or change ports |
| `exec format error` | Windows line endings (CRLF) | Use LF line endings for .sh files |
| `prisma migrate deploy` fails | Database not ready | Increase healthcheck `start_period` |
| Client shows "API Error" | Wrong API URL | Check NEXT_PUBLIC_API_URL |
| Container keeps restarting | Application crash on startup | Check logs: `docker compose logs <service>` |
| `Cannot connect to Docker daemon` | Docker not running | Start Docker Desktop |
| Build takes forever | Large node_modules in context | Check .dockerignore excludes node_modules |

---

## ✨ Success Criteria

Your project is **perfectly dockerized** if:

- [x] `docker compose up -d` starts all 3 services
- [x] All containers show "healthy" or "running" status
- [x] http://localhost:3001 loads the frontend
- [x] http://localhost:5000/api/health returns `{"status":"ok"}`
- [x] Can register/login through the UI
- [x] Database persists after `docker compose down && docker compose up`
- [x] No errors in any logs
- [x] Restarts work smoothly

---

## 📞 Still Having Issues?

1. **Get full logs**: `docker compose logs > debug.log`
2. **Check versions**: Ensure Docker Desktop is up to date
3. **Clean slate**: `docker compose down -v && docker system prune -af`
4. **Rebuild**: `docker compose build --no-cache`
