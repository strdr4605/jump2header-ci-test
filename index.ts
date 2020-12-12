import { context, getOctokit } from "@actions/github";
import { WebhookPayload } from "@actions/github/lib/interfaces";

const octokit = getOctokit(process.env.GITHUB_TOKEN || "");

const { issue }: WebhookPayload = context.payload;

console.log(JSON.stringify(context.payload));

const FORK_REPO_REGEX = /Fork repo: (?<owner>.+)\/(?<repo>.+)/;

const regExpExecArray: RegExpExecArray =
  FORK_REPO_REGEX.exec(issue?.body || "") ||
  ({ groups: {} } as RegExpExecArray);

const { owner, repo } = regExpExecArray.groups || { owner: "", repo: "" };

fork(owner, repo);

async function fork(owner: string, repo: string) {
  if (!owner || !repo) {
    console.log("No owner or repo", owner, repo);
    return;
  }

  try {
    await octokit.request("POST /repos/{owner}/{repo}/forks", {
      owner,
      repo,
    });
  } catch (e) {
    console.log(e);
  }
}
