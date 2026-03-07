import ora from "ora";
import { Octokit } from "@octokit/rest";
import { exitWithError } from "./errors.js";
import { toDeleteTarget } from "./repoFilters.js";

async function fetchReposForOwner(octokit, owner) {
  try {
    return await octokit.paginate(octokit.repos.listForUser, {
      username: owner,
      per_page: 100,
      sort: "updated"
    });
  } catch (userError) {
    try {
      return await octokit.paginate(octokit.repos.listForOrg, {
        org: owner,
        per_page: 100,
        sort: "updated"
      });
    } catch {
      throw userError;
    }
  }
}

export function createOctokit(token) {
  return new Octokit({ auth: token });
}

export async function fetchRepos(octokit, owner) {
  if (owner) {
    return fetchReposForOwner(octokit, owner);
  }

  return octokit.paginate(octokit.repos.listForAuthenticatedUser, {
    affiliation: "owner,collaborator,organization_member",
    per_page: 100,
    sort: "updated"
  });
}

export async function fetchDirectDeleteTarget(octokit, owner, repo) {
  if (!owner || !repo) {
    return null;
  }

  const spinner = ora(`Fetching ${owner}/${repo}...`).start();

  try {
    const response = await octokit.repos.get({ owner, repo });
    spinner.succeed(`Found ${response.data.full_name}`);

    if (response.data.permissions?.admin !== true) {
      exitWithError(
        `You must have admin rights to delete ${response.data.full_name}.`
      );
    }

    return [toDeleteTarget(response.data)];
  } catch {
    spinner.fail("Failed to fetch repository.");
    exitWithError("Repository not found or token lacks access.");
  }
}
