import ora from "ora";

export async function deleteRepos(octokit, reposToDelete, isDryRun) {
  let processedCount = 0;
  let failedCount = 0;

  for (const target of reposToDelete) {
    const spinner = ora(
      isDryRun
        ? `Simulating delete for ${target.fullName}...`
        : `Deleting ${target.fullName}...`
    ).start();

    try {
      if (!isDryRun) {
        await octokit.repos.delete({
          owner: target.owner,
          repo: target.repo
        });
      }

      spinner.succeed(
        isDryRun ? `Would delete ${target.fullName}` : `Deleted ${target.fullName}`
      );
      processedCount += 1;
    } catch (error) {
      spinner.fail(`Failed ${target.fullName}: ${error.message}`);
      failedCount += 1;
    }
  }

  return { processedCount, failedCount };
}
