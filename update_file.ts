import { writeFileSync } from "fs";
import { context, getOctokit } from "@actions/github";
import { WebhookPayload } from "@actions/github/lib/interfaces";
import execa from "execa";

const octokit = getOctokit(process.env.jump2header_token || "");

const { issue }: WebhookPayload = context.payload;

// console.log(JSON.stringify(context.payload));

const FORK_REPO_REGEX = /Fork repo: (?<owner>.+)\/(?<repo>.+)/;

const repoRegExpExecArray: RegExpExecArray =
  FORK_REPO_REGEX.exec(issue?.body || "") ||
  ({ groups: {} } as RegExpExecArray);

const { owner: originalOwner, repo } = repoRegExpExecArray.groups || {
  owner: "",
  repo: "",
};

const JUMP2HEADER_CMD_REGEX = /jump2header (?<jump2headerArgs>.+)/;

const jump2headerRegExpExecArray: RegExpExecArray =
  JUMP2HEADER_CMD_REGEX.exec(issue?.body || "") ||
  ({ groups: {} } as RegExpExecArray);

const { jump2headerArgs } = jump2headerRegExpExecArray.groups || {
  jump2headerArgs: "",
};

// updateFile(owner, repo);

console.log(jump2headerArgs);

updateFile(
  context.payload.repository?.owner.login || "strdr4605",
  repo,
  jump2headerArgs
);

async function updateFile(
  thisOwner: string,
  repo: string,
  jump2headerArgs: string
) {
  console.log(`Start update README of ${thisOwner}/${repo}`);
  if (!thisOwner || !repo) {
    console.log("No owner or repo", thisOwner, repo);
    return;
  }

  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/README.md",
      {
        owner: thisOwner,
        repo,
      }
    );

    console.log(
      `\n>>>>>>>>>>\n POST /repos/${thisOwner}/${repo}/content response: ${JSON.stringify(
        response,
        undefined,
        2
      )} \n<<<<<<<<<<\n`
    );

    const fileSha = response.data.sha;
    const fileBase64Content = response.data.content;

    console.log({ fileSha, fileBase64Content });

    const buff = Buffer.from(fileBase64Content, "base64");

    const utf8Content = buff.toString("utf-8");

    console.log("writing to README.md");

    console.log(utf8Content);

    writeFileSync("README.md", utf8Content);

    const { stdout } = await execa("ls");

    console.log(`\n${stdout}\n`);

    const { stdout: stdout2 } = await execa("cat README.md");

    console.log(`\n${stdout2}\n`);
  } catch (e) {
    console.log(
      `\n>>>>>>>>>>\n POST /repos/${thisOwner}/${repo}/content ERROR: ${JSON.stringify(
        e,
        undefined,
        2
      )} \n<<<<<<<<<<\n`
    );
  }
}
