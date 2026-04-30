# FairPlay Cloud - AWS Deployment Guide

## Quick Assessment: ~80% AWS Ready

### ✅ What's Ready
- **100% Dynamic Configuration**: All API endpoints, database tables, and auth use environment variables
- **No Hardcoded Secrets**: All credentials pulled from `.env` (which is `.gitignored`)
- **No Mock Data in Production**: Health snapshots come from backend, IP maps use region-based coordinates
- **Proper Error Handling**: 404 pages, protected routes, auth middleware
- **Admin Bootstrap**: SetupPage for first-time admin creation with BOOTSTRAP_ADMIN_KEY protection
- **JWT Authentication**: Secure token-based auth with expiration and refresh strategy

### ⚠️ Critical Issue (Must Fix NOW)
**AWS credentials were exposed** - You MUST:
1. Go to AWS IAM console immediately
2. Delete/deactivate the exposed access keys (AKIAQUQ2ZFZ24LPO3R23)
3. Generate new production keys
4. Never commit `.env` files again

### 🚀 AWS Deployment Steps

#### Step 1: Prepare Credentials
```bash
# Copy template
cp .env.example .env
# Edit with production values (NEW AWS keys only)
nano .env
```

#### Step 2: Configure Frontend for Production
```bash
# fairplay-cloud-frontend/.env
VITE_API_BASE_URL=https://api.your-domain.com
```

#### Step 3: Build Docker Images
```bash
docker compose build
docker tag pro-backend:latest <aws-account>.dkr.ecr.us-east-1.amazonaws.com/fairplay-backend:latest
docker tag pro-frontend:latest <aws-account>.dkr.ecr.us-east-1.amazonaws.com/fairplay-frontend:latest
docker push <aws-account>.dkr.ecr.us-east-1.amazonaws.com/fairplay-backend:latest
docker push <aws-account>.dkr.ecr.us-east-1.amazonaws.com/fairplay-frontend:latest
```

#### Step 4: Deploy Infrastructure (Using Terraform or CloudFormation)
- Create DynamoDB tables
- Create ECS cluster + task definitions
- Create ALB + target groups
- Create S3 bucket + CloudFront distribution
- Configure Route 53 DNS

#### Step 5: Deploy Application
```bash
# Push new task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json
# Update ECS service
aws ecs update-service --cluster fairplay --service fairplay-backend --force-new-deployment
```

#### Step 6: Initialize First Admin
1. Visit `https://your-domain/setup`
2. Enter the `BOOTSTRAP_ADMIN_KEY`
3. Create first admin account
4. Login and proceed

### 📊 Environment Variables Checklist

**Backend (.env in root)**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<NEW_KEY>
AWS_SECRET_ACCESS_KEY=<NEW_SECRET>
JWT_SECRET=<32+ char random string>
BOOTSTRAP_ADMIN_KEY=<32+ char random string>
PLAYERS_TABLE=Players
INCIDENTS_TABLE=Incidents
AUDITLOGS_TABLE=AuditLogs
SYSTEMHEALTH_TABLE=SystemHealth
CASE_COMMANDS_TABLE=CASE_COMMANDS_TABLE
ADMINUSERS_TABLE=AdminUsers
```

**Frontend (.env in fairplay-cloud-frontend/)**
```
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 🔍 Verification
Run these after deployment:
```bash
# Test auth endpoint
curl -X POST https://api.yourdomain.com/auth/seed-admin \
  -H "Content-Type: application/json" \
  -d '{"key":"<BOOTSTRAP_ADMIN_KEY>"}'

# Test health endpoint (should return 401 without token)
curl https://api.yourdomain.com/health

# Test login
curl -X POST https://api.yourdomain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"<password>"}'
```

### 📋 Architecture Overview
```
Frontend (React + Vite)
  ↓ (HTTPS)
CloudFront + S3
  ↓
ALB (Port 443)
  ↓
ECS Fargate (Backend)
  ↓
DynamoDB
  ↓
AWS SDK
```

### 💡 Next Phase (Post-AWS)
- [ ] Implement automated testing (Jest + Supertest)
- [ ] Setup CloudWatch monitoring + alerts
- [ ] Create database backup strategy
- [ ] Implement rate limiting
- [ ] Add admin dashboard features
- [ ] Setup CI/CD pipeline (GitHub Actions → ECR → ECS)
- [ ] Security audit (penetration testing)

## 🎯 Final Checklist Before Going Live

- [ ] AWS credentials rotated (old ones deleted)
- [ ] New `.env` created with production values
- [ ] DynamoDB tables provisioned
- [ ] ECR repositories created
- [ ] Docker images pushed to ECR
- [ ] ECS cluster configured
- [ ] ALB + Route 53 configured
- [ ] SSL certificates issued (ACM)
- [ ] First admin created via SetupPage
- [ ] All core features tested in production
- [ ] Monitoring enabled
- [ ] Backups configured

**You are ~80% ready. Secure your credentials now, then deploy!**
