import { context, getOctokit } from "@actions/github";
import { WebhookPayload } from "@actions/github/lib/interfaces";
import { createNewFileContent } from "@strdr4605/jump2header/lib/transform";
import { CliArgv } from "@strdr4605/jump2header/lib/types";
import yargsParser from "yargs-parser";

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
  const options = getJump2headerOptions(jump2headerArgs);

  console.log(`Start update ${options.file} of ${thisOwner}/${repo}`);
  if (!thisOwner || !repo) {
    console.log("No owner or repo", thisOwner, repo);
    return;
  }

  try {
    const { fileSha, fileBase64Content } = await getFileShaAndContent(
      thisOwner,
      repo,
      options.file
    );

    const newBase65Content = createNewBase65Content(fileBase64Content, options);

    console.log(
      JSON.stringify(
        {
          options,
          fileSha,
          fileBase64Content,
          newBase65Content,
        },
        undefined,
        2
      )
    );
  } catch (e) {
    console.log(
      `\n>>>>>>>>>>\n GET /repos/${thisOwner}/${repo}/content ERROR: ${JSON.stringify(
        e,
        undefined,
        2
      )} \n<<<<<<<<<<\n`
    );
  }
}

function createNewBase65Content(fileBase64Content: string, options: CliArgv) {
  const utf8Content = Buffer.from(fileBase64Content, "base64").toString(
    "utf-8"
  );

  console.log("writing to README.md");

  console.log(utf8Content);

  const newUtf8Content = createNewFileContent(utf8Content, options);

  const newBase65Content = Buffer.from(newUtf8Content, "utf-8").toString(
    "base64"
  );

  return newBase65Content;
}

function getJump2headerOptions(args: string) {
  return (yargsParser(args, {
    alias: {
      file: ["f"],
      slug: ["s", "header", "h"],
      position: ["p"],
      text: ["t"],
      maxLevel: ["l", "max-level"],
      emoji: ["e"],
    },
    default: {
      file: "README.md",
      position: "header",
      maxLevel: 6,
      emoji: 1,
    },
    boolean: ["silent"],
    number: ["maxLevel", "emoji"],
    string: ["slug", "text", "start", "end"],
  }) as unknown) as CliArgv;
}

async function getFileShaAndContent(owner: string, repo: string, file: string) {
  const response = await octokit.request(
    `GET /repos/{owner}/{repo}/contents/{path}`,
    {
      owner,
      repo,
      path: file,
    }
  );

  console.log(
    `\n>>>>>>>>>>\n GET /repos/${owner}/${repo}/content response: ${JSON.stringify(
      response,
      undefined,
      2
    )} \n<<<<<<<<<<\n`
  );

  if (Array.isArray(response.data) || response.data.type !== "file") {
    throw new Error("Wrong path, wanted path to .md file");
  }

  const fileSha: string = response.data.sha;

  // TODO: type is file but content is not avaiblable it typescript
  // @ts-ignore
  const fileBase64Content: string = response.data.content;

  return {
    fileSha,
    fileBase64Content,
  };
}
