# Docker Deployment Guide - Serique Avenue E-Commerce

## Overview

This guide covers Docker configuration and deployment of the Serique Avenue e-commerce application.

## Files Structure

```
.
├── Dockerfile.client          # Frontend build with Nginx serving
├── Dockerfile.server          # Backend Node.js API server
├── docker-compose.yml         # Development compose configuration
├── docker-compose.prod.yml    # Production compose configuration
├── docker-compose.dev.yml     # Development overrides
├── .dockerignore              # Docker build context exclusions
├── .env.docker                # Docker environment variables
└── nginx.conf                 # Nginx configuration for frontend
```

## Prerequisites

1. **Docker** (version 20.10+)
   ```bash
   docker --version
   ```

2. **Docker Compose** (version 1.29+)
   ```bash
   docker-compose --version
   ```

3. **Environment Variables**
   - Copy `.env.docker` and update with production values
   - Ensure all required API keys and secrets are configured

## Development Deployment

### Using Docker Compose (Development)

```bash
# Build and start services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# For development overrides
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Services

- **Frontend**: http://localhost:80 (Nginx with React SPA)
- **Backend API**: http://localhost:5000 (Node.js API)
- **Redis Cache**: redis://localhost:6379 (Cache layer)

## Production Deployment

### 1. Build Images

```bash
# Build frontend image
docker build -f Dockerfile.client -t serique-avenue-frontend:latest \
  --build-arg VITE_API_URL=/api .

# Build backend image
docker build -f Dockerfile.server -t serique-avenue-backend:latest .

# Or use docker-compose
docker-compose -f docker-compose.prod.yml build
```

### 2. Configure Production Environment

```bash
# Update .env.docker with production values
cp .env.docker .env.production
# Edit with actual production secrets and URLs
```

**Required Variables:**
```
VITE_API_URL=/api
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_KEY=your_production_supabase_key
VITE_GA_MEASUREMENT_ID=your_production_ga_id
REDIS_PASSWORD=secure_password_here
JWT_SECRET=secure_jwt_secret_here
DATABASE_URL=production_database_url
```

### 3. Deploy Production Stack

```bash
# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Verify services are running
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### 4. Health Checks

All services include health checks:

```bash
# Check service health
docker-compose -f docker-compose.prod.yml exec frontend curl http://localhost/
docker-compose -f docker-compose.prod.yml exec backend curl http://localhost:5000/health
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

## Dockerfile Details

### Dockerfile.client (Frontend)

**Multi-stage build:**
1. **Build stage**: Node.js environment with Vite build
2. **Runtime stage**: Nginx Alpine serving built files

**Advantages:**
- Minimal final image size
- No build tools in production image
- Fast serving with Nginx

**Build time:** ~2-3 minutes
**Image size:** ~50-80MB

### Dockerfile.server (Backend)

**Single-stage build:**
- Node.js Alpine base
- Compiles TypeScript
- Runs compiled JavaScript

**Advantages:**
- Simpler deployment
- Full Node.js ecosystem available

**Build time:** ~1-2 minutes
**Image size:** ~200-300MB

## Docker Compose Services

### Frontend Service
- **Port**: 80 (HTTP)
- **Image**: serique-avenue-frontend:latest
- **Health Check**: HTTP GET to root path
- **Restart**: Always
- **Dependencies**: Backend

### Backend Service
- **Port**: 5000 (API)
- **Image**: serique-avenue-backend:latest
- **Health Check**: HTTP GET to /health endpoint
- **Restart**: Always
- **Dependencies**: Redis
- **Volumes**: 
  - `./uploads:/app/uploads` (File storage)
  - `./logs:/app/logs` (Application logs)

### Redis Service
- **Port**: 6379
- **Image**: redis:7-alpine
- **Password Protection**: Required in production
- **Persistence**: Enabled with AOF
- **Health Check**: Redis PING command
- **Volume**: redis_data (persistent storage)

## Networking

All services communicate through Docker bridge network `serique-network`:
- Frontend can reach backend via `http://backend:5000`
- Backend can reach Redis via `redis://redis:6379`
- Isolated from other Docker networks

## Volume Management

```bash
# List volumes
docker volume ls

# Inspect a volume
docker volume inspect ecommerce_redis_data

# Backup redis data
docker run --rm -v ecommerce_redis_data:/data -v $(pwd):/backup \
  redis:7-alpine redis-cli -u redis://default:password@localhost:6379 BGSAVE

# Cleanup unused volumes
docker volume prune
```

## Common Operations

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs

# Specific service
docker-compose -f docker-compose.prod.yml logs backend

# Follow logs
docker-compose -f docker-compose.prod.yml logs -f frontend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Execute Commands

```bash
# Run command in running container
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# Interactive shell
docker-compose -f docker-compose.prod.yml exec backend /bin/sh
```

### Restart Services

```bash
# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart with rebuild
docker-compose -f docker-compose.prod.yml up -d --build backend
```

### Scale Services

```bash
# Scale backend to 3 instances (requires load balancer)
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## Environment Variables

### Frontend (VITE_*)
- `VITE_API_URL`: Backend API base URL
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_KEY`: Supabase API key
- `VITE_GA_MEASUREMENT_ID`: Google Analytics measurement ID

### Backend
- `NODE_ENV`: production/development
- `PORT`: Server port (default: 5000)
- `REDIS_URL`: Redis connection URL
- `REDIS_PASSWORD`: Redis authentication password
- `JWT_SECRET`: JWT signing secret
- `DATABASE_URL`: Database connection URL

## Performance Optimization

### Frontend Optimization
```dockerfile
# Use production build
RUN npx vite build

# Gzip compression in Nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### Backend Optimization
```dockerfile
# Use Node.js 20 Alpine (smallest)
FROM node:20-alpine

# Production dependencies only
RUN npm install --production
```

### Redis Optimization
```dockerfile
# Use AOF persistence
redis-server --appendonly yes --appendfsync everysec
```

## Security Considerations

1. **Environment Variables**
   - Never commit `.env.docker` to version control
   - Use Docker Secrets or external secret management
   - Rotate secrets regularly

2. **Network Security**
   - Use private networks between services
   - Expose only necessary ports
   - Implement API rate limiting

3. **Image Security**
   - Use specific Alpine versions, not `latest`
   - Scan images for vulnerabilities
   - Keep base images updated

4. **Redis Security**
   - Always set a strong password
   - Disable dangerous commands in production
   - Use Redis authentication

5. **Backend Security**
   - Enable CORS properly
   - Validate all inputs
   - Use environment variables for secrets

## Monitoring & Logging

### View Container Metrics
```bash
docker stats serique-backend serique-frontend serique-redis
```

### Application Logs Location
```
Backend logs: ./logs/
Nginx access: docker-compose logs frontend
```

### Setup ELK Stack (Optional)
```yaml
# Add to docker-compose.prod.yml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
logstash:
  image: docker.elastic.co/logstash/logstash:8.0.0
kibana:
  image: docker.elastic.co/kibana/kibana:8.0.0
```

## Troubleshooting

### Services Won't Start
```bash
# Check logs
docker-compose logs

# Verify port conflicts
netstat -an | grep LISTEN

# Check image build errors
docker-compose build --no-cache frontend
```

### Connection Issues
```bash
# Test network connectivity
docker-compose exec backend curl http://redis:6379

# Check DNS resolution
docker-compose exec backend nslookup redis
```

### Memory/Performance Issues
```bash
# Monitor resource usage
docker stats

# Check available disk space
docker system df

# Cleanup unused resources
docker system prune -a
```

## Backup & Recovery

### Backup Database
```bash
# Backup Redis
docker-compose exec redis redis-cli BGSAVE
docker cp serique-redis:/data/dump.rdb ./backups/
```

### Backup Files
```bash
# Backup uploads
docker cp serique-backend:/app/uploads ./backups/
```

### Restore from Backup
```bash
# Restore Redis data
docker cp ./backups/dump.rdb serique-redis:/data/
```

## Production Checklist

- [ ] All environment variables set in .env.docker
- [ ] Docker images built and tagged properly
- [ ] Health checks passing for all services
- [ ] Redis persistence enabled
- [ ] File uploads mounted to persistent volume
- [ ] Logs being collected and rotated
- [ ] Monitoring/alerting configured
- [ ] Backup strategy implemented
- [ ] Security audit completed
- [ ] Load testing passed
- [ ] Rollback plan documented

## Support & Resources

- **Docker Documentation**: https://docs.docker.com
- **Docker Compose Reference**: https://docs.docker.com/compose/compose-file
- **Node.js Docker Images**: https://hub.docker.com/_/node
- **Nginx Docker Image**: https://hub.docker.com/_/nginx
- **Redis Docker Image**: https://hub.docker.com/_/redis

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-02 | Initial Docker setup |

---

**Last Updated**: 2026-04-02
**Status**: Production Ready
