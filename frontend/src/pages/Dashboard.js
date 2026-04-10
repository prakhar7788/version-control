import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { courseAPI, fileAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [newCourseName, setNewCourseName] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [fileHistory, setFileHistory] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const response = await courseAPI.getCourses();
      setCourses(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async (courseName) => {
    setLoading(true);
    try {
      const response = await courseAPI.getFiles(courseName);
      setFiles(response.data);
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
    if (!uploadFile || !selectedCourse) return;

    setLoading(true);
    try {
      await courseAPI.uploadFile(selectedCourse, uploadFile);
      setSuccess('File uploaded successfully!');
      setUploadFile(null);
      e.target.reset();
      loadFiles(selectedCourse);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to upload file');
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
      await courseAPI.uploadFile(newCourseName, dummyFile);
      setSuccess('Course created successfully!');
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
      const response = await fileAPI.getHistory(selectedCourse, fileName);
      setFileHistory(response.data);
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
    if (!window.confirm('Are you sure you want to restore this version?')) return;

    setLoading(true);
    try {
      await fileAPI.restore(selectedCourse, selectedFile, sha);
      setSuccess('File restored successfully!');
      setShowHistory(false);
      loadFiles(selectedCourse);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to restore file');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (fileName, sha = null) => {
    try {
      const response = await fileAPI.download(selectedCourse, fileName, sha);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download file');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-content">
          <h2> Course Content VCS</h2>
          <div className="user-info">
            <img src={user.avatar_url} alt={user.name} />
            <span>{user.name || user.login}</span>
            <button className="btn btn-secondary" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="container">
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {!selectedCourse ? (
          <>
            <div className="card">
              <h3>Create New Course</h3>
              <form className="new-course-form" onSubmit={handleCreateCourse}>
                <input
                  type="text"
                  placeholder="Enter course name (e.g., CS101, Mathematics)"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  Create Course
                </button>
              </form>
            </div>

            <h3>Your Courses</h3>
            {loading ? (
              <div className="loading">Loading courses...</div>
            ) : courses.length === 0 ? (
              <div className="card">
                <p>No courses yet. Create your first course above!</p>
              </div>
            ) : (
              <div className="course-grid">
                {courses.map((course) => (
                  <div
                    key={course.name}
                    className="course-card"
                    onClick={() => loadFiles(course.name)}
                  >
                    <h3>📂 {course.name}</h3>
                    <p>Click to view materials</p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="breadcrumb">
              <button onClick={() => { setSelectedCourse(null); setFiles([]); }}>
                ← Back to Courses
              </button>
              {' / ' + selectedCourse}
            </div>

            <div className="upload-section">
              <h3>Upload Course Material</h3>
              <form className="upload-form" onSubmit={handleUpload}>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  Upload
                </button>
              </form>
            </div>

            <div className="card">
              <h3>Course Materials</h3>
              {loading ? (
                <div className="loading">Loading files...</div>
              ) : files.length === 0 ? (
                <p>No files uploaded yet.</p>
              ) : (
                <div className="file-list">
                  {files.map((file) => (
                    <div key={file.sha} className="file-item">
                      <div className="file-info">
                        <span className="file-icon">📄</span>
                        <div className="file-details">
                          <h4>{file.name}</h4>
                          <p>{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="file-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => downloadFile(file.name)}
                        >
                          Download
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => viewHistory(file.name)}
                        >
                          History
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {showHistory && (
          <div className="modal-overlay" onClick={() => setShowHistory(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowHistory(false)}>×</button>
              <h3>Version History: {selectedFile}</h3>
              {loading ? (
                <div className="loading">Loading history...</div>
              ) : (
                fileHistory.map((commit) => (
                  <div key={commit.sha} className="history-item">
                    <h4>{commit.message}</h4>
                    <p><strong>Author:</strong> {commit.author.name}</p>
                    <p><strong>Date:</strong> {formatDate(commit.author.date)}</p>
                    <p><strong>SHA:</strong> {commit.sha.substring(0, 7)}</p>
                    <div className="history-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => downloadFile(selectedFile, commit.sha)}
                      >
                        Download This Version
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => restoreVersion(commit.sha)}
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
