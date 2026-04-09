Deployment Guide
Frontend Deployment (Vercel)
Option 1: Vercel CLI
Install Vercel CLI:
npm install -g vercel
Deploy frontend:
cd frontend
vercel --prod
Set environment variables in Vercel dashboard:
REACT_APP_API_URL: Your backend URL
REACT_APP_GITHUB_CLIENT_ID: Your GitHub OAuth Client ID
Option 2: Vercel Dashboard
Go to vercel.com
Import your GitHub repository
Set root directory to frontend
Add environment variables
Deploy
Backend Deployment (Render)
Steps:
Go to render.com

Create new Web Service

Connect your GitHub repository

Configure:

Name: course-vcs-backend
Root Directory: backend
Build Command: npm install
Start Command: npm start
Add environment variables:

PORT=5000
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=course-content-repo
JWT_SECRET=your_random_jwt_secret_min_32_chars
FRONTEND_URL=https://your-frontend-url.vercel.app
Deploy
Backend Deployment (Railway)
Steps:
Go to railway.app
Create new project from GitHub repo
Add environment variables (same as above)
Deploy
Post-Deployment
Update GitHub OAuth App
Go to GitHub Settings → Developer settings → OAuth Apps
Update your OAuth App:
Homepage URL: https://your-frontend-url.vercel.app
Authorization callback URL: https://your-frontend-url.vercel.app/auth/callback
Update Frontend Environment
Update REACT_APP_API_URL in Vercel to point to your deployed backend URL.

Test the Application
Visit your frontend URL
Login with GitHub
Create a course
Upload a file
View version history
Test restore functionality
Scaling Considerations
For Institutional Use:
Rate Limiting: Implement rate limiting on backend API
Caching: Add Redis for caching GitHub API responses
File Size Limits: Configure appropriate file size limits
Database: Consider adding PostgreSQL for user management and metadata
CDN: Use CDN for serving static files
Monitoring: Set up error tracking (Sentry) and analytics
Backup: Regular backups of GitHub repository
GitHub API Rate Limits:
Authenticated requests: 5,000 per hour
For larger institutions, consider GitHub Enterprise
Optimization Tips:
Cache course and file listings
Implement pagination for large file lists
Use GitHub webhooks for real-time updates
Compress large files before upload
Implement lazy loading for file history
Security Checklist
 GitHub tokens stored securely in environment variables
 CORS configured for production domains only
 JWT secret is strong and random
 HTTPS enabled on both frontend and backend
 Rate limiting implemented
 Input validation on all endpoints
 File type and size restrictions
 Regular security audits
Monitoring
Recommended Tools:
Error Tracking: Sentry
Uptime Monitoring: UptimeRobot
Analytics: Google Analytics or Plausible
Logs: Papertrail or Logtail
Backup Strategy
GitHub repository serves as primary backup
Regular exports of user data
Database backups (if using PostgreSQL)
Configuration backups
Support
For issues or questions:

Check GitHub Issues
Review API logs
Verify environment variables
Test GitHub API connectivity
