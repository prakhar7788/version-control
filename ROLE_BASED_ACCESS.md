# Role-Based Access Control

This application now supports two user roles: **Student** and **Faculty**.

## User Roles

### Student Role 🎓
Students have read-only access to course materials:
- View all available courses
- Browse course materials
- Download files
- View version history
- Download previous versions

**Restrictions:**
- Cannot create courses
- Cannot upload files
- Cannot restore previous versions

### Faculty Role 👨‍🏫
Faculty members have full access to manage courses:
- Create new courses
- Upload course materials
- Update existing files
- View version history
- Restore previous versions
- All student permissions

## Login Process

1. On the login page, users select their role:
   - **Login as Student**
   - **Login as Faculty**

2. After selecting a role, users authenticate via GitHub OAuth

3. The selected role is stored and used throughout the session

## Technical Implementation

### Frontend Changes
- **Login.js**: Added role selection UI before GitHub authentication
- **AuthContext.js**: Extended to store and manage user roles
- **Dashboard.js**: Conditional rendering based on user role
- **API calls**: Role is passed during authentication

### Backend Changes
- **auth.js**: JWT tokens now include user role
- **roleAuth.js**: New middleware for role-based route protection
- **courses.js**: Upload endpoint protected (faculty only)
- **files.js**: Restore endpoint protected (faculty only)

### Protected Routes
- `POST /api/courses/:courseName/upload` - Faculty only
- `POST /api/files/:courseName/:fileName/restore` - Faculty only

### Public Routes (All authenticated users)
- `GET /api/courses` - View all courses
- `GET /api/courses/:courseName/files` - View course files
- `GET /api/files/:courseName/:fileName/history` - View file history
- `GET /api/files/:courseName/:fileName/download` - Download files

## Testing

To test different roles:
1. Logout if currently logged in
2. Select "Student" role and login
3. Verify you can only view and download content
4. Logout and select "Faculty" role
5. Verify you can create courses and upload files
