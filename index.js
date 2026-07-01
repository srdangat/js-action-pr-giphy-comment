const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require('@octokit/rest');
const Giphy = require('giphy-api');

async function run() {
  try {
    // Get inputs
    const githubToken = core.getInput('github-token', { required: true });
    const giphyApiKey = core.getInput('giphy-api-key', { required: true });

    // Initialize clients
    const octokit = new Octokit({ auth: githubToken });
    const giphy = Giphy(giphyApiKey);

    // GitHub context
    const { owner, repo } = github.context.repo;
    const pr = github.context.payload.pull_request;

    if (!pr) {
      core.setFailed('This action must be run on a pull_request event.');
      return;
    }

    const issue_number = pr.number;
    const prTitle = pr.title;
    const prAuthor = pr.user.login;

    core.info(`Repository: ${owner}/${repo}`);
    core.info(`PR Number: ${issue_number}`);
    core.info(`PR Title: ${prTitle}`);

    // Fetch a random GIF
    const gif = await giphy.random('thank you');
    const gifUrl = gif.data.images.downsized.url;

    // Create PR comment
    const commentBody = [
      '## 🎉 Thank you for your contribution!',
      '',
      `**PR:** #${issue_number}`,
      `**Title:** ${prTitle}`,
      `**Author:** @${prAuthor}`,
      '',
      `![Thank You GIF](${gifUrl})`,
      '',
      'We appreciate your contribution! 🚀'
    ].join('\n');

    const response = await octokit.issues.createComment({
      owner,
      repo,
      issue_number,
      body: commentBody,
    });

    core.info(`Comment created: ${response.data.html_url}`);

    core.setOutput('comment-url', response.data.html_url);
    core.setOutput('gif-url', gifUrl);
    core.setOutput('pr-number', issue_number.toString());

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
