import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

const AuthContext = React.createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [token, setToken] = React.useState(null);

  React.useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
};

const useAuth = () => React.useContext(AuthContext);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = {
  getCourses: (token) => fetch(`${API_URL}/api/courses`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
  getFiles: (token, course) => fetch(`${API_URL}/api/courses/${course}/files`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
  uploadFile: (token, course, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_URL}/api/courses/${course}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData }).then(r => r.json());
  },
  getHistory: (token, course, file) => fetch(`${API_URL}/api/files/${course}/${file}/history`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
  restore: (token, course, file, sha) => fetch(`${API_URL}/api/files/${course}/${file}/restore`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ sha }) }).then(r => r.json()),
  download: (token, course, file, sha) => fetch(`${API_URL}/api/files/${course}/${file}/download${sha ? `?sha=${sha}` : ''}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.blob())
};

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleLogin = () => {
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    if (!clientId) { alert('Set REACT_APP_GITHUB_CLIENT_ID in .env'); return; }
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${window.location.origin}/auth/callback&scope=user repo`;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', textAlign: 'center', maxWidth: '400px' }}>
        <h1>📚 Course Content VCS</h1>
        <p>Git-powered academic content management</p>
        <button onClick={handleLogin} style={{ padding: '12px 24px', background: '#24292e', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', marginTop: '20px' }}>Login with GitHub</button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const [courses, setCourses] = React.useState([]);
  const [selectedCourse, setSelectedCourse] = React.useState(null);
  const [files, setFiles] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(null);
  const [newCourseName, setNewCourseName] = React.useState('');
  const [showHistory, setShowHistory] = React.useState(false);
  const [fileHistory, setFileHistory] = React.useState([]);
  const [selectedFile, setSelectedFile] = React.useState(null);

  const loadCourses = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getCourses(token);
      setCourses(data);
      setError(null);
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => { loadCourses(); }, [loadCourses]);

  const loadFiles = async (courseName) => {
    setLoading(true);
    try {
      const data = await api.getFiles(token, courseName);
      setFiles(data);
      setSelectedCourse(courseName);
      setError(null);
    } catch (err) {
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.file.files[0];
    if (!file || !selectedCourse) return;
    setLoading(true);
    try {
      await api.uploadFile(token, selectedCourse, file);
      setSuccess('File uploaded!');
      e.target.reset();
      loadFiles(selectedCourse);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    const dummyFile = new File(['# ' + newCourseName], 'README.md', { type: 'text/markdown' });
    setLoading(true);
    try {
      await api.uploadFile(token, newCourseName, dummyFile);
      setSuccess('Course created!');
      setNewCourseName('');
      loadCourses();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const viewHistory = async (fileName) => {
    setLoading(true);
    try {
      const data = await api.getHistory(token, selectedCourse, fileName);
      setFileHistory(data);
      setSelectedFile(fileName);
      setShowHistory(true);
      setError(null);
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const restoreVersion = async (sha) => {
    if (!window.confirm('Restore this version?')) return;
    setLoading(true);
    try {
      await api.restore(token, selectedCourse, selectedFile, sha);
      setSuccess('File restored!');
      setShowHistory(false);
      loadFiles(selectedCourse);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Restore failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (fileName, sha = null) => {
    try {
      const blob = await api.download(token, selectedCourse, fileName, sha);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Download failed');
    }
  };

  return (
    <div>
      <nav style={{ background: 'white', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>📚 Course Content VCS</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src={user?.avatar_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
            <span>{user?.name || user?.login}</span>
            <button onClick={logout} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
      </nav>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '5px', marginBottom: '20px' }}>{error}</div>}
        {success && <div style={{ background: '#d4edda', color: '#155724', padding: '12px', borderRadius: '5px', marginBottom: '20px' }}>{success}</div>}
        
        {!selectedCourse ? (
          <>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <h3>Create New Course</h3>
              <form onSubmit={handleCreateCourse} style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Course name (e.g., CS101)" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} required />
                <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#0366d6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Create</button>
              </form>
            </div>
            <h3>Your Courses</h3>
            {loading ? <div>Loading...</div> : courses.length === 0 ? <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>No courses yet</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {courses.map((course) => (
                  <div key={course.name} onClick={() => loadFiles(course.name)} style={{ background: 'white', padding: '20px', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3>📂 {course.name}</h3>
                    <p>Click to view</p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <button onClick={() => { setSelectedCourse(null); setFiles([]); }} style={{ marginBottom: '20px', padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>← Back</button>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3>Upload to {selectedCourse}</h3>
              <form onSubmit={handleUpload} style={{ display: 'flex', gap: '10px' }}>
                <input type="file" name="file" style={{ flex: 1, padding: '8px' }} required />
                <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#0366d6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Upload</button>
              </form>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
              <h3>Files</h3>
              {loading ? <div>Loading...</div> : files.length === 0 ? <p>No files</p> : files.map((file) => (
                <div key={file.sha} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #eee' }}>
                  <div><strong>{file.name}</strong><br/><small>{(file.size / 1024).toFixed(1)} KB</small></div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => downloadFile(file.name)} style={{ padding: '6px 12px', background: '#0366d6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Download</button>
                    <button onClick={() => viewHistory(file.name)} style={{ padding: '6px 12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>History</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {showHistory && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setShowHistory(false)}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowHistory(false)} style={{ float: 'right', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
              <h3>History: {selectedFile}</h3>
              {fileHistory.map((commit) => (
                <div key={commit.sha} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '6px', marginBottom: '10px' }}>
                  <h4>{commit.message}</h4>
                  <p><strong>Author:</strong> {commit.author.name}</p>
                  <p><strong>Date:</strong> {new Date(commit.author.date).toLocaleString()}</p>
                  <p><strong>SHA:</strong> {commit.sha.substring(0, 7)}</p>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <button onClick={() => downloadFile(selectedFile, commit.sha)} style={{ padding: '6px 12px', background: '#0366d6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Download</button>
                    <button onClick={() => restoreVersion(commit.sha)} style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Restore</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AuthCallback = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      fetch(`${API_URL}/api/auth/github`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })
        .then(res => res.json())
        .then(data => { login(data.token, data.user); navigate('/dashboard'); })
        .catch(() => navigate('/login'));
    }
  }, [login, navigate]);

  return <div style={{ textAlign: 'center', paddingTop: '100px' }}>Authenticating...</div>;
};

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
