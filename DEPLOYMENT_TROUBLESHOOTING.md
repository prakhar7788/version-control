# Deployment Troubleshooting Guide

## GitHub OAuth "redirect_uri" Error

### Problem
Error message: "The redirect_uri is not associated with this application"

### Solution

#### 1. Check Your Deployed URLs

**Frontend URL** (Vercel):
- Find it in Vercel dashboard under your project
- Example: `https://course-vcs-frontend.vercel.app`

**Backend URL** (Render/Railway):
- Find it in your hosting dashboard
- Example: `https://course-vcs-backend.onrender.com`

#### 2. Update GitHub OAuth App

Go to: https://github.com/settings/developers

**For Production:**
- Homepage URL: `https://your-frontend.vercel.app`
- Authorization callback URL: `https://your-frontend.vercel.app/auth/callback`

**Important Notes:**
- URLs must match EXACTLY (no trailing slashes)
- Must use HTTPS (not HTTP)
- GitHub OAuth Apps support only ONE callback URL

#### 3. Update Environment Variables

**Vercel (Frontend):**
```
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_GITHUB_CLIENT_ID=your_production_client_id
```

**Render/Railway (Backend):**
```
PORT=5000
GITHUB_CLIENT_ID=your_production_client_id
GITHUB_CLIENT_SECRET=your_production_client_secret
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=course-content-repo
JWT_SECRET=your_random_jwt_secret_min_32_chars
FRONTEND_URL=https://your-frontend.vercel.app
```

#### 4. Redeploy

After updating environment variables:
- Vercel: Trigger a new deployment
- Render/Railway: Redeploy the service

---

## Recommended Setup: Separate OAuth Apps

### Development OAuth App
**Name:** Course VCS (Development)
- Homepage: `http://localhost:3000`
- Callback: `http://localhost:3000/auth/callback`
- Client ID: Use in local `.env` file

### Production OAuth App
**Name:** Course VCS (Production)
- Homepage: `https://your-app.vercel.app`
- Callback: `https://your-app.vercel.app/auth/callback`
- Client ID: Use in Vercel environment variables

---

## Common Deployment Issues

### Issue 1: CORS Errors

**Symptom:** Browser console shows CORS policy errors

**Solution:**
1. Check backend `FRONTEND_URL` environment variable
2. Ensure it matches your Vercel URL exactly
3. Verify CORS configuration in `backend/server.js`

### Issue 2: API Connection Failed

**Symptom:** "Failed to load courses" or network errors

**Solution:**
1. Verify `REACT_APP_API_URL` in Vercel points to backend
2. Check backend is running and accessible
3. Test backend health endpoint: `https://your-backend.com/health`

### Issue 3: GitHub API Rate Limits

**Symptom:** 403 errors from GitHub API

**Solution:**
1. Verify `GITHUB_TOKEN` is set in backend
2. Check token has correct permissions (repo access)
3. Monitor rate limit: https://api.github.com/rate_limit

### Issue 4: JWT Token Errors

**Symptom:** "Invalid token" or authentication failures

**Solution:**
1. Ensure `JWT_SECRET` is set and same length (min 32 chars)
2. Clear browser localStorage and login again
3. Check backend logs for JWT verification errors

### Issue 5: File Upload Fails

**Symptom:** Upload succeeds but file not visible

**Solution:**
1. Verify `GITHUB_OWNER` and `GITHUB_REPO` are correct
2. Check GitHub token has write permissions
3. Ensure repository exists and is accessible

---

## Verification Checklist

After deployment, verify:

- [ ] Frontend loads without errors
- [ ] Login redirects to GitHub OAuth
- [ ] After GitHub auth, redirects back to dashboard
- [ ] Can view courses list
- [ ] Can create new course (faculty only)
- [ ] Can upload files (faculty only)
- [ ] Can download files
- [ ] Can view file history
- [ ] Can restore versions (faculty only)
- [ ] Role badge displays correctly
- [ ] Logout works properly

---

## Testing Your Deployment

### 1. Test Backend Health
```bash
curl https://your-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Course VCS API is running"
}
```

### 2. Test GitHub OAuth Flow
1. Open frontend URL
2. Click "Login as Student" or "Login as Faculty"
3. Click "Login with GitHub"
4. Authorize the application
5. Should redirect to dashboard

### 3. Test API Endpoints
```bash
# Get courses (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend.onrender.com/api/courses
```

---

## Getting Help

If issues persist:

1. **Check Browser Console** (F12) for JavaScript errors
2. **Check Backend Logs** in Render/Railway dashboard
3. **Verify Environment Variables** are set correctly
4. **Test Locally First** to isolate deployment issues
5. **Check GitHub OAuth App Settings** one more time

### Useful Commands

**View Vercel logs:**
```bash
vercel logs
```

**Test backend locally:**
```bash
cd backend
npm start
```

**Test frontend locally:**
```bash
cd frontend
npm start
```

---

## Quick Reference: URLs to Update

When deploying, update these locations:

1. **GitHub OAuth App** → Authorization callback URL
2. **Vercel Environment Variables** → REACT_APP_API_URL
3. **Backend Environment Variables** → FRONTEND_URL
4. **Local .env files** → Keep separate for development

---

## Support Resources

- GitHub OAuth Documentation: https://docs.github.com/en/apps/oauth-apps
- Vercel Documentation: https://vercel.com/docs
- Render Documentation: https://render.com/docs
- Railway Documentation: https://docs.railway.app
