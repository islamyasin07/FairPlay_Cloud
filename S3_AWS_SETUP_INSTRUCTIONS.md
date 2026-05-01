# AWS S3 Setup Instructions for FairPlay Cloud

## ⚠️ CRITICAL SECURITY FIRST: Rotate Exposed Credentials

Your current AWS credentials are exposed in `.env`. **Do this FIRST before anything else:**

### Step 1: Delete Exposed Access Key (AWS Console)
1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/home#/users)
2. Click on your user account name
3. Go to **Security credentials** tab
4. Find access key starting with `AKIAQUQ2ZFZ24LPO3R23`
5. Click **Delete** → Confirm

---

## Phase 1: AWS Setup (Follow in Order)

### Step 1: Create S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/s3/)
2. Click **Create bucket**
3. Fill in:
   - **Bucket name:** `fairplay-cloud-evidence`
   - **Region:** `us-east-1` (or your preferred region)
4. Click **Create bucket**

#### 1.1: Enable Versioning (for audit trail)
1. Open bucket → **Properties** tab
2. Scroll to **Versioning**
3. Click **Edit** → Select **Enable** → **Save**

#### 1.2: Enable Encryption
1. Stay in **Properties** tab
2. Scroll to **Default encryption**
3. Click **Edit**
4. Select **SSE-S3 (Server-side encryption with Amazon S3 managed keys)**
5. Click **Save**

#### 1.3: Block Public Access
1. Go to **Permissions** tab
2. Scroll to **Block public access (bucket settings)**
3. Click **Edit**
4. ✅ Check all 4 boxes (Block all public access)
5. Click **Save**

---

### Step 2: Create IAM Role for Backend

1. Go to [AWS IAM Console - Roles](https://console.aws.amazon.com/iam/home#/roles)
2. Click **Create role**
3. Select trusted entity: **AWS service**
4. Choose **EC2** (if deploying to EC2) or **ECS** (if using containers)
5. Click **Next**
6. Click **Next** again (skip permissions for now)
7. Enter role name: `FairPlayCloudBackendRole`
8. Click **Create role**

#### 2.1: Add S3 Permissions to Role
1. Open the role → **Permissions** tab
2. Click **Add inline policy**
3. Choose **JSON** editor
4. Replace the template with this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::fairplay-cloud-evidence",
                "arn:aws:s3:::fairplay-cloud-evidence/*"
            ]
        }
    ]
}
```

5. Click **Review policy**
6. Name: `FairPlayCloudS3Access`
7. Click **Create policy**

#### 2.2: Create Access Key (Temporary - for local development)
1. Go to [IAM Users Console](https://console.aws.amazon.com/iam/home#/users)
2. Click your user name
3. **Security credentials** tab
4. Click **Create access key**
5. Select **Local code** → **Next**
6. Copy the **Access Key ID** and **Secret Access Key** somewhere safe
7. Keep this browser tab open — you'll need these values for `.env`

---

### Step 3: Create CloudFront Distribution

1. Go to [AWS CloudFront Console](https://console.aws.amazon.com/cloudfront/home)
2. Click **Create distribution**
3. Fill in origin:
   - **Origin domain:** Select `fairplay-cloud-evidence.s3.us-east-1.amazonaws.com` (your bucket)
   - **S3 access:** Select **Origin access control settings (recommended)**
   - Click **Create control setting** → Accept defaults → **Create**
4. Cache behavior settings:
   - **Viewer protocol policy:** Redirect HTTP to HTTPS
   - **Allowed HTTP methods:** GET, HEAD, PUT, POST, PATCH, DELETE, OPTIONS
   - **Cache key and origin requests:** Select **CachingOptimized**
5. Click **Create distribution**

#### 3.1: Update S3 Bucket Policy (for CloudFront)
The distribution creation will show a message: "Update the S3 bucket policy"

1. Go back to [S3 Bucket](https://s3.console.aws.amazon.com/s3/buckets/fairplay-cloud-evidence)
2. **Permissions** tab → **Bucket policy**
3. Click **Edit**
4. AWS will have suggested a policy — **paste it exactly as shown**
5. Click **Save**

#### 3.2: Wait for Distribution to Deploy
1. Go back to CloudFront console
2. Your distribution status will show **Deploying** (takes 2-5 minutes)
3. Wait until status changes to **Enabled**
4. Copy the **Distribution domain name** (looks like `d123456789.cloudfront.net`)
5. **Save this value** — you'll use it in `.env` as `CLOUDFRONT_DOMAIN`

---

### Step 4: Create AWS Secrets Manager Secret (For Production)

1. Go to [AWS Secrets Manager Console](https://console.aws.amazon.com/secretsmanager/home)
2. Click **Store a new secret**
3. Select **Other type of secret** → **Plaintext**
4. Paste this (replace with your actual credentials from Step 2.2):

```json
{
  "accessKeyId": "YOUR_ACCESS_KEY_FROM_STEP_2.2",
  "secretAccessKey": "YOUR_SECRET_KEY_FROM_STEP_2.2"
}
```

5. Click **Next**
6. Secret name: `fairplay/s3-credentials`
7. Click **Store**

---

## ✅ Verification Checklist

Before moving to backend code, verify:

- [ ] S3 bucket `fairplay-cloud-evidence` exists
- [ ] Versioning is **Enabled**
- [ ] Default encryption is **SSE-S3**
- [ ] All 4 "Block public access" boxes are **checked**
- [ ] IAM role `FairPlayCloudBackendRole` exists
- [ ] Role has inline policy `FairPlayCloudS3Access` with S3 permissions
- [ ] Access key created and saved
- [ ] CloudFront distribution status is **Enabled** and you have the domain name
- [ ] CloudFront can access S3 (bucket policy updated)
- [ ] Secret stored in AWS Secrets Manager as `fairplay/s3-credentials`

---

## Next Steps

Once you've completed all steps above, update these values in your backend `.env`:

```bash
AWS_REGION=us-east-1
S3_BUCKET_NAME=fairplay-cloud-evidence
CLOUDFRONT_DOMAIN=https://d123456789.cloudfront.net  # Replace with your domain
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_FROM_STEP_2.2
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_FROM_STEP_2.2
```

(In production, credentials come from Secrets Manager/IAM roles instead of `.env`)

---

## Troubleshooting

**Problem: "Access Denied" when accessing S3 from backend**
- Verify access key is correct in `.env`
- Verify IAM role has `s3:PutObject`, `s3:GetObject` permissions
- Verify S3 bucket name matches `S3_BUCKET_NAME` in `.env`

**Problem: CloudFront showing "Access Denied"**
- Verify bucket policy was updated (Step 3.1)
- Wait 2-5 minutes for distribution to fully deploy

**Problem: "InvalidAccessKeyId" error**
- Access key was deleted or not created properly
- Re-create access key in IAM console

