# FairPlay Cloud - Complete AWS Deployment Guide
## EC2 + ALB + HTTPS + CloudFront + S3

### Prerequisites
- AWS Account with billing enabled
- Domain name (e.g., fairplay.example.com)
- AWS CLI installed locally
- Docker installed locally
- Git access to your repo

---

## PHASE 1: AWS Account Setup & Credentials

### Step 1.1: Create IAM User for Deployment
1. Go to AWS Console → IAM → Users
2. Click "Create user" → Name: `fairplay-deployment`
3. Click "Next"
4. Select "Attach policies directly"
5. Search and attach these policies:
   - `AmazonEC2FullAccess`
   - `AmazonDynamoDBFullAccess`
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
   - `AWSCertificateManagerFullAccess`
   - `Route53FullAccess`
   - `ElasticLoadBalancingFullAccess`
   - `ECRFullAccess`
   - `AmazonEC2ContainerRegistryPowerUser`
6. Click "Create user"
7. Click on user → "Create access key"
8. Select "Application running outside AWS"
9. Copy the Access Key ID and Secret Access Key
10. **SAVE THESE SECURELY** (use 1Password, AWS Secrets Manager, etc.)

### Step 1.2: Configure AWS CLI Locally
```bash
# Windows PowerShell
aws configure

# When prompted:
AWS Access Key ID: <paste from step above>
AWS Secret Access Key: <paste from step above>
Default region name: us-east-1
Default output format: json

# Verify configuration
aws sts get-caller-identity
```

---

## PHASE 2: Create DynamoDB Tables

### Step 2.1: Create Tables via AWS Console
Go to AWS Console → DynamoDB → Tables → Create table

**Table 1: Players**
- Table name: `Players`
- Partition key: `playerId` (String)
- Billing mode: Pay-per-request (easier for startup)
- Click Create

**Table 2: Incidents**
- Table name: `Incidents`
- Partition key: `incidentId` (String)
- Click Create

**Table 3: AuditLogs**
- Table name: `AuditLogs`
- Partition key: `logId` (String)
- Click Create

**Table 4: SystemHealth**
- Table name: `SystemHealth`
- Partition key: `healthCheckId` (String)
- Click Create

**Table 5: CASE_COMMANDS_TABLE**
- Table name: `CASE_COMMANDS_TABLE`
- Partition key: `caseId` (String)
- Click Create

**Table 6: AdminUsers**
- Table name: `AdminUsers`
- Partition key: `userId` (String)
- Click Create

---

## PHASE 3: Create ECR Repositories

### Step 3.1: Create ECR Repos via AWS Console
Go to AWS Console → ECR → Repositories → Create repository

**Important:** the IAM user used for pushing images must have ECR permissions. If `aws ecr get-login-password` returns `AccessDeniedException`, attach one of these policies to the user:
- `AmazonEC2ContainerRegistryPowerUser` (recommended)
- `AmazonEC2ContainerRegistryFullAccess` (broader)

The push step cannot continue until `ecr:GetAuthorizationToken` is allowed.

**Repository 1:**
- Name: `fairplay-backend`
- Tag immutability: Disabled
- Scan on push: Enabled
- Click Create

**Repository 2:**
- Name: `fairplay-frontend`
- Tag immutability: Disabled
- Click Create

### Step 3.2: Push Docker Images to ECR
```bash
# Get your AWS account ID
$ACCOUNT_ID = "044079591029"
$REGION = "us-east-1"

# Login to ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build and tag backend image
cd c:\pro\fairplay-cloud-backend
docker build -t fairplay-backend:latest .
docker tag fairplay-backend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/fairplay-backend:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/fairplay-backend:latest

# Build and tag frontend image
cd c:\pro\fairplay-cloud-frontend
docker build -t fairplay-frontend:latest .
docker tag fairplay-frontend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/fairplay-frontend:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/fairplay-frontend:latest

echo "✅ Images pushed to ECR"
```

---

## PHASE 4: Create EC2 Instance for Backend

### Step 4.1: Launch EC2 Instance
1. Go to AWS Console → EC2 → Instances → Launch instances
2. **Name:** `fairplay-backend-1`
3. **AMI:** Ubuntu Server 24.04 LTS (t2.medium or larger)
4. **Instance type:** t2.medium (at least 2GB RAM for Node.js)
5. **Key pair:**
   - Click "Create new key pair"
   - Name: `fairplay-backend-key`
   - Type: RSA
   - Format: .pem
   - Download the file (save to `c:\pro\fairplay-backend-key.pem`)
6. **Network settings:**
   - VPC: Default VPC
   - Subnet: Default subnet
   - Auto-assign public IP: Enable
7. **Firewall (Security Group):**
   - Click "Create security group"
   - Name: `fairplay-backend-sg`
   - Description: Backend security group
   - Inbound rules:
     - Type: SSH, Port: 22, Source: 0.0.0.0/0 (restrict this in production)
     - Type: HTTP, Port: 80, Source: 0.0.0.0/0
     - Type: Custom TCP, Port: 3001, Source: 0.0.0.0/0
     - Type: HTTPS, Port: 443, Source: 0.0.0.0/0
   - Click Create security group
8. **Storage:** 
   - Volume size: 20 GB
   - Volume type: gp3
9. Click "Launch instance"
10. **Wait for instance to be "Running"**

### Step 4.2: Connect to EC2 Instance

```bash
# PowerShell (Windows)
# First, set key permissions
icacls "c:\pro\fairplay-backend-key.pem" /inheritance:r /grant:r "$($env:USERNAME):(F)"

# Get instance public IP
$INSTANCE_IP = aws ec2 describe-instances `
  --filters "Name=tag:Name,Values=fairplay-backend-1" `
  --query 'Reservations[0].Instances[0].PublicIpAddress' `
  --output text

# SSH into instance
ssh -i c:\pro\fairplay-backend-key.pem ubuntu@$INSTANCE_IP

# On the EC2 instance, run these commands:
```

### Step 4.3: Setup EC2 Instance

```bash
# On EC2 instance (after SSH)

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io
sudo usermod -aG docker ubuntu
newgrp docker

# Install AWS CLI
sudo apt install -y awscli

# Install Node.js (optional, for local testing)
sudo apt install -y nodejs npm

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Create app directory
mkdir -p /home/ubuntu/fairplay-backend
cd /home/ubuntu/fairplay-backend

# Create .env file
sudo tee /home/ubuntu/fairplay-backend/.env > /dev/null <<EOF
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<YOUR_NEW_AWS_ACCESS_KEY>
AWS_SECRET_ACCESS_KEY=<YOUR_NEW_AWS_SECRET_KEY>
PORT=3001
JWT_SECRET=<GENERATE_NEW_STRONG_SECRET_32_CHARS>
JWT_EXPIRES_IN=1d
JWT_ISSUER=fairplay-cloud-backend
JWT_AUDIENCE=fairplay-cloud-frontend
BOOTSTRAP_ADMIN_KEY=<GENERATE_NEW_STRONG_KEY_32_CHARS>
PLAYERS_TABLE=Players
INCIDENTS_TABLE=Incidents
AUDITLOGS_TABLE=AuditLogs
SYSTEMHEALTH_TABLE=SystemHealth
CASE_COMMANDS_TABLE=CASE_COMMANDS_TABLE
ADMINUSERS_TABLE=AdminUsers
EOF

# Verify .env
cat /home/ubuntu/fairplay-backend/.env

# Pull and run backend image
docker pull <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fairplay-backend:latest
docker run -d \
  --name fairplay-backend \
  --env-file /home/ubuntu/fairplay-backend/.env \
  -p 3001:3001 \
  <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fairplay-backend:latest

# Verify container is running
docker ps
docker logs fairplay-backend

# Exit SSH
exit
```

### Step 4.4: Test Backend on EC2

```bash
# From local machine
curl http://$INSTANCE_IP:3001/health
```

You should see health data response.

---

## PHASE 5: Create Application Load Balancer (ALB)

### Step 5.1: Create Target Group
1. Go to AWS Console → EC2 → Load Balancing → Target Groups
2. Click "Create target group"
3. **Basic configuration:**
   - Choose target type: Instances
   - Target group name: `fairplay-backend-tg`
   - Protocol: HTTP
   - Port: 3001
   - VPC: Default VPC
4. **Health check settings:**
   - Protocol: HTTP
   - Path: `/health`
   - Port: 3001
   - Matcher: 200-299
   - Interval: 30 seconds
   - Timeout: 5 seconds
   - Healthy threshold: 2
   - Unhealthy threshold: 3
5. Click "Next"
6. **Register targets:**
   - Select your fairplay-backend-1 instance
   - Port: 3001
   - Click "Include as pending below"
   - Click "Create target group"

### Step 5.2: Create Application Load Balancer
1. Go to AWS Console → EC2 → Load Balancing → Load Balancers
2. Click "Create load balancer" → "Application Load Balancer"
3. **Basic configuration:**
   - Name: `fairplay-alb`
   - Scheme: Internet-facing
   - IP address type: IPv4
4. **Network mapping:**
   - VPC: Default VPC
   - Availability Zones: Select at least 2
5. **Security groups:**
   - Click "Create new security group" named `fairplay-alb-sg`
   - Inbound rules:
     - HTTP (80): Source 0.0.0.0/0
     - HTTPS (443): Source 0.0.0.0/0
   - Click Create
6. **Listeners and routing:**
   - Protocol: HTTP
   - Port: 80
   - Default action: Forward to `fairplay-backend-tg`
7. Click "Create load balancer"
8. **Wait for ALB to be "Active"**

### Step 5.3: Get ALB DNS Name

```bash
# PowerShell
$ALB_DNS = aws elbv2 describe-load-balancers `
  --names fairplay-alb `
  --query 'LoadBalancers[0].DNSName' `
  --output text

echo "ALB DNS: $ALB_DNS"

# Test backend through ALB
curl http://$ALB_DNS/health
```

---

## PHASE 6: Create SSL Certificate & Enable HTTPS

### Step 6.1: Request SSL Certificate from ACM
1. Go to AWS Console → Certificate Manager → Request certificate
2. **Certificate details:**
   - Domain names: 
     - `api.yourdomain.com` (for backend)
     - `*.yourdomain.com` (wildcard)
   - Validation method: DNS validation
3. Click "Request"
4. **Validation:**
   - Copy the DNS records provided
   - Go to your domain registrar (GoDaddy, Route 53, etc.)
   - Add the CNAME records
   - **Wait 5-10 minutes** for validation to complete

### Step 6.2: Add HTTPS Listener to ALB
1. Go to AWS Console → EC2 → Load Balancers
2. Click on `fairplay-alb`
3. Go to "Listeners" tab
4. Click "Add listener"
5. **Listener configuration:**
   - Protocol: HTTPS
   - Port: 443
   - Default action: Forward to `fairplay-backend-tg`
   - SSL certificate: Select the certificate you just created
   - SSL policy: ELBSecurityPolicy-TLS-1-2-2017-01
6. Click "Add listener"
7. **Update HTTP listener to redirect:**
   - Click on the HTTP listener
   - Click "Edit"
   - Change default action to "Redirect"
   - Redirect to: HTTPS, port 443, original path
   - Click "Save changes"

---

## PHASE 7: Setup Route 53 DNS

### Step 7.1: Create Hosted Zone
1. Go to AWS Console → Route 53 → Hosted zones
2. Click "Create hosted zone"
3. Domain name: `yourdomain.com`
4. Type: Public hosted zone
5. Click "Create hosted zone"
6. **Update your domain registrar nameservers** to point to Route 53

### Step 7.2: Create DNS Records
1. In your hosted zone, click "Create record"
2. **For backend API:**
   - Subdomain: `api`
   - Record name: `api.yourdomain.com`
   - Type: A
   - Alias: Yes
   - Route traffic to: Application Load Balancer
   - Region: us-east-1
   - Select your `fairplay-alb`
   - Click "Create records"

---

## PHASE 8: Deploy Frontend to S3 + CloudFront

### Step 8.1: Create S3 Bucket for Frontend
1. Go to AWS Console → S3 → Create bucket
2. **Bucket configuration:**
   - Bucket name: `fairplay-frontend-<random-string>` (must be globally unique)
   - Region: us-east-1
   - Uncheck "Block all public access"
3. Click "Create bucket"

### Step 8.2: Build Frontend with Production URL

```bash
# On local machine
cd c:\pro\fairplay-cloud-frontend

# Create .env.production
$env:VITE_API_BASE_URL = "https://api.yourdomain.com"

# Build
npm run build

# This creates the dist/ folder
ls dist/
```

### Step 8.3: Upload Frontend to S3

```bash
# PowerShell
$BUCKET_NAME = "fairplay-frontend-<your-unique-name>"

# Upload build files
aws s3 sync c:\pro\fairplay-cloud-frontend\dist\ s3://$BUCKET_NAME `
  --cache-control "max-age=3600" `
  --region us-east-1

# Set index.html to not cache
aws s3 cp c:\pro\fairplay-cloud-frontend\dist\index.html `
  s3://$BUCKET_NAME/index.html `
  --cache-control "no-cache, no-store, must-revalidate" `
  --content-type "text/html" `
  --region us-east-1

echo "✅ Frontend uploaded to S3"
```

### Step 8.4: Create CloudFront Distribution
1. Go to AWS Console → CloudFront → Create distribution
2. **Origin settings:**
   - Origin domain: Select your S3 bucket from dropdown
   - S3 access: Select "Yes use OAC"
   - Create new OAC
   - Allowed HTTP methods: GET, HEAD, OPTIONS
3. **Default cache behavior:**
   - Viewer protocol policy: Redirect HTTP to HTTPS
   - Allowed HTTP methods: GET, HEAD
   - Cache key and origin requests: Legacy cache settings
   - Compress objects automatically: Yes
4. **Response headers policy:**
   - Click "Create response headers policy"
   - Add CORS headers if needed
5. **Distribution settings:**
   - Enabled: Yes
   - Alternative domain names (CNAMEs):
     - `yourdomain.com`
     - `www.yourdomain.com`
   - SSL certificate: Select your ACM certificate
6. Click "Create distribution"
7. **Wait for status "Enabled" (10-15 minutes)**

### Step 8.5: Update S3 Bucket Policy
CloudFront will automatically update the S3 bucket policy. Verify:

```bash
# Check bucket policy
aws s3api get-bucket-policy --bucket $BUCKET_NAME
```

### Step 8.6: Create CloudFront DNS Records
1. Go to Route 53 → Your hosted zone
2. Create records for CloudFront:
   - Record name: `yourdomain.com`
   - Type: A
   - Alias: Yes
   - Route traffic to: CloudFront distribution
   - Select your distribution
   - Click "Create records"
3. Repeat for `www.yourdomain.com`

---

## PHASE 9: Update Frontend API Configuration

### Step 9.1: Update Environment Variables
```bash
# Update frontend .env with production API URL
cd c:\pro\fairplay-cloud-frontend

# Edit .env
notepad .env

# Change:
VITE_API_BASE_URL=https://api.yourdomain.com

# Rebuild
npm run build

# Upload to S3
aws s3 sync dist/ s3://$BUCKET_NAME --delete
```

### Step 9.2: Invalidate CloudFront Cache
```bash
# Get distribution ID
$DIST_ID = aws cloudfront list-distributions `
  --query "DistributionList.Items[?DomainName=='d11111111111.cloudfront.net'].Id" `
  --output text

# Invalidate cache
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"

echo "✅ CloudFront cache invalidated"
```

---

## PHASE 10: Test Everything

### Step 10.1: Test Backend
```bash
# Test through ALB
curl -X GET https://api.yourdomain.com/health

# Test through CloudFront (backend should be accessible via API)
curl -X GET https://yourdomain.com/health
# This should fail (frontend only, not API) - that's correct

# Test frontend accessibility
# Open browser: https://yourdomain.com
```

### Step 10.2: Test Setup Page (Admin Bootstrap)
```bash
# On EC2, regenerate strong keys if needed
# Visit: https://yourdomain.com/setup
# Enter BOOTSTRAP_ADMIN_KEY from .env
# Create admin account
# Login with admin credentials
```

### Step 10.3: Test Full Flow
1. Visit `https://yourdomain.com`
2. Click "Login"
3. If no admin exists, click "Open setup"
4. Enter bootstrap key
5. Create admin account
6. Login
7. Navigate through app
8. Check that data is saved to DynamoDB

---

## PHASE 11: Auto-Scaling (Optional but Recommended)

### Step 11.1: Create Launch Template
1. Go to AWS Console → EC2 → Launch Templates
2. Click "Create launch template"
3. **Template content:**
   - Name: `fairplay-backend-template`
   - AMI: Ubuntu 24.04 LTS
   - Instance type: t2.medium
   - Key pair: fairplay-backend-key
   - Security group: fairplay-backend-sg
   - User data script:
     ```bash
     #!/bin/bash
     sudo apt update
     sudo apt install -y docker.io
     sudo usermod -aG docker ubuntu
     newgrp docker
     sudo apt install -y awscli
     
     mkdir -p /home/ubuntu/fairplay-backend
     cd /home/ubuntu/fairplay-backend
     
     # Create .env (same as before)
     sudo tee .env > /dev/null <<EOF
     # ... your env vars
     EOF
     
     aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
     docker pull <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fairplay-backend:latest
     docker run -d --name fairplay-backend --env-file .env -p 3001:3001 <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fairplay-backend:latest
     EOF
4. Click "Create launch template"

### Step 11.2: Create Auto Scaling Group
1. Go to AWS Console → EC2 → Auto Scaling Groups
2. Click "Create Auto Scaling group"
3. **Configuration:**
   - Name: `fairplay-backend-asg`
   - Launch template: fairplay-backend-template
   - VPC: Default
   - Subnets: Select multiple
   - Target group: fairplay-backend-tg
   - Desired capacity: 2
   - Minimum capacity: 1
   - Maximum capacity: 4
4. Click "Create Auto Scaling group"

---

## PHASE 12: Monitoring & Logging

### Step 12.1: CloudWatch Monitoring
1. Go to AWS Console → CloudWatch → Dashboards
2. Create dashboard: `fairplay-app-dashboard`
3. Add widgets:
   - ALB request count
   - Target health
   - EC2 CPU utilization
   - DynamoDB read/write capacity

### Step 12.2: Enable EC2 Logs
```bash
# On EC2 instance
docker logs -f fairplay-backend

# Or from local:
ssh -i fairplay-backend-key.pem ubuntu@<EC2_IP>
docker logs fairplay-backend
```

---

## PHASE 13: Backup & Disaster Recovery

### Step 13.1: DynamoDB Backups
1. Go to AWS Console → DynamoDB → Backups
2. For each table, enable automatic backups:
   - Retention: 7 days (or more)

### Step 13.2: Database Export to S3
```bash
# Periodic exports for disaster recovery
aws dynamodb create-backup \
  --table-name Players \
  --backup-name players-backup-$(date +%Y%m%d)
```

---

## PHASE 14: Security Hardening

### Step 14.1: Restrict Security Groups
```bash
# Replace 0.0.0.0/0 with specific IPs:

# For SSH (your IP only)
aws ec2 authorize-security-group-ingress \
  --group-name fairplay-backend-sg \
  --protocol tcp --port 22 --cidr YOUR_IP/32

# For backend port 3001 (ALB only)
aws ec2 authorize-security-group-ingress \
  --group-name fairplay-backend-sg \
  --protocol tcp --port 3001 \
  --source-group fairplay-alb-sg
```

### Step 14.2: Enable AWS WAF (Web Application Firewall)
1. Go to AWS Console → WAF & Shield
2. Create Web ACL for CloudFront
3. Add rules for rate limiting, SQL injection protection, etc.

### Step 14.3: Secrets Manager for Credentials
```bash
# Store sensitive values in Secrets Manager
aws secretsmanager create-secret \
  --name fairplay/jwt-secret \
  --secret-string "YOUR_JWT_SECRET"

# Update EC2 to retrieve from Secrets Manager instead of .env file
```

---

## TROUBLESHOOTING

### Backend not responding through ALB
```bash
# Check EC2 instance
aws ec2 describe-instances --filters "Name=tag:Name,Values=fairplay-backend-1"

# SSH and check Docker
docker ps
docker logs fairplay-backend
docker inspect fairplay-backend | grep IPAddress

# Check security group rules
aws ec2 describe-security-groups --group-names fairplay-backend-sg
```

### Frontend not loading
```bash
# Check S3 bucket policy
aws s3api get-bucket-policy --bucket $BUCKET_NAME

# Check CloudFront cache
aws cloudfront get-distribution --id $DIST_ID

# Invalidate cache
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

### API calls failing from frontend
1. Check `VITE_API_BASE_URL` matches your domain
2. Check ALB health checks passing
3. Check backend .env variables
4. Check DynamoDB tables exist
5. Check JWT_SECRET and other secrets are correct

### Database not saving data
1. Verify DynamoDB tables exist
2. Check IAM permissions
3. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
4. Check CloudWatch Logs for errors

---

## COST ESTIMATION (per month)

| Service | Estimate |
|---------|----------|
| EC2 (t2.medium × 2) | $50-60 |
| ALB | $15-20 |
| DynamoDB (pay-per-request) | $5-50* |
| S3 (frontend hosting) | $0-5 |
| CloudFront | $0-20 |
| Route 53 | $0.50 |
| **Total** | **$70-150** |

*DynamoDB costs vary by usage

---

## FINAL CHECKLIST

- [ ] IAM user created with appropriate permissions
- [ ] DynamoDB tables created
- [ ] ECR repositories created and images pushed
- [ ] EC2 instance launched and backend running
- [ ] ALB created and healthy
- [ ] SSL certificate issued and HTTPS enabled
- [ ] Route 53 DNS configured
- [ ] Frontend built and uploaded to S3
- [ ] CloudFront distribution created
- [ ] DNS records pointing to CloudFront
- [ ] All services tested
- [ ] Backend accessible via HTTPS
- [ ] Frontend accessible and calls backend
- [ ] Admin setup works
- [ ] Data persists in DynamoDB
- [ ] Monitoring configured
- [ ] Auto-scaling (optional) configured
- [ ] Backups configured

**🎉 When all boxes are checked, your app is production-ready!**

---

## Next Steps After Deployment

1. **Setup CI/CD Pipeline** (GitHub Actions)
   - Auto-build Docker images on push
   - Auto-push to ECR
   - Auto-deploy to EC2

2. **Add Monitoring Alerts**
   - SNS notifications on ALB health check failures
   - CloudWatch alarms for high CPU/memory

3. **Setup Email/Messaging**
   - SES for email notifications
   - SNS for SMS alerts

4. **Implement Rate Limiting**
   - Using Redis (ElastiCache) for session/rate limiting

5. **Add CDN for API** (optional)
   - Use API Gateway instead of ALB for serverless
   - Or keep ALB but add caching layer

---

**Questions? Stuck? Let me know at which phase you are!**
