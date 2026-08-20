# 🪣 AWS S3 Setup Guide for FinFlow

Complete guide to set up AWS S3 for file uploads (avatars and transaction receipts).

---

## 📋 Prerequisites

- AWS Account (create at https://aws.amazon.com)
- AWS CLI installed (optional but helpful)

---

## 🚀 Step-by-Step Setup

### Step 1: Create an AWS Account

1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Follow the registration process
4. You'll need a credit card (but we'll stay in the free tier)

---

### Step 2: Create an S3 Bucket

1. **Sign in to AWS Console**: https://console.aws.amazon.com
2. **Navigate to S3**:
   - Search for "S3" in the top search bar
   - Click on "S3" to open the S3 service

3. **Create Bucket**:
   - Click **"Create bucket"**
   
4. **Configure Bucket**:
   
   **General Configuration:**
   - **Bucket name**: `finflow-uploads` (must be globally unique - add random suffix if taken)
   - **AWS Region**: Choose closest to your users (e.g., `us-east-1`)
   
   **Object Ownership:**
   - Select **"ACLs disabled (recommended)"**
   
   **Block Public Access:**
   - ✅ Keep all **"Block all public access"** checked
   - This keeps files private (users access via presigned URLs)
   
   **Bucket Versioning:**
   - Choose **"Disable"** (optional - enable if you want file history)
   
   **Tags (optional):**
   - Add tags if needed (e.g., `Environment: Production`, `Project: FinFlow`)
   
   **Default encryption:**
   - Select **"Server-side encryption with Amazon S3 managed keys (SSE-S3)"**
   - This encrypts files at rest for free
   
5. **Click "Create bucket"**

---

### Step 3: Configure CORS (Cross-Origin Resource Sharing)

1. **Open your bucket** (click on bucket name)
2. Go to **"Permissions"** tab
3. Scroll to **"Cross-origin resource sharing (CORS)"**
4. Click **"Edit"**
5. Paste this configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3001",
            "https://your-production-domain.com"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

6. **Update** `AllowedOrigins` with your actual domain when deploying
7. Click **"Save changes"**

---

### Step 4: Create IAM User with S3 Access

1. **Navigate to IAM**:
   - Search for "IAM" in the AWS Console
   - Click on "IAM" (Identity and Access Management)

2. **Create User**:
   - Click **"Users"** in the left sidebar
   - Click **"Create user"**
   
3. **User Details**:
   - **User name**: `finflow-s3-user`
   - Click **"Next"**

4. **Set Permissions**:
   - Select **"Attach policies directly"**
   - Search for **"AmazonS3FullAccess"** and check it
   - ⚠️ For production, use a more restrictive policy (see Step 5)
   - Click **"Next"**

5. **Review and Create**:
   - Click **"Create user"**

---

### Step 5: Create Access Keys

1. **Click on your new user** (`finflow-s3-user`)
2. Go to **"Security credentials"** tab
3. Scroll to **"Access keys"**
4. Click **"Create access key"**
5. **Use case**: Select **"Application running outside AWS"**
6. Click **"Next"**
7. **Description (optional)**: `FinFlow App S3 Access`
8. Click **"Create access key"**

9. **⚠️ IMPORTANT**: Save these credentials NOW:
   - **Access key ID**: `AKIAIOSFODNN7EXAMPLE`
   - **Secret access key**: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`
   
   **You won't be able to see the secret key again!**

10. Click **"Done"**

---

### Step 6: Configure Environment Variables

Update your `.env` file:

```bash
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET_NAME=finflow-uploads
```

**Replace with your actual values:**
- `AWS_REGION`: The region where you created your bucket
- `AWS_ACCESS_KEY_ID`: From Step 5
- `AWS_SECRET_ACCESS_KEY`: From Step 5
- `AWS_S3_BUCKET_NAME`: Your bucket name from Step 2

---

### Step 7: Install Dependencies

```bash
cd server
npm install
```

This will install:
- `@aws-sdk/client-s3` - AWS S3 client
- `@aws-sdk/s3-request-presigner` - For generating presigned URLs
- `multer-s3` - Multer storage engine for S3
- `sharp` - Image processing (optional, for resizing)

---

### Step 8: Test the Setup

1. **Start your server**:
   ```bash
   cd server
   npm run dev
   ```

2. **Test file upload**:
   - Register/login to your app
   - Try uploading an avatar
   - Try adding a receipt to a transaction

3. **Verify in S3**:
   - Go to your S3 bucket in AWS Console
   - You should see folders: `finflow/avatars/` and `finflow/receipts/`
   - Files should appear there after upload

---

## 🔒 Security Best Practices (Production)

### 1. Use Restrictive IAM Policy

Instead of `AmazonS3FullAccess`, create a custom policy:

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
                "arn:aws:s3:::finflow-uploads",
                "arn:aws:s3:::finflow-uploads/*"
            ]
        }
    ]
}
```

**To apply**:
1. Go to IAM → Policies
2. Create policy → JSON
3. Paste the above
4. Name it `FinFlowS3Policy`
5. Attach to your IAM user

---

### 2. Enable Bucket Versioning

**Why**: Recover deleted files, track changes

**How**:
1. Go to your bucket → Properties
2. Find "Bucket Versioning"
3. Click "Edit" → Enable
4. Save changes

---

### 3. Set up Lifecycle Rules (Cost Optimization)

**Why**: Automatically delete old files, move to cheaper storage

**Example**: Delete receipts older than 7 years

1. Go to bucket → Management
2. Click "Create lifecycle rule"
3. **Rule name**: `delete-old-receipts`
4. **Rule scope**: Prefix = `finflow/receipts/`
5. **Lifecycle rule actions**: 
   - ✅ Expire current versions of objects
6. **Days after object creation**: `2555` (7 years)
7. Create rule

---

### 4. Enable CloudWatch Logging

**Why**: Track access, detect issues

1. Go to bucket → Properties
2. Find "Server access logging"
3. Enable
4. Target bucket: Same bucket or separate logging bucket
5. Target prefix: `logs/`

---

### 5. Rotate Access Keys Regularly

**Best practice**: Rotate keys every 90 days

1. Create new access key
2. Update your app's environment variables
3. Test everything works
4. Delete old access key

---

## 💰 Costs (Free Tier)

AWS S3 Free Tier (first 12 months):
- **5 GB** of standard storage
- **20,000 GET** requests
- **2,000 PUT** requests

**After free tier**:
- Storage: ~$0.023 per GB/month
- PUT requests: $0.005 per 1,000 requests
- GET requests: $0.0004 per 1,000 requests

**For FinFlow**: With 1000 users uploading ~10 files each = ~$2-5/month

---

## 🧪 Testing Checklist

- [ ] Bucket created successfully
- [ ] CORS configured
- [ ] IAM user created with access keys
- [ ] Environment variables updated
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts without errors
- [ ] Avatar upload works
- [ ] Receipt upload works
- [ ] Files appear in S3 bucket
- [ ] Files accessible in app (images display)

---

## 🐛 Troubleshooting

### Error: "Access Denied"

**Causes**:
- Wrong access keys
- IAM user doesn't have S3 permissions
- Bucket name mismatch

**Fix**:
1. Verify access keys in `.env`
2. Check IAM user has `AmazonS3FullAccess` or custom policy
3. Verify bucket name matches exactly

---

### Error: "Bucket does not exist"

**Causes**:
- Wrong bucket name in `.env`
- Bucket in different region than specified

**Fix**:
1. Check bucket name in AWS Console
2. Verify region matches

---

### Error: "CORS policy error"

**Causes**:
- CORS not configured
- Wrong origin in CORS config

**Fix**:
1. Go to bucket → Permissions → CORS
2. Add your frontend URL to `AllowedOrigins`

---

### Files upload but don't display

**Causes**:
- Bucket is private (correct)
- App trying to access directly

**Fix**:
- Use presigned URLs (already implemented in `s3-helpers.js`)
- Ensure Next.js `next.config.mjs` allows S3 domains

---

### "Region mismatch" error

**Fix**:
```bash
# In .env, update to match your bucket region
AWS_REGION=us-west-2  # or whatever region you used
```

---

## 📚 Useful AWS CLI Commands

```bash
# Install AWS CLI
# Windows: https://aws.amazon.com/cli/
# Mac: brew install awscli

# Configure AWS CLI
aws configure
# Enter your access keys and region

# List buckets
aws s3 ls

# List files in bucket
aws s3 ls s3://finflow-uploads/finflow/avatars/ --recursive

# Download a file
aws s3 cp s3://finflow-uploads/finflow/avatars/file.jpg ./local-file.jpg

# Upload a file
aws s3 cp ./local-file.jpg s3://finflow-uploads/finflow/test/

# Delete a file
aws s3 rm s3://finflow-uploads/finflow/test/file.jpg

# Sync local folder to S3
aws s3 sync ./local-folder s3://finflow-uploads/backup/
```

---

## 🎯 Migration from Cloudinary

All Cloudinary code has been replaced with AWS S3:

✅ **Removed**:
- `cloudinary` package
- `multer-storage-cloudinary` package
- `config/cloudinary.js`

✅ **Added**:
- `@aws-sdk/client-s3` package
- `@aws-sdk/s3-request-presigner` package
- `multer-s3` package
- `sharp` package (image processing)
- `config/aws-s3.js`
- `utils/s3-helpers.js` (delete, presigned URLs)

✅ **Updated**:
- `middleware/upload.js` - Now uses S3 storage
- Controllers - Changed `req.file.path` to `req.file.location`
- `next.config.mjs` - Updated image domains for S3
- Environment variables

---

## 🚀 Docker Deployment

Environment variables are already configured in `docker-compose.yml`:

```yaml
AWS_REGION: ${AWS_REGION:-us-east-1}
AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
AWS_S3_BUCKET_NAME: ${AWS_S3_BUCKET_NAME}
```

Just update your `.env` file and rebuild:

```bash
docker compose down
docker compose up --build -d
```

---

## ✅ Verification

Your AWS S3 integration is working if:

1. ✅ No errors when starting the server
2. ✅ File uploads return S3 URLs (check Network tab in browser)
3. ✅ Files appear in your S3 bucket
4. ✅ Uploaded images display in the app
5. ✅ No console errors about CORS or Access Denied

---

## 📞 Need Help?

**AWS Documentation**:
- S3: https://docs.aws.amazon.com/s3/
- IAM: https://docs.aws.amazon.com/iam/

**AWS Free Tier**:
- https://aws.amazon.com/free/

**AWS Support**:
- https://console.aws.amazon.com/support/

---

**🎉 You're all set! Your FinFlow app now uses AWS S3 for file uploads!**
