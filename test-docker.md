# Docker Testing Guide

## Quick Test Commands

### 1. Build and start all services
```bash
docker compose up --build -d
```

### 2. Check service status
```bash
docker compose ps
```

### 3. View logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f server
docker compose logs -f client
docker compose logs -f postgres
```

### 4. Test endpoints
```bash
# Server health check
curl http://localhost:5000/api/health

# Client (in browser)
http://localhost:3001
```

### 5. Stop and clean up
```bash
# Stop services
docker compose down

# Remove volumes (careful - deletes data!)
docker compose down -v
```

## Common Issues & Solutions

### Issue: "exec format error" on entrypoint.sh
**Solution**: Line endings issue - already fixed in the latest version

### Issue: Prisma migrations fail
**Solution**: Check DATABASE_URL and ensure postgres is healthy

### Issue: Client can't connect to server
**Solution**: Check NEXT_PUBLIC_API_URL matches the server URL

### Issue: Port already in use
**Solution**: 
```bash
# Check what's using the port
netstat -ano | findstr :5000
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# Kill the process or change ports in docker-compose.yml
```

## Production Deployment Checklist

- [ ] Update `CLIENT_URL` in .env to production domain
- [ ] Update `NEXT_PUBLIC_API_URL` to production API URL
- [ ] Change database password
- [ ] Regenerate JWT_SECRET
- [ ] Set up proper SMTP credentials
- [ ] Use secrets management (not .env in repo)
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx/traefik)
- [ ] Set up monitoring and logging
- [ ] Configure backups for postgres_data volume
