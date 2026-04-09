const express = require('express');
const { octokit, config } = require('../config/github');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get file version history
router.get('/:courseName/:fileName/history', authMiddleware, async (req, res) => {
  const { courseName, fileName } = req.params;
  const filePath = `courses/${courseName}/${fileName}`;

  try {
    const { data } = await octokit.repos.listCommits({
      owner: config.owner,
      repo: config.repo,
      path: filePath,
      per_page: 50
    });

    const history = data.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        date: commit.commit.author.date
      },
      committer: {
        name: commit.commit.committer.name,
        date: commit.commit.committer.date
      }
    }));

    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error.message);
    res.status(500).json({ error: 'Failed to fetch file history' });
  }
});

// Restore file to a specific version
router.post('/:courseName/:fileName/restore', authMiddleware, async (req, res) => {
  const { courseName, fileName } = req.params;
  const { sha } = req.body;
  const user = req.user;

  if (!sha) {
    return res.status(400).json({ error: 'Commit SHA required' });
  }

  const filePath = `courses/${courseName}/${fileName}`;

  try {
    // Get file content at specific commit
    const { data: oldFile } = await octokit.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: filePath,
      ref: sha
    });

    // Get current file SHA
    const { data: currentFile } = await octokit.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: filePath
    });

    const timestamp = new Date().toISOString();
    const message = `Restore ${fileName} to version ${sha.substring(0, 7)} by ${user.name || user.login} at ${timestamp}`;

    // Update file with old content
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
      path: filePath,
      message,
      content: oldFile.content,
      sha: currentFile.sha,
      committer: {
        name: user.name || user.login,
        email: user.email || `${user.login}@users.noreply.github.com`
      }
    });

    res.json({
      message: 'File restored successfully',
      commit: data.commit.sha
    });
  } catch (error) {
    console.error('Error restoring file:', error.message);
    res.status(500).json({ error: 'Failed to restore file' });
  }
});

// Download file
router.get('/:courseName/:fileName/download', authMiddleware, async (req, res) => {
  const { courseName, fileName } = req.params;
  const { sha } = req.query;
  const filePath = `courses/${courseName}/${fileName}`;

  try {
    const params = {
      owner: config.owner,
      repo: config.repo,
      path: filePath
    };

    if (sha) {
      params.ref = sha;
    }

    const { data } = await octokit.repos.getContent(params);

    const content = Buffer.from(data.content, 'base64');

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(content);
  } catch (error) {
    console.error('Error downloading file:', error.message);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

module.exports = router;
