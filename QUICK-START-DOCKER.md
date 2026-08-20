# 🚀 FinFlow Docker Quick Start

## ⚡ Super Quick Test (5 Minutes)

### Option 1: PowerShell Script (Recommended)
```powershell
.\verify-docker.ps1
```

### Option 2: Batch Script  
```cmd
verify-docker-simple.bat
```

### Option 3: Manual Commands
```bash
# 1. Build (5-10 minutes first time)
docker compose build

# 2. Start
docker compose up -d

# 3. Check status (wait 30 seconds first)
docker compose ps

# 4. Test it works
curl http://localhost:5000/api/health
# Should return: {"status":"ok"}
```

---

## ✅ Success Checklist

After running the commands above, verify:

- [ ] **Build completed** - No errors during `docker compose build`
- [ ] **3 containers running** - `docker compose ps` shows all 3 services
- [ ] **Database healthy** - Status shows "(healthy)" for finflow_db
- [ ] **Server healthy** - Status shows "(healthy)" for finflow_server  
- [ ] **API responds** - `curl http://localhost:5000/api/health` returns `{"status":"ok"}`
- [ ] **Frontend loads** - Open http://localhost:3001 in browser
- [ ] **No errors in logs** - `docker compose logs` shows no critical errors

---

## 🎯 What "Working Perfectly" Looks Like

### 1. Build Output (Last Lines)
```
✅ finflow_db       Up 30 seconds (healthy)
✅ finflow_server   Up 20 seconds (healthy)  
✅ finflow_client   Up 15 seconds
```

### 2. Server Logs
```bash
docker compose logs server | Select-Object -Last 10
```
**Should show:**
```
⏳ Running Prisma migrations...
✅ Migrations done. Starting server...
Server running on http://localhost:5000
```

### 3. Client Logs
```bash
docker compose logs client | Select-Object -Last 10
```
**Should show:**
```
ready - started server on 0.0.0.0:3000
```

### 4. Database Test
```bash
docker exec finflow_db psql -U postgres -d finflow -c "\dt"
```
**Should show:** List of tables (User, Account, Transaction, etc.)

### 5. Browser Test
Open these URLs:
- ✅ http://localhost:3001 - Should show FinFlow login page
- ✅ http://localhost:5000/api/health - Should show `{"status":"ok"}`

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clean everything and rebuild
docker compose down -v
docker system prune -f
docker compose build --no-cache
```

### Containers Keep Restarting
```bash
# Check what's wrong
docker compose logs <service-name>

# Common issues:
# - Database not ready: Increase healthcheck start_period
# - Port conflicts: Change ports in docker-compose.yml
# - Missing env vars: Check .env file
```

### Port Already in Use
```bash
# Find what's using the port
netstat -ano | findstr :5000

# Either:
# 1. Kill that process, OR
# 2. Change port in docker-compose.yml
```

### Slow Build (Takes Forever)
**Normal!** First build takes 5-15 minutes depending on internet speed.
Subsequent builds are faster (~1-2 minutes) due to caching.

### "Cannot connect to Docker daemon"
- Start Docker Desktop
- Wait for it to fully start (whale icon in system tray)
- Try again

---

## 📊 Quick Commands Reference

```bash
# Start everything
docker compose up -d

# Stop everything
docker compose down

# Rebuild and restart
docker compose up --build -d

# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f server
docker compose logs -f client
docker compose logs -f postgres

# Check status
docker compose ps

# Enter a container
docker exec -it finflow_server sh
docker exec -it finflow_client sh
docker exec -it finflow_db psql -U postgres -d finflow

# Restart a service
docker compose restart server

# Remove everything (including data!)
docker compose down -v

# See resource usage
docker stats --no-stream
```

---

## 🎉 Ready for Production?

Before deploying, update these in `.env`:

```bash
# Change to production URLs
CLIENT_URL=https://yourapp.com
NEXT_PUBLIC_API_URL=https://api.yourapp.com

# Regenerate secrets
JWT_SECRET=<generate-new-secret>
POSTGRES_PASSWORD=<strong-password>

# Use real SMTP
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=<your-user>
SMTP_PASS=<your-password>
```

Then:
```bash
docker compose build
docker compose up -d
```

---

## 📞 Still Stuck?

1. **Get full logs:** `docker compose logs > docker-logs.txt`
2. **Check detailed verification:** See `DOCKER-VERIFICATION.md`
3. **Clean slate:** 
   ```bash
   docker compose down -v
   docker system prune -af
   docker compose up --build -d
   ```

---

## ✨ That's It!

If all checks pass, your FinFlow app is **perfectly dockerized** and ready to use! 🎊

Open http://localhost:3001 and start managing your finances! 💰
