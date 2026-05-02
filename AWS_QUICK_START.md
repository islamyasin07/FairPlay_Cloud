# AWS Deployment - Quick Reference & Before You Start

## 📋 What You'll Have After Following This Guide

✅ **Backend (Docker on EC2)** - Running Node.js backend on scalable instances
✅ **Load Balancer (ALB)** - Distributes traffic across multiple instances
✅ **HTTPS/SSL** - Secure encrypted connections via ACM certificates
✅ **Auto-Scaling** - Automatically adds/removes instances based on demand
✅ **Frontend (S3 + CloudFront)** - Static files cached globally at edge
✅ **DNS (Route 53)** - Custom domain routing
✅ **Database (DynamoDB)** - Managed NoSQL database for your data
✅ **Monitoring** - CloudWatch dashboards and logs

## Architecture Diagram
```
Users
  ↓
Domain (yourdomain.com)
  ↓
Route 53 DNS
  ↓
CloudFront (CDN) ← Frontend (S3)
  ↓
ALB (Load Balancer) ← HTTPS/SSL
  ↓
EC2 Instances (Auto-scaling Group)
  ↓
Docker Containers (Backend)
  ↓
DynamoDB Tables
```

## 🎯 Before You Start - Prerequisites Checklist

- [ ] AWS Account created and verified
- [ ] Payment method added to AWS
- [ ] AWS Access Keys generated (with safe storage)
- [ ] Domain name purchased (optional for Phase 7+)
- [ ] Local AWS CLI configured (`aws configure`)
- [ ] Docker installed and running locally
- [ ] Git with your repo cloned locally
- [ ] Terminal/PowerShell access

## 📍 Deployment Phases Overview

| Phase | Duration | What You'll Do | Complexity |
|-------|----------|--------------|-----------|
| 1 | 5 min | Create IAM user & configure AWS CLI | ⭐ |
| 2 | 10 min | Create DynamoDB tables | ⭐ |
| 3 | 15 min | Setup ECR & push Docker images | ⭐⭐ |
| 4 | 20 min | Launch EC2 instance & deploy backend | ⭐⭐ |
| 5 | 15 min | Create Application Load Balancer | ⭐⭐ |
| 6 | 20 min | Setup SSL/HTTPS with ACM certificate | ⭐⭐ |
| 7 | 15 min | Setup Route 53 DNS (requires domain) | ⭐⭐ |
| 8-9 | 20 min | Deploy frontend to S3 + CloudFront | ⭐⭐ |
| 10 | 15 min | Test everything end-to-end | ⭐ |
| 11+ | Optional | Auto-scaling, monitoring, backups | ⭐⭐⭐ |

**Total Time: ~2-3 hours for full production setup**

## 🚨 Important Before Starting

### 1. Rotate AWS Credentials (CRITICAL!)
Your current `.env` file contains exposed AWS keys. Before deploying:

```bash
# ⚠️ IMMEDIATELY do this:
# 1. Go to AWS IAM → Users → fairplay-deployment
# 2. Delete/deactivate the old access key
# 3. Create a NEW access key
# 4. Use the NEW key in Phase 1 setup
# 5. Never, ever commit .env files again
```

### 2. Prepare Environment Variables

```bash
# You'll need these STRONG values (32+ characters each):
$JWT_SECRET = "<generate strong random value>"
$BOOTSTRAP_ADMIN_KEY = "<generate strong random value>"

# Generate in PowerShell:
[System.Convert]::ToBase64String([System.Random]::new().GetBytes(32))
```

### 3. Domain Name (Optional but Recommended)
- If doing Phase 7-9: Get a domain (Route 53, GoDaddy, Namecheap, etc.)
- Cost: $10-50/year
- You can test without a domain using ALB DNS directly

### 4. Estimated Costs

**One-time costs:**
- Domain: $15-50 (yearly)
- SSL Certificate: Free (AWS ACM)

**Monthly costs (approximate):**
- 2 EC2 t2.medium instances: $60
- ALB: $20
- DynamoDB: $10-50 (depends on usage)
- S3: $0-5
- CloudFront: $0-20
- Route 53: $0.50
- **Total: ~$100-200/month**

*You can reduce costs by using:*
- Smaller instances (t2.small): $30
- Reserved instances (1-year): -40% discount
- Spot instances: -70% discount (but can be interrupted)

## 🔄 Recommended Order

**Option A: Without custom domain (Quick test)**
1. Phase 1: IAM setup ← START HERE
2. Phase 2: DynamoDB tables
3. Phase 3: ECR repositories & push images
4. Phase 4: EC2 backend instance
5. Phase 5: Load Balancer
6. Phase 6: SSL certificate (skip ACM, test with ALB DNS)
7. Phase 10: Test with direct ALB DNS URL

**Option B: Full production (With domain)**
1. Phase 1: IAM setup ← START HERE
2. Phase 2-5: Infrastructure (same as above)
3. Phase 6: SSL certificate
4. Phase 7: Route 53 DNS
5. Phase 8-9: S3 + CloudFront frontend
6. Phase 10-14: Testing, monitoring, security

## ✋ Stop Points - Where You Can Pause

You can stop and resume at any phase. Current instances will keep running:
- **Stop after Phase 4:** Backend running on EC2 (costs ~$15/day)
- **Stop after Phase 5:** With ALB (costs ~$16/day)
- **Stop after Phase 9:** Full stack running (costs ~$18/day)

To minimize costs while paused:
```bash
# Reduce instances to 1
aws autoscaling set-desired-capacity --auto-scaling-group-name fairplay-backend-asg --desired-capacity 1

# Or stop instance temporarily
aws ec2 stop-instances --instance-ids i-xxxxx
```

## 🆘 Getting Help During Deployment

**If you get stuck:**
1. Check the detailed guide section for that phase
2. Look at the Troubleshooting section
3. Check AWS CloudWatch Logs for error messages
4. Verify security group rules are correct
5. Ensure environment variables are set correctly

## 📝 Step-by-Step Guide Location

Open and follow: `AWS_COMPLETE_DEPLOYMENT.md`

Each phase has:
- Exact AWS console steps
- Copy-paste ready CLI commands
- Expected outputs
- Troubleshooting tips

## 🎬 Ready? Let's Start!

**Next step:** Open `AWS_COMPLETE_DEPLOYMENT.md` and follow **Phase 1: AWS Account Setup**

Come back here if you:
- Want to skip to a specific phase
- Need help understanding architecture
- Want to estimate costs for different scenarios
- Are ready to start the deployment

---

## Phase 1 Quick Start (Copy-Paste Ready)

```bash
# 1. Configure AWS CLI
aws configure
# Enter: New Access Key ID, Secret Access Key, region: us-east-1, format: json

# 2. Verify configuration
aws sts get-caller-identity
# Should show your AWS account

# 3. You're ready for Phase 1!
# Open AWS_COMPLETE_DEPLOYMENT.md and follow Phase 1 in detail
```

**Good luck! You've got this! 🚀**
