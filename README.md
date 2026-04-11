Verision control system
# Complete Setup Guide

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- A GitHub account
- Git installed on your machine

## Step-by-Step Setup

### Step 1: Clone or Download the Project

```bash
# If using git
git clone <your-repo-url>
cd course-vcs

# Or download and extract the ZIP file
```

### Step 2: Create GitHub OAuth Application

1. Go to GitHub and login
2. Navigate to: Settings → Developer settings → OAuth Apps
3. Click "New OAuth App"
4. Fill in the form:
   - **Application name**: Course Content VCS
   - **Homepage URL**: `http://localhost:3000`
   - **Application description**: Git-powered course content management
   - **Authorization callback URL**: `http://localhost:3000/auth/callback`
5. Click "Register application"
6. **Save the Client ID** (you'll see it immediately)
7. Click "Generate a new client secret"
8. **Save the Client Secret** (you'll only see it once!)

### Step 3: Create GitHub Personal Access Token

1. Go to: Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token" → "Generate new token (classic)"
3. Fill in:
   - **Note**: Course VCS Backend
   - **Expiration**: 90 days (or your preference)
   - **Select scopes**: Check `repo` and `user`
4. Click "Generate token"
5. **Copy and save the token** (you won't see it again!)

### Step 4: Create GitHub Repository for Storage

1. Go to GitHub and create a new repository
2. Name it: `course-content-repo` (or your preferred name)
3. Make it **Private** (recommended) or Public
4. Don't initialize with README
5. Click "Create repository"
6. **Note your GitHub username** (you'll need it)

### Step 5: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
# On Windows:
copy .env.example .env

# On Mac/Linux:
cp .env.example .env
```

Now edit the `backend/.env` file with your values:

```env
PORT=5000
GITHUB_CLIENT_ID=your_client_id_from_step2
GITHUB_CLIENT_SECRET=your_client_secret_from_step2
GITHUB_TOKEN=your_personal_access_token_from_step3
GITHUB_OWNER=your_github_username
GITHUB_REPO=course-content-repo
JWT_SECRET=your_random_secret_at_least_32_characters_long
FRONTEND_URL=http://localhost:3000
```

**Generate JWT Secret:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or just use a random string like:
# my-super-secret-jwt-key-12345678
```

### Step 6: Frontend Setup

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file
# On Windows:
copy .env.example .env

# On Mac/Linux:
cp .env.example .env
```

Edit the `frontend/.env` file:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GITHUB_CLIENT_ID=your_client_id_from_step2
```

### Step 7: Start the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see: `Server running on port 5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Browser should automatically open to `http://localhost:3000`

### Step 8: Test the Application

1. Click "Login with GitHub"
2. Authorize the application
3. You should be redirected to the dashboard
4. Create a new course (e.g., "CS101")
5. Upload a test file (PDF, PPT, or any document)
6. Click "History" to see version history
7. Upload the same file again (modified) to see versioning
8. Try restoring a previous version

## Troubleshooting

### Issue: "Authentication failed"

**Solution:**
- Verify GitHub Client ID and Secret in both `.env` files
- Check that callback URL matches in GitHub OAuth App settings
- Clear browser cache and try again

### Issue: "Failed to upload file"

**Solution:**
- Verify GitHub Personal Access Token has `repo` scope
- Check that GITHUB_OWNER and GITHUB_REPO are correct
- Ensure the repository exists on GitHub
- Verify token hasn't expired

### Issue: "CORS error"

**Solution:**
- Ensure backend is running on port 5000
- Verify FRONTEND_URL in backend `.env` is `http://localhost:3000`
- Check that both servers are running

### Issue: "Cannot find module"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Or on Windows:
rmdir /s node_modules
npm install
```

### Issue: Port already in use

**Solution:**
```bash
# Change PORT in backend/.env to different port (e.g., 5001)
# Update REACT_APP_API_URL in frontend/.env accordingly
```

## Verification Checklist

- [ ] Node.js and npm installed
- [ ] GitHub OAuth App created
- [ ] GitHub Personal Access Token created
- [ ] GitHub repository created
- [ ] Backend `.env` file configured
- [ ] Frontend `.env` file configured
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Can login with GitHub
- [ ] Can create course
- [ ] Can upload file
- [ ] Can view version history

## Next Steps

Once everything is working:

1. **Customize**: Modify UI colors, branding, etc.
2. **Add Features**: Implement additional functionality
3. **Deploy**: Follow DEPLOYMENT.md for production deployment
4. **Secure**: Review security best practices
5. **Scale**: Implement caching and optimization

## Common Commands

```bash
# Start backend in development mode
cd backend && npm run dev

# Start frontend
cd frontend && npm start

# Build frontend for production
cd frontend && npm run build

# Install new package in backend
cd backend && npm install package-name

# Install new package in frontend
cd frontend && npm install package-name
```

## Getting Help

If you encounter issues:

1. Check the error message carefully
2. Review this guide again
3. Check GitHub API status: https://www.githubstatus.com/
4. Verify all environment variables are set correctly
5. Check that all services are running




## File Structure

```
course-vcs/
├── backend/
│   ├── config/
│   │   └── github.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── courses.js
│   │   └── files.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── AuthCallback.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Dashboard.css
│   │   │   ├── Login.js
│   │   │   └── Login.css
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── .env
│   ├── .env.example
│   └── package.json
├── .gitignore
├── ARCHITECTURE.md
├── DEPLOYMENT.md
├── README.md
└── SETUP_GUIDE.md
```

Congratulations! Your Course Content Version Control System is now ready to use! 🎉
