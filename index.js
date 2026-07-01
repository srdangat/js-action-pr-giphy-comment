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

    const { owner, repo } = github.context.repo;
    const pr = github.context.payload.pull_request;

    if (!pr) {
      core.setFailed('This action must run on pull_request event');
      return;
    }

    const issue_number = pr.number;

    const gif = await giphy.random('thank you');

    await octokit.issues.createComment({
      owner,
      repo,
      issue_number,
      body: [
        '### 🎉 Thank you for your contribution!',
        '',
        `PR #${issue_number}`,
        `![Giphy](${gif.data.images.downsized.url})`
      ].join('\n')
    });

    core.setOutput('pr-number', issue_number);
    core.setOutput('owner', owner);
    core.setOutput('repo', repo);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();