import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (!code) {
        setError('No authorization code received');
        return;
      }

      try {
        const response = await authAPI.githubAuth(code);
        login(response.data.token, response.data.user);
        navigate('/dashboard');
      } catch (err) {
        console.error('Auth error:', err);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [login, navigate]);

  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
      {error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="loading">
          <h2>Authenticating...</h2>
          <p>Please wait while we log you in.</p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
