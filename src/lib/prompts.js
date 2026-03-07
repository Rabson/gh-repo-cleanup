import inquirer from "inquirer";

export async function confirmDeletion(reposToDelete, skipConfirmation, isDryRun) {
  if (skipConfirmation) return true;

  const names = reposToDelete.map((repo) => repo.fullName).join("\n- ");

  console.log(`
⚠️  DANGER ZONE

You are about to ${isDryRun ? "simulate deletion for" : "permanently delete"} ${reposToDelete.length} repositor${reposToDelete.length > 1 ? "ies" : "y"}:
- ${names}

${isDryRun ? "No repositories will be deleted in dry-run mode." : "This action cannot be undone."}
`);

  const { proceed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "proceed",
      message: "Continue?",
      default: false
    }
  ]);

  if (!proceed) return false;

  const requiredPhrase = `delete ${reposToDelete.length} repos`;
  const { typedPhrase } = await inquirer.prompt([
    {
      type: "input",
      name: "typedPhrase",
      message: `Type \"${requiredPhrase}\" to confirm:`,
      validate: (input) =>
        input.trim().toLowerCase() === requiredPhrase
          ? true
          : "Confirmation phrase does not match."
    }
  ]);

  return typedPhrase.trim().toLowerCase() === requiredPhrase;
}

export async function promptNextAction() {
  const { nextAction } = await inquirer.prompt([
    {
      type: "list",
      name: "nextAction",
      message: "What would you like to do next?",
      choices: [
        { name: "Show repository list again", value: "continue" },
        { name: "Exit application", value: "exit" }
      ]
    }
  ]);

  return nextAction;
}

export async function promptRetryLoad() {
  const { retry } = await inquirer.prompt([
    {
      type: "confirm",
      name: "retry",
      message: "Retry loading repositories?",
      default: true
    }
  ]);

  return retry;
}
