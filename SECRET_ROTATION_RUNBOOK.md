# Secret Rotation Runbook

Pre-launch checklist — yeh sare steps complete karne ke baad hi public deploy karna.

> **Why is this critical?** Aapka original `backend/.env` git mein commit ho gaya tha (commit `669de76`). MongoDB credentials aur JWT secret repository ke clone ya CI logs mein leak ho sakte hain. Inhe **compromised** maan kar rotate karna mandatory hai.

---

## ✅ Pre-Generated Tokens (already done)

Yeh strong random tokens already generate ho chuke hain — production `.env` mein paste karo:

```env
JWT_SECRET=QjZyzxzWOnxX9u6JeUVNSD0q5azvFrqefmbnnSIWi4Gv0syTGR9_ip6Wsl9wHf1R
ADMIN_TOKEN=HXFxWb_mA9Xfe1lyVJgY1SG4tuioYJsHz-kNk_DfFlc
```

**⚠️ Yeh tokens ab ek baar generate ho gaye hain — abhi save kar lo, ya naye banao:**

```bash
python -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(48))"
python -c "import secrets; print('ADMIN_TOKEN=' + secrets.token_urlsafe(32))"
```

---

## 🔧 Step 1: MongoDB Password Rotate (manual)

Yeh **aapko khud karna hoga** MongoDB Atlas dashboard se:

1. **Login** karo: https://cloud.mongodb.com
2. **Database Access** (left sidebar) → user `pdforca9912_db_user` find karo
3. **Edit** click karo → **Edit Password** → **Autogenerate Secure Password** → **Update User**
4. Naya password copy karo (ek baar hi dikhega)
5. **Network Access** (left sidebar) → confirm karo aapka VPS IP whitelist mein hai (ya `0.0.0.0/0` for testing — production mein VPS IP only)
6. Production `.env` mein update karo:

```env
MONGO_URL=mongodb+srv://pdforca9912_db_user:NEW_PASSWORD_HERE@pdforca.hqeuskn.mongodb.net/?appName=pdforca
```

**⚠️ Old password permanently invalidated — kisi aur jagah use mat karna.**

---

## 🔧 Step 2: Groq API Key Verify

Aapne pehle hi key add ki thi `.env` mein. Production deploy ke time bhi same key chal sakti hai (Groq free tier per-key limit ko follow karta hai). Agar suspect leak hua to Groq Console mein delete karke naya banao:

1. https://console.groq.com → **API Keys**
2. Old key **Delete** → **+ Create API Key** → naya copy karo
3. Production `.env` mein update karo:

```env
GROQ_API_KEY=gsk_NEW_KEY_HERE
```

---

## 🔧 Step 3: Sentry DSN Generate (free, optional but recommended)

1. https://sentry.io → free signup
2. Create new project: **Platform = FastAPI** (backend) + **Platform = Next.js** (frontend)
3. Copy DSN from each project
4. Production `.env` mein add karo:

```env
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production
```

5. Frontend ke liye `frontend/.env.production`:

```env
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

---

## 🔧 Step 4: Git Untrack `.env` (critical, destructive)

`.gitignore` already update ho chuki hai. Ab tracked `.env` ko git history se untrack karna hai:

```bash
cd C:/shahrukh/pdforca

# Verify which env files are currently tracked
git ls-files | grep -E "\.env$"

# Untrack from index (file stays on disk, just removes from future commits)
git rm --cached backend/.env

# Commit the untrack
git add .gitignore
git commit -m "Remove tracked .env, add comprehensive .gitignore"

# Push (use a new branch first to be safe)
git push origin main
```

**⚠️ Old commits still contain the leaked secrets.** Rotation in Steps 1-3 has invalidated those leaked values, so the git history is now harmless. Lekin paranoid case ke liye:

### (Optional, Aggressive) Rewrite git history

```bash
# Install git-filter-repo: pip install git-filter-repo
# Backup the repo first!
cp -r C:/shahrukh/pdforca C:/shahrukh/pdforca.backup

cd C:/shahrukh/pdforca
git filter-repo --invert-paths --path backend/.env

# Force push (DESTRUCTIVE — coordinate with anyone who has cloned)
git push origin --force --all
```

⚠️ Don't force-push if anyone else has the repo cloned without warning them first.

---

## 🔧 Step 5: VPS Production `.env`

VPS pe `.env` securely banao:

```bash
# On the VPS:
cd /path/to/pdforca/backend
cp .env.example .env
nano .env  # paste real production values
chmod 600 .env  # only owner can read

# Verify the app boots safely
ENVIRONMENT=production python -c "from app.config import settings; print(settings.ENVIRONMENT)"
```

Production safety check fire ho jayega agar `.env` mein insecure values hain.

---

## ✅ Verification Checklist

Tick mark karo har step ke baad:

- [ ] MongoDB user password rotated in Atlas
- [ ] New JWT_SECRET (48+ chars) in production `.env`
- [ ] New ADMIN_TOKEN (32+ chars) in production `.env`
- [ ] Groq API key verified / rotated if needed
- [ ] Sentry DSN added (backend + frontend)
- [ ] `git rm --cached backend/.env` committed
- [ ] `.gitignore` covers all secret files
- [ ] VPS `.env` chmod 600 (or stricter)
- [ ] App boots cleanly on VPS with `ENVIRONMENT=production`
- [ ] Health check returns 200: `curl https://api.pdforca.com/health`

Agar saare ✅ ho gaye, public deploy ke liye safe hai.
