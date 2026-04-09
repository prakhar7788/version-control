# Deployment Guide

## Frontend Deployment (Vercel)

### Option 1: Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy frontend:
```bash
cd frontend
vercel --prod
```

3. Set environment variables in Vercel dashboard:
- `REACT_APP_API_URL`: Your backend URL
- `REACT_APP_GITHUB_CLIENT_ID`: Your GitHub OAuth Client ID

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set root directory to `frontend`
4. Add environment variables
5. Deploy

## Backend Deployment (Render)

### Steps:

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - Name: course-vcs-backend
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

5. Add environment variables:
```
PORT=5000
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=course-content-repo
JWT_SECRET=your_random_jwt_secret_min_32_chars
FRONTEND_URL=https://your-frontend-url.vercel.app
```

6. Deploy

## Backend Deployment (Railway)

### Steps:

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Add environment variables (same as above)
4. Deploy

## Post-Deployment

### Update GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Update your OAuth App:
   - Homepage URL: `https://your-frontend-url.vercel.app`
   - Authorization callback URL: `https://your-frontend-url.vercel.app/auth/callback`

### Update Frontend Environment

Update `REACT_APP_API_URL` in Vercel to point to your deployed backend URL.

### Test the Application

1. Visit your frontend URL
2. Login with GitHub
3. Create a course
4. Upload a file
5. View version history
6. Test restore functionality

## Scaling Considerations

### For Institutional Use:

1. **Rate Limiting**: Implement rate limiting on backend API
2. **Caching**: Add Redis for caching GitHub API responses
3. **File Size Limits**: Configure appropriate file size limits
4. **Database**: Consider adding PostgreSQL for user management and metadata
5. **CDN**: Use CDN for serving static files
6. **Monitoring**: Set up error tracking (Sentry) and analytics
7. **Backup**: Regular backups of GitHub repository

### GitHub API Rate Limits:

- Authenticated requests: 5,000 per hour
- For larger institutions, consider GitHub Enterprise

### Optimization Tips:

1. Cache course and file listings
2. Implement pagination for large file lists
3. Use GitHub webhooks for real-time updates
4. Compress large files before upload
5. Implement lazy loading for file history

## Security Checklist

- [ ] GitHub tokens stored securely in environment variables
- [ ] CORS configured for production domains only
- [ ] JWT secret is strong and random
- [ ] HTTPS enabled on both frontend and backend
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] File type and size restrictions
- [ ] Regular security audits

## Monitoring

### Recommended Tools:

- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot
- **Analytics**: Google Analytics or Plausible
- **Logs**: Papertrail or Logtail

## Backup Strategy

1. GitHub repository serves as primary backup
2. Regular exports of user data
3. Database backups (if using PostgreSQL)
4. Configuration backups

## Support

For issues or questions:
1. Check GitHub Issues
2. Review API logs
3. Verify environment variables
4. Test GitHub API connectivity
