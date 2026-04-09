import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  githubAuth: (code) => api.post('/api/auth/github', { code })
};

export const courseAPI = {
  getCourses: () => api.get('/api/courses'),
  getFiles: (courseName) => api.get(`/api/courses/${courseName}/files`),
  uploadFile: (courseName, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/courses/${courseName}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const fileAPI = {
  getHistory: (courseName, fileName) => 
    api.get(`/api/files/${courseName}/${fileName}/history`),
  restore: (courseName, fileName, sha) => 
    api.post(`/api/files/${courseName}/${fileName}/restore`, { sha }),
  download: (courseName, fileName, sha = null) => {
    const url = `/api/files/${courseName}/${fileName}/download${sha ? `?sha=${sha}` : ''}`;
    return api.get(url, { responseType: 'blob' });
  }
};

export default api;
