# AWS Deployment Readiness Checklist

## ✅ Completed (Application Code)
- [x] All endpoints dynamic (no hardcoded URLs)
- [x] All database table names from env vars
- [x] JWT auth properly configured
- [x] Bootstrap admin setup protected
- [x] Error handling and logging in place
- [x] 404 pages and proper routing
- [x] Privacy: Removed third-party geolocation
- [x] Health data from backend (not mocked)

## 🔐 Security (CRITICAL - Must Complete Before AWS)
- [ ] **REVOKE AWS CREDENTIALS IMMEDIATELY** - Current keys in history are exposed
  - Go to AWS IAM → Delete/deactivate old access keys
  - Generate new keys for production
- [x] `.env` files NOT in git (verified)
- [x] `.env.example` templates created (placeholder values only)

## 🚀 Pre-Deployment Tasks

### 1. Environment Setup
```bash
# Backend (.env in project root)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<new_production_key>
AWS_SECRET_ACCESS_KEY=<new_production_secret>
JWT_SECRET=<strong_random_32+_char_secret>
BOOTSTRAP_ADMIN_KEY=<strong_bootstrap_key>
PLAYERS_TABLE=Players
INCIDENTS_TABLE=Incidents
AUDITLOGS_TABLE=AuditLogs
SYSTEMHEALTH_TABLE=SystemHealth
CASE_COMMANDS_TABLE=CASE_COMMANDS_TABLE
ADMINUSERS_TABLE=AdminUsers
```

### 2. Frontend Setup
```bash
# fairplay-cloud-frontend/.env (production)
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 3. AWS Infrastructure Required
- [ ] DynamoDB tables created (Players, Incidents, AuditLogs, SystemHealth, CASE_COMMANDS_TABLE, AdminUsers)
- [ ] IAM role for EC2/ECS with DynamoDB permissions
- [ ] RDS (optional, currently using DynamoDB only)
- [ ] ALB for backend (port 3001)
- [ ] CloudFront + S3 for frontend static files
- [ ] SSL certificates (ACM)
- [ ] Route 53 DNS configuration

### 4. Docker Images
- [x] Backend Dockerfile ready
- [x] Frontend Dockerfile ready
- [ ] Push to ECR

### 5. CI/CD Pipeline
- [ ] GitHub Actions workflow for:
  - Run tests
  - Build Docker images
  - Push to ECR
  - Deploy to ECS/EC2

## 📋 Data Requirements

Before first admin setup:
1. Generate strong `BOOTSTRAP_ADMIN_KEY` (minimum 32 characters)
2. Visit deployed app at `/setup` 
3. Enter bootstrap key to create first admin account
4. Login with admin credentials
5. Proceed to create users/players/incidents

## 🔍 Verification Checklist
- [ ] Backend connects to DynamoDB
- [ ] Frontend API calls go to ALB (not localhost)
- [ ] JWT tokens generated correctly
- [ ] Protected routes require auth
- [ ] Admin bootstrap works only with correct key
- [ ] Audit logs recorded
- [ ] Health snapshots captured
- [ ] All data flows are live (not mocked)

## ⚠️ Known Gaps (For Next Phase)
- No automated testing pipeline
- No database migrations/seeding automation
- No monitoring/CloudWatch integration
- No backup strategy documented
- No disaster recovery plan
- No load testing done
- Admin dashboard not implemented

## 📞 Ready for AWS?
**Current Status: ~80% Ready**

**Critical Blocker:**
- AWS credentials must be rotated immediately

**What's Ready:**
- Application code fully dynamic and secure
- All endpoints point to env vars
- No hardcoded localhost or mock data
- 12-factor app compliance

**What Still Needed:**
- AWS infrastructure provisioning (IaC)
- Secrets management (Secrets Manager or Parameter Store)
- CI/CD pipeline
- Load testing
- Production URL configuration
