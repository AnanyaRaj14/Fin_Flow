# ⚡ AWS S3 Quick Start (5 Minutes)

## 🚀 Super Fast Setup

### 1️⃣ Install Dependencies (1 min)

```bash
cd server
npm install
```

### 2️⃣ Create AWS S3 Bucket (2 min)

1. Go to https://console.aws.amazon.com
2. Search "S3" → Click "Create bucket"
3. **Bucket name**: `finflow-uploads-YOURNAME` (must be unique)
4. **Region**: `us-east-1` (or closest to you)
5. **Block Public Access**: ✅ Keep ALL checked
6. Click **"Create bucket"**

### 3️⃣ Configure CORS (30 sec)

1. Click your bucket → **Permissions** tab
2. Scroll to **CORS** → Click **Edit**
3. Paste this:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:3001"],
        "MaxAgeSeconds": 3000
    }
]
```

4. Click **Save**

### 4️⃣ Create Access Keys (1 min)

1. Search "IAM" → Click **Users** → **Create user**
2. Name: `finflow-user` → Next
3. **Attach policies** → Check **AmazonS3FullAccess** → Next → Create
4. Click the user → **Security credentials** tab
5. **Create access key** → Select **"Application outside AWS"** → Next → Create
6. **⚠️ COPY BOTH KEYS NOW** (you won't see secret again!)

### 5️⃣ Update .env File (30 sec)

Edit `.env` (root folder):

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_HERE
AWS_S3_BUCKET_NAME=finflow-uploads-YOURNAME
```

Also update `server/.env` with same values.

### 6️⃣ Test It! (1 min)

```bash
# Start server
cd server
npm run dev

# In another terminal
cd client  
npm run dev
```

Open http://localhost:3001
- Login
- Try uploading an avatar
- Check your S3 bucket in AWS Console - file should be there!

---

## ✅ Done!

If upload works and file appears in S3, you're all set! 🎉

**Having issues?** See the complete guide: `AWS-S3-SETUP-GUIDE.md`

---

## 🐳 Docker Users

```bash
# Update .env, then:
docker compose down
docker compose build
docker compose up -d
```

---

## 💡 Key Points

- Files stored privately in S3
- Bucket name must be globally unique
- Keep access keys secret!
- Free tier: 5 GB for 12 months
- After: ~$0.023/GB/month (~95% cheaper than Cloudinary!)

---

## 🆘 Quick Troubleshooting

| Error | Fix |
|-------|-----|
| "Access Denied" | Check access keys in `.env` |
| "Bucket not found" | Verify bucket name matches exactly |
| "CORS error" | Configure CORS (step 3) |
| "Module not found" | Run `npm install` |

---

**Need more help?** Check `AWS-S3-SETUP-GUIDE.md` for detailed instructions!
