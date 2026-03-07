import ora from "ora";
import { applyRepoFilters, splitReposByAdminPermission } from "./repoFilters.js";
import { fetchRepos } from "./github.js";
import { promptRepoSelectionInteractive } from "./selector.js";
import {
  confirmDeletion,
  promptNextAction,
  promptRetryLoad
} from "./prompts.js";
import { deleteRepos } from "./deleteRepos.js";

export async function runDirectDelete(octokit, options, reposToDelete) {
  const confirmed = await confirmDeletion(reposToDelete, options.yes, options.dryRun);

  if (!confirmed) {
    console.log("Aborted. No repositories were deleted.");
    process.exit(0);
  }

  const { processedCount } = await deleteRepos(octokit, reposToDelete, options.dryRun);

  console.log(
    options.dryRun
      ? `\nDry run completed: would delete ${processedCount}/${reposToDelete.length} repository.`
      : `\nCompleted: deleted ${processedCount}/${reposToDelete.length} repository.`
  );
}

export async function runInteractiveSession(octokit, options, normalizedVisibility) {
  let searchQuery = (options.search || "").trim();

  while (true) {
    const spinner = ora(
      options.owner
        ? `Fetching repositories for ${options.owner}...`
        : "Fetching repositories for authenticated account..."
    ).start();

    let repos;
    try {
      repos = await fetchRepos(octokit, options.owner);
      spinner.succeed(`Loaded ${repos.length} repositories.`);
    } catch (error) {
      spinner.fail("Failed to fetch repositories.");
      console.error(`\n❌ ${error.message}`);

      const retry = await promptRetryLoad();
      if (retry) {
        continue;
      }

      console.log("Exited.");
      return;
    }

    const filteredByOptions = applyRepoFilters(repos, {
      visibility: normalizedVisibility,
      org: options.org
    });

    if (filteredByOptions.length === 0) {
      console.log("No repositories matched current filters (owner/org/visibility).");
      const nextAction = await promptNextAction();
      if (nextAction === "exit") {
        console.log("Exited.");
        return;
      }
      continue;
    }

    const { withAdmin, withoutAdmin } = splitReposByAdminPermission(filteredByOptions);
    if (withoutAdmin.length > 0) {
      console.log(
        `Skipping ${withoutAdmin.length} repositor${withoutAdmin.length > 1 ? "ies" : "y"} without admin rights.`
      );
    }

    if (withAdmin.length === 0) {
      console.log("No repositories with admin rights available to delete.");

      const nextAction = await promptNextAction();
      if (nextAction === "exit") {
        console.log("Exited.");
        return;
      }
      continue;
    }

    const selection = await promptRepoSelectionInteractive(withAdmin, searchQuery);
    searchQuery = selection.query;

    if (selection.action === "exit") {
      console.log("Exited.");
      return;
    }

    const reposToDelete = selection.selectedRepos;
    const confirmed = await confirmDeletion(reposToDelete, options.yes, options.dryRun);

    if (!confirmed) {
      console.log("Deletion canceled. Returning to list.");
    } else {
      const { processedCount, failedCount } = await deleteRepos(
        octokit,
        reposToDelete,
        options.dryRun
      );

      console.log(
        options.dryRun
          ? `\nDry run completed: would delete ${processedCount}/${reposToDelete.length} repositor${reposToDelete.length > 1 ? "ies" : "y"}.`
          : `\nCompleted: deleted ${processedCount}/${reposToDelete.length} repositor${reposToDelete.length > 1 ? "ies" : "y"}.`
      );

      if (failedCount > 0) {
        console.log(
          `There ${failedCount === 1 ? "was" : "were"} ${failedCount} failure${failedCount > 1 ? "s" : ""}. You can continue and try other actions.`
        );
      }
    }

    const nextAction = await promptNextAction();
    if (nextAction === "exit") {
      console.log("Exited.");
      return;
    }
  }
}
