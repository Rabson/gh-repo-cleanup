import test from "node:test";
import assert from "node:assert/strict";
import { parseCliOptions } from "../src/lib/cli.js";

test("parseCliOptions reads flags and defaults", () => {
  const options = parseCliOptions([
    "node",
    "cli",
    "--owner",
    "acme",
    "--org",
    "platform",
    "--visibility",
    "private",
    "--repo",
    "api",
    "--search",
    "monorepo",
    "--yes",
    "--dry-run"
  ]);

  assert.equal(options.owner, "acme");
  assert.equal(options.org, "platform");
  assert.equal(options.visibility, "private");
  assert.equal(options.repo, "api");
  assert.equal(options.search, "monorepo");
  assert.equal(options.yes, true);
  assert.equal(options.dryRun, true);
});

test("parseCliOptions sets visibility default to all", () => {
  const options = parseCliOptions(["node", "cli"]);
  assert.equal(options.visibility, "all");
});
