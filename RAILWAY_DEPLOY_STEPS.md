# 🚂 Railway Deployment - Step by Step

## ⚡ БЫСТРЫЙ СТАРТ (15 минут)

### **Шаг 1: Создай Railway аккаунт** (2 мин)

```bash
1. Открой: https://railway.app
2. Sign up with GitHub
3. Confirm email
4. Get $5 free credit
```

---

### **Шаг 2: Установи Railway CLI** (1 мин)

**Mac/Linux:**
```bash
curl -fsSL https://railway.app/install.sh | sh
```

**Windows (PowerShell):**
```powershell
iwr https://railway.app/install.ps1 | iex
```

**Проверка:**
```bash
railway --version
```

---

### **Шаг 3: Login через CLI** (1 мин)

```bash
cd /Users/boss/Desktop/shopify-two/shopify-app

railway login
```

Откроется браузер → нажми "Authorize"

---

### **Шаг 4: Initialize Project** (1 мин)

```bash
railway init
```

Выбери:
- Create new project: **live-sales-notifications**
- Environment: **production**

---

### **Шаг 5: Add PostgreSQL Database** (2 мин)

```bash
railway add --database postgresql
```

Или в dashboard:
```
1. Open railway.app/dashboard
2. Click your project
3. Click "New" → "Database" → "PostgreSQL"
4. Wait ~30 seconds for provisioning
```

---

### **Шаг 6: Set Environment Variables** (3 мин)

**Вариант A: Через CLI**
```bash
railway variables set SHOPIFY_API_KEY=4a3dceaa2b12f1110159f1f117057f06
railway variables set SHOPIFY_API_SECRET=your_secret_here
railway variables set SCOPES=write_products,read_orders
railway variables set NODE_ENV=production
```

**Вариант B: Через Dashboard**
```
1. Open project in Railway dashboard
2. Click "Variables"
3. Add each variable:
   - SHOPIFY_API_KEY
   - SHOPIFY_API_SECRET
   - SCOPES
   - NODE_ENV
4. DATABASE_URL is auto-set by PostgreSQL
```

**⚠️ IMPORTANT:** Найди свой SHOPIFY_API_SECRET:
```
1. Go to: https://partners.shopify.com
2. Apps → Your App → Configuration
3. Copy "Client secret"
```

---

### **Шаг 7: Deploy!** (5 мин)

```bash
railway up
```

Или если используешь GitHub:
```bash
# Link to GitHub repo
railway link

# Enable auto-deploy
railway service
```

**Процесс:**
```
1. Uploading code... ✅
2. Building app... (2-3 min)
3. Running migrations... ✅
4. Starting server... ✅
5. Deployment complete! 🎉
```

---

### **Шаг 8: Get Your App URL** (1 мин)

```bash
railway domain
```

Или создай custom domain:
```bash
railway domain create
```

Пример URL:
```
https://live-sales-notifications-production.up.railway.app
```

---

### **Шаг 9: Update Shopify Partners** (2 мин)

1. Go to: https://partners.shopify.com
2. Apps → Your App → Configuration
3. Update URLs:

```
App URL: https://your-app.railway.app
Redirect URLs: https://your-app.railway.app/api/auth
App Proxy URL: https://your-app.railway.app
```

4. Save changes

---

### **Шаг 10: Test Installation** (3 мин)

```bash
1. Create new test store (or use existing)
2. Install app from Partners dashboard
3. Check Settings page works
4. Enable notifications
5. Verify storefront notifications appear
```

---

## ✅ Deployment Checklist

После deployment проверь:

- [ ] App URL открывается (no errors)
- [ ] `/health` endpoint responds
- [ ] Can install on test store
- [ ] Settings page loads
- [ ] Notifications appear on storefront
- [ ] Webhooks receiving data (check Railway logs)
- [ ] No errors in Railway logs

---

## 📊 Check Deployment Status

```bash
# View logs
railway logs

# Check service status
railway status

# Open dashboard
railway open
```

**В Railway Dashboard смотри:**
- Build logs
- Deploy logs
- Metrics (CPU, Memory)
- Database stats

---

## 🐛 Troubleshooting

### **Build Failed?**

```bash
# Check logs
railway logs --build

# Common fixes:
1. Make sure package.json has "docker-start" script
2. Check Node version compatibility
3. Verify all dependencies installed
```

### **Database Connection Error?**

```bash
# Check DATABASE_URL is set
railway variables

# Test database connection
railway run npx prisma db push
```

### **App Won't Start?**

```bash
# Check start command
railway logs

# Verify environment variables
railway variables

# Check if migrations ran
railway run npx prisma migrate status
```

### **502 Bad Gateway?**

```
Wait 2-3 minutes - app is still starting
Check logs: railway logs
```

---

## 💰 Cost Breakdown

### **Free Credit**
```
New accounts: $5 free credit
Lasts ~1 month for small app
```

### **After Free Credit**
```
Hobby Plan: $5/month
- 512MB RAM
- 1GB Storage  
- PostgreSQL included
- Custom domain
- SSL included
```

### **Estimated Monthly Cost**
```
Small app (< 100 stores): $5-7/month
Medium app (100-500 stores): $10-15/month
```

---

## 🚀 Quick Commands Reference

```bash
# Deploy
railway up

# View logs
railway logs

# Connect to database
railway connect postgres

# Run migrations
railway run npx prisma migrate deploy

# Set variable
railway variables set KEY=value

# Get domain
railway domain

# Open dashboard
railway open

# Check status
railway status
```

---

## 📝 Post-Deployment Tasks

### **Immediate (Today)**
- [ ] Test installation on 2-3 stores
- [ ] Monitor logs for errors
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Document production URL

### **This Week**
- [ ] Set up error tracking (Sentry - optional)
- [ ] Enable database backups (automatic in Railway)
- [ ] Test all features thoroughly
- [ ] Prepare for Shopify submission

### **Before Shopify Submission**
- [ ] Min 72 hours of uptime
- [ ] Zero critical errors
- [ ] All features tested
- [ ] Support email ready

---

## 🎯 Success Criteria

✅ **Ready to submit to Shopify if:**

- App deploys without errors
- Installs successfully on test store
- All features work (real/fake mode, settings, etc.)
- No console errors
- Uptime > 99%
- Response time < 500ms
- SSL certificate valid

---

## 🆘 Need Help?

**Railway Support:**
- Docs: docs.railway.app
- Discord: railway.app/discord
- Forum: help.railway.app

**Shopify Support:**
- Partners: partners.shopify.com/support
- Community: community.shopify.com

---

## ⏭️ Next Steps After Deployment

1. ✅ Deploy to Railway (done)
2. ⏭️ Test on production
3. ⏭️ Update Shopify Partners URLs
4. ⏭️ Submit app for review
5. ⏭️ Wait 1-2 weeks for approval
6. ⏭️ Launch! 🎉

---

**Ready to deploy?** Run `railway login` and let's go! 🚀

