const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const config = {
  owner: process.env.GITHUB_OWNER,
  repo: process.env.GITHUB_REPO
};

module.exports = { octokit, config };
