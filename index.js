const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require('@octokit/rest');
const Giphy = require('giphy-api');

async function run() {
  try {
    const githubToken = core.getInput('github-token');
    const giphyApiKey = core.getInput('giphy-api-key');
    const octokit = new Octokit({ auth: githubToken });
    const giphy = Giphy(giphyApiKey);

    const { owner, repo, number: issue_number } = github.context.issue;
    const prComment = await giphy.random('thank you');

    await octokit.issues.createComment({
      owner,
      repo,
      issue_number,
      body: [
        '### 🎉 Thank you for your contribution!',
        '',
        `![Giphy](${prComment.data.images.downsized.url})`
      ].join('\n')
    });

    core.setOutput('comment-url', prComment.data.images.downsized.url);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();