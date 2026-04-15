# Architecture Overview

## System Design

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   React     │────────▶│   Express   │────────▶│   GitHub    │
│  Frontend   │  HTTP   │   Backend   │   API   │     API     │
└─────────────┘         └─────────────┘         └─────────────┘
      │                        │                        │
      │                        │                        │
   Browser              JWT Auth                  Git Storage
```

## Components

### Frontend 

**Technology Stack:**
- React 18
- React Router for navigation
- Axios for HTTP requests
- Context API for state management

**Key Features:**
- GitHub OAuth authentication
- Course management interface
- File upload with drag-and-drop
- Version history viewer
- File restore functionality

**Pages:**
- `/login` - GitHub OAuth login
- `/auth/callback` - OAuth callback handler
- `/dashboard` - Main application interface

### Backend (Node.js/Express)

**Technology Stack:**
- Express.js
- Octokit (GitHub REST API client)
- JWT for authentication
- Multer for file uploads

**API Endpoints:**

```
POST   /api/auth/github              - GitHub OAuth
GET    /api/courses                  - List all courses
GET    /api/courses/:name/files      - List files in course
POST   /api/courses/:name/upload     - Upload file
GET    /api/files/:course/:file/history  - Get version history
POST   /api/files/:course/:file/restore  - Restore version
GET    /api/files/:course/:file/download - Download file
```

**Middleware:**
- CORS for cross-origin requests
- JWT authentication
- Error handling

### GitHub Integration

**Repository Structure:**
```
course-content-repo/
├── courses/
│   ├── CS101/
│   │   ├── syllabus.pdf
│   │   ├── lecture1.pptx
│   │   └── assignment1.pdf
│   ├── Mathematics/
│   │   ├── syllabus.pdf
│   │   └── notes.pdf
│   └── Physics/
│       └── lab_manual.pdf
```

**GitHub API Usage:**
- `PUT /repos/{owner}/{repo}/contents/{path}` - Create/update files
- `GET /repos/{owner}/{repo}/contents/{path}` - Get file contents
- `GET /repos/{owner}/{repo}/commits` - Get commit history

**Version Control:**
- Each file upload creates a new commit
- Commit messages include timestamp and author
- Full Git history maintained automatically
- Restore creates new commit with old content

## Data Flow

### File Upload Flow:

1. User selects file in React frontend
2. File sent to backend via multipart/form-data
3. Backend converts file to base64
4. Backend creates/updates file in GitHub via API
5. GitHub creates new commit
6. Success response sent to frontend
7. Frontend refreshes file list

### Version History Flow:

1. User clicks "History" button
2. Frontend requests commit history from backend
3. Backend queries GitHub API for commits on file path
4. GitHub returns commit list
5. Backend formats and returns to frontend
6. Frontend displays in modal

### Restore Flow:

1. User selects version to restore
2. Frontend sends restore request with commit SHA
3. Backend fetches file content at that SHA
4. Backend creates new commit with old content
5. GitHub updates file
6. Frontend refreshes file list

## Security Architecture

### Authentication:
- GitHub OAuth for user login
- JWT tokens for session management
- Tokens stored in localStorage
- Backend validates JWT on each request

### Authorization:
- GitHub Personal Access Token for repo operations
- Token stored securely in backend environment
- Never exposed to frontend
- Backend acts as secure proxy

### Data Protection:
- HTTPS for all communications
- CORS restricted to frontend domain
- Input validation on all endpoints
- File type and size restrictions

## Scalability Considerations

### Current Limitations:
- GitHub API rate limit: 5,000 requests/hour
- File size limit: 100MB per file
- Single repository storage

### Scaling Solutions:

**For More Users:**
- Implement caching layer (Redis)
- Add database for metadata (PostgreSQL)
- Use GitHub webhooks for updates
- Implement request queuing

**For More Files:**
- Multiple repositories per institution
- Sharding by course or department
- CDN for file delivery
- Compression for large files

**For Better Performance:**
- Server-side pagination
- Lazy loading
- Background job processing
- Caching strategies

## Technology Choices

### Why React?
- Component-based architecture
- Large ecosystem
- Easy to learn and maintain
- Good performance

### Why Express?
- Lightweight and flexible
- Large middleware ecosystem
- Easy GitHub API integration
- Good for REST APIs

### Why GitHub as Backend?
- Built-in version control
- No database setup needed
- Free for public repos
- Reliable and scalable
- Familiar to developers
- Built-in backup and history

## Future Enhancements

1. **Diff Viewer**: Compare file versions side-by-side
2. **Notifications**: Email alerts for content updates
3. **Collaboration**: Multiple teachers per course
4. **Comments**: Add notes to specific versions
5. **Search**: Full-text search across files
6. **Analytics**: Track file access and downloads
7. **Mobile App**: Native mobile applications
8. **Bulk Operations**: Upload multiple files at once
9. **Templates**: Course templates for quick setup
10. **Integration**: LMS integration (Canvas, Moodle)

## Error Handling

### Frontend:
- User-friendly error messages
- Automatic retry for network errors
- Loading states for async operations
- Form validation

### Backend:
- Centralized error handling middleware
- Detailed error logging
- Graceful degradation
- API error responses with status codes

## Testing Strategy

### Frontend Testing:
- Unit tests for components
- Integration tests for API calls
- E2E tests for critical flows

### Backend Testing:
- Unit tests for routes
- Integration tests for GitHub API
- API endpoint tests

### Manual Testing:
- Cross-browser testing
- Mobile responsiveness
- File upload edge cases
- Version restore scenarios
