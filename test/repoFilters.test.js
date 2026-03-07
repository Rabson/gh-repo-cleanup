import test from "node:test";
import assert from "node:assert/strict";
import {
  splitReposByAdminPermission,
  filterReposBySearch,
  applyRepoFilters,
  sortRepos,
  toDeleteTarget
} from "../src/lib/repoFilters.js";

const repos = [
  {
    name: "ApiServer",
    full_name: "acme/ApiServer",
    private: true,
    owner: { login: "acme", type: "Organization" },
    permissions: { admin: true }
  },
  {
    name: "web-client",
    full_name: "acme/web-client",
    private: false,
    owner: { login: "acme", type: "Organization" },
    permissions: { admin: false }
  },
  {
    name: "DemoApp",
    full_name: "rabson/DemoApp",
    private: false,
    owner: { login: "rabson", type: "User" },
    permissions: { admin: true }
  }
];

test("splitReposByAdminPermission separates admin and non-admin repos", () => {
  const { withAdmin, withoutAdmin } = splitReposByAdminPermission(repos);

  assert.equal(withAdmin.length, 2);
  assert.equal(withoutAdmin.length, 1);
  assert.equal(withoutAdmin[0].full_name, "acme/web-client");
});

test("filterReposBySearch is case-insensitive and checks both name and full_name", () => {
  const byName = filterReposBySearch(repos, "api");
  const byFullName = filterReposBySearch(repos, "RABSON/");

  assert.equal(byName.length, 1);
  assert.equal(byName[0].full_name, "acme/ApiServer");
  assert.equal(byFullName.length, 1);
  assert.equal(byFullName[0].full_name, "rabson/DemoApp");
});

test("applyRepoFilters supports visibility and org together", () => {
  const filtered = applyRepoFilters(repos, {
    visibility: "private",
    org: "ACME"
  });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].full_name, "acme/ApiServer");
});

test("sortRepos sorts by full_name", () => {
  const sorted = sortRepos([repos[2], repos[0], repos[1]]);
  assert.deepEqual(
    sorted.map((repo) => repo.full_name),
    ["acme/ApiServer", "acme/web-client", "rabson/DemoApp"]
  );
});

test("toDeleteTarget maps repo shape correctly", () => {
  assert.deepEqual(toDeleteTarget(repos[0]), {
    owner: "acme",
    repo: "ApiServer",
    fullName: "acme/ApiServer"
  });
});

test("applyRepoFilters org filter keeps only organization-owned repos", () => {
  const filtered = applyRepoFilters(repos, {
    visibility: "all",
    org: "acme"
  });

  assert.equal(filtered.length, 2);
  assert.equal(filtered.every((repo) => repo.owner.type === "Organization"), true);
});
