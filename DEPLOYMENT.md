# 🚀 Creden Suite Deployment Guide

## Overview
This guide will help you deploy Creden Suite to **Vercel** (frontend) and **Railway** (backend).

## 📋 Prerequisites
- GitHub repository with your code
- MongoDB Atlas account
- Firebase project
- Vercel account
- Railway account

## 🎯 Deployment Architecture
```
Frontend (Vercel) → Backend (Railway) → MongoDB Atlas
```

## 🔧 Step 1: Deploy Backend to Railway

### 1.1 Connect to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your CardCraft repository

### 1.2 Configure Railway
1. Railway will auto-detect Node.js
2. Set environment variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ngodb
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
   NODE_ENV=production
   PORT=5000
   ```

### 1.3 Deploy
1. Railway will automatically build and deploy
2. Note the generated URL (e.g., `https://your-app.railway.app`)

## 🌐 Step 2: Deploy Frontend to Vercel

### 2.1 Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project" → Import your repository

### 2.2 Configure Vercel
1. **Framework Preset**: Vite
2. **Build Command**: `npm run build:client`
3. **Output Directory**: `dist`
4. **Root Directory**: Leave empty (uses root)

### 2.3 Set Environment Variables
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=https://your-app.railway.app
```

### 2.4 Deploy
1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. Note the generated URL (e.g., `https://your-app.vercel.app`)

## 🔗 Step 3: Update Railway Environment

### 3.1 Add Frontend URL
1. Go back to Railway dashboard
2. Add environment variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```

## ✅ Step 4: Test Deployment

### 4.1 Test Frontend
1. Visit your Vercel URL
2. Try logging in with a whitelisted email
3. Test all major features

### 4.2 Test Backend
1. Check Railway logs for any errors
2. Test API endpoints directly
3. Verify MongoDB connection

## 🔧 Troubleshooting

### Common Issues

#### 1. CORS Errors
- Add your Vercel domain to CORS settings in Railway
- Check `server/vite.ts` for CORS configuration

#### 2. Environment Variables
- Double-check all environment variables are set correctly
- Ensure no extra spaces or quotes in values

#### 3. Build Failures
- Check Railway logs for build errors
- Ensure all dependencies are in `package.json`

#### 4. API Connection Issues
- Verify `VITE_API_BASE_URL` points to your Railway URL
- Check Railway deployment is successful

## 📊 Monitoring

### Railway
- Monitor logs in Railway dashboard
- Set up alerts for errors
- Monitor resource usage

### Vercel
- Check deployment status
- Monitor performance metrics
- Set up error tracking

## 💰 Cost Estimation
- **Vercel**: Free (Hobby plan)
- **Railway**: $5/month (Hobby plan)
- **MongoDB Atlas**: Free (M0 cluster)
- **Total**: ~$5/month

## 🔄 Updates
- Push to GitHub → Automatic deployment
- Environment variables can be updated in dashboards
- Rollback available in both platforms

## 📞 Support
- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- MongoDB Atlas: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---

**🎉 Congratulations! Your Creden Suite is now live!**
