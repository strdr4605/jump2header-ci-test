import { context, getOctokit } from "@actions/github";
import { WebhookPayload } from "@actions/github/lib/interfaces";

const octokit = getOctokit(process.env.jump2header_token || "");

const { issue }: WebhookPayload = context.payload;

// console.log(JSON.stringify(context.payload));

const FORK_REPO_REGEX = /Fork repo: (?<owner>.+)\/(?<repo>.+)/;

const regExpExecArray: RegExpExecArray =
  FORK_REPO_REGEX.exec(issue?.body || "") ||
  ({ groups: {} } as RegExpExecArray);

const { owner, repo } = regExpExecArray.groups || { owner: "", repo: "" };

fork(owner, repo);

async function fork(owner: string, repo: string) {
  console.log(`Start fork of ${owner}/${repo}`);
  if (!owner || !repo) {
    console.log("No owner or repo", owner, repo);
    return;
  }

  try {
    const response = await octokit.request("POST /repos/{owner}/{repo}/forks", {
      owner,
      repo,
    });

    console.log(`\n>>>>>>>>>>\n POST /repos/${owner}/${repo}/forks response: ${JSON.stringify(response)} \n<<<<<<<<<<\n`)
  } catch (e) {
    console.log(`\n>>>>>>>>>>\n POST /repos/${owner}/${repo}/forks ERROR: ${JSON.stringify(e)} \n<<<<<<<<<<\n`);
  }
}
