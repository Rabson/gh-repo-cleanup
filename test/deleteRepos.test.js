import test from "node:test";
import assert from "node:assert/strict";
import { deleteRepos } from "../src/lib/deleteRepos.js";

const targets = [
  { owner: "acme", repo: "one", fullName: "acme/one" },
  { owner: "acme", repo: "two", fullName: "acme/two" }
];

test("deleteRepos skips API delete calls in dry-run mode", async () => {
  let callCount = 0;
  const octokit = {
    repos: {
      delete: async () => {
        callCount += 1;
      }
    }
  };

  const result = await deleteRepos(octokit, targets, true);

  assert.equal(callCount, 0);
  assert.deepEqual(result, { processedCount: 2, failedCount: 0 });
});

test("deleteRepos reports failures and continues processing", async () => {
  const calls = [];
  const octokit = {
    repos: {
      delete: async ({ repo }) => {
        calls.push(repo);
        if (repo === "one") {
          throw new Error("permission denied");
        }
      }
    }
  };

  const result = await deleteRepos(octokit, targets, false);

  assert.deepEqual(calls, ["one", "two"]);
  assert.deepEqual(result, { processedCount: 1, failedCount: 1 });
});
