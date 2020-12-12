import { context, getOctokit } from "@actions/github";
import { WebhookPayload } from "@actions/github/lib/interfaces";

const octokit = getOctokit(process.env.jump2header_token || "");

const { issue }: WebhookPayload = context.payload;

// console.log(JSON.stringify(context.payload));

const JUMP2HEADER_CMD_REGEX = /jump2header (?<args>.+)/;

const regExpExecArray: RegExpExecArray =
  JUMP2HEADER_CMD_REGEX.exec(issue?.body || "") ||
  ({ groups: {} } as RegExpExecArray);

const { args } = regExpExecArray.groups || { args: "" };

// updateFile(owner, repo);

console.log(args);

async function updateFile(owner: string, repo: string) {
  console.log(`Start fork of ${owner}/${repo}`);
  if (!owner || !repo) {
    console.log("No owner or repo", owner, repo);
    return;
  }

  // try {
  //   const response = await octokit.request("POST /repos/{owner}/{repo}/contents/", {
  //     owner,
  //     repo,
  //   });

  //   console.log(`\n>>>>>>>>>>\n POST /repos/${owner}/${repo}/forks response: ${JSON.stringify(response)} \n<<<<<<<<<<\n`)
  // } catch (e) {
  //   console.log(`\n>>>>>>>>>>\n POST /repos/${owner}/${repo}/forks ERROR: ${JSON.stringify(e)} \n<<<<<<<<<<\n`);
  // }
}
