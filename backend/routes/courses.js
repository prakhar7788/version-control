const express = require('express');
const multer = require('multer');
const { octokit, config } = require('../config/github');
const authMiddleware = require('../middleware/auth');
const { requireFaculty } = require('../middleware/roleAuth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all courses
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data } = await octokit.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: 'courses'
    });

    const courses = data
      .filter(item => item.type === 'dir')
      .map(item => ({
        name: item.name,
        path: item.path
      }));

    res.json(courses);
  } catch (error) {
    if (error.status === 404) {
      return res.json([]);
    }
    console.error('Error fetching courses:', error.message);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get files in a course
router.get('/:courseName/files', authMiddleware, async (req, res) => {
  const { courseName } = req.params;

  try {
    const { data } = await octokit.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: `courses/${courseName}`
    });

    const files = data.map(item => ({
      name: item.name,
      path: item.path,
      size: item.size,
      type: item.type,
      sha: item.sha,
      download_url: item.download_url
    }));

    res.json(files);
  } catch (error) {
    if (error.status === 404) {
      return res.json([]);
    }
    console.error('Error fetching files:', error.message);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Upload or update file (Faculty only)
router.post('/:courseName/upload', authMiddleware, requireFaculty, upload.single('file'), async (req, res) => {
  const { courseName } = req.params;
  const file = req.file;
  const user = req.user;

  if (!file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const filePath = `courses/${courseName}/${file.originalname}`;
  const content = file.buffer.toString('base64');
  const timestamp = new Date().toISOString();
  const message = `Update ${file.originalname} by ${user.name || user.login} at ${timestamp}`;

  try {
    // Check if file exists to get SHA
    let sha;
    try {
      const { data } = await octokit.repos.getContent({
        owner: config.owner,
        repo: config.repo,
        path: filePath
      });
      sha = data.sha;
    } catch (error) {
      // File doesn't exist, that's ok
    }

    // Create or update file
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
      path: filePath,
      message,
      content,
      sha,
      committer: {
        name: user.name || user.login,
        email: user.email || `${user.login}@users.noreply.github.com`
      }
    });

    res.json({
      message: 'File uploaded successfully',
      file: {
        name: file.originalname,
        path: filePath,
        sha: data.content.sha,
        commit: data.commit.sha
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error.message);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

module.exports = router;
