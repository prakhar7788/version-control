import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGitHubLogin = (role) => {
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'user repo';
    
    if (!clientId) {
      alert('Please set REACT_APP_GITHUB_CLIENT_ID in your .env file');
      return;
    }
    
    // Store role in sessionStorage to retrieve after OAuth callback
    sessionStorage.setItem('loginRole', role);
    
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1> Course Content VCS</h1>
        <p>Git-powered academic content management system</p>
        
        {!selectedRole ? (
          <div className="role-selection">
            <h2>Select Your Role</h2>
            <div className="role-buttons">
              <button 
                className="btn btn-role btn-student" 
                onClick={() => setSelectedRole('student')}
              >
                <span className="role-icon">🎓</span>
                <h3>Student</h3>
                <p>View and download course materials</p>
              </button>
              <button 
                className="btn btn-role btn-faculty" 
                onClick={() => setSelectedRole('faculty')}
              >
                <span className="role-icon">👨‍🏫</span>
                <h3>Faculty</h3>
                <p>Manage courses and materials</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="login-section">
            <button 
              className="btn btn-back" 
              onClick={() => setSelectedRole(null)}
            >
              ← Back to role selection
            </button>
            <h2>Login as {selectedRole === 'student' ? 'Student' : 'Faculty'}</h2>
            <button 
              className="btn btn-github" 
              onClick={() => handleGitHubLogin(selectedRole)}
            >
              <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
              Login with GitHub
            </button>
            <div className="role-features">
              {selectedRole === 'student' ? (
                <>
                  <div className="feature">
                    <span>📖</span>
                    <p>View course materials</p>
                  </div>
                  <div className="feature">
                    <span>⬇️</span>
                    <p>Download files</p>
                  </div>
                  <div className="feature">
                    <span>🕓</span>
                    <p>Access version history</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="feature">
                    <span>📂</span>
                    <p>Create & manage courses</p>
                  </div>
                  <div className="feature">
                    <span>⬆️</span>
                    <p>Upload & update materials</p>
                  </div>
                  <div className="feature">
                    <span>🔄</span>
                    <p>Restore previous versions</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
