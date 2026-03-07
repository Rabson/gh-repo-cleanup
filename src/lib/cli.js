import { Command } from "commander";

export function parseCliOptions(argv) {
  const program = new Command();

  program
    .name("gh-delete-repo")
    .description("Interactively delete GitHub repositories")
    .option("-o, --owner <owner>", "GitHub owner/user/org to list repos from")
    .option("--org <org>", "Filter repositories by organization owner login")
    .option(
      "-v, --visibility <visibility>",
      "Filter by visibility: all, public, private",
      "all"
    )
    .option("-r, --repo <repo>", "GitHub repository name for direct deletion")
    .option("-s, --search <text>", "Filter repositories by name in interactive mode")
    .option("-y, --yes", "Skip confirmation prompts")
    .option("-d, --dry-run", "Preview deletions without deleting repositories")
    .parse(argv);

  return program.opts();
}
