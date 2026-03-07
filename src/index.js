#!/usr/bin/env node
import dotenv from "dotenv";
import { parseCliOptions } from "./lib/cli.js";
import { exitWithError } from "./lib/errors.js";
import { createOctokit, fetchDirectDeleteTarget } from "./lib/github.js";
import { runDirectDelete, runInteractiveSession } from "./lib/session.js";
import { validateToken, validateVisibility } from "./lib/validation.js";

dotenv.config();

const options = parseCliOptions(process.argv);

async function main() {
  const token = process.env.GITHUB_TOKEN;
  validateToken(token);

  const normalizedVisibility = validateVisibility(options.visibility);
  const octokit = createOctokit(token);

  const reposToDelete = await fetchDirectDeleteTarget(
    octokit,
    options.owner,
    options.repo
  );

  if (reposToDelete) {
    await runDirectDelete(octokit, options, reposToDelete);
    return;
  }

  await runInteractiveSession(octokit, options, normalizedVisibility);
}

main().catch((error) => {
  exitWithError(error.message);
});
