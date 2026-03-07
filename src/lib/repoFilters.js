export function splitReposByAdminPermission(repos) {
  const withAdmin = [];
  const withoutAdmin = [];

  for (const repo of repos) {
    if (repo.permissions?.admin === true) {
      withAdmin.push(repo);
    } else {
      withoutAdmin.push(repo);
    }
  }

  return { withAdmin, withoutAdmin };
}

export function filterReposBySearch(repos, searchText) {
  const term = (searchText || "").trim().toLowerCase();
  if (!term) return repos;

  return repos.filter((repo) => {
    const repoName = (repo.name || "").toLowerCase();
    const fullName = (repo.full_name || "").toLowerCase();
    return repoName.includes(term) || fullName.includes(term);
  });
}

export function applyRepoFilters(repos, filters) {
  const { visibility, org } = filters;
  let filtered = repos;

  if (visibility === "public") {
    filtered = filtered.filter((repo) => repo.private === false);
  } else if (visibility === "private") {
    filtered = filtered.filter((repo) => repo.private === true);
  }

  if (org) {
    const orgTerm = org.trim().toLowerCase();
    filtered = filtered.filter(
      (repo) =>
        (repo.owner?.type || "").toLowerCase() === "organization" &&
        (repo.owner?.login || "").toLowerCase() === orgTerm
    );
  }

  return filtered;
}

export function sortRepos(repos) {
  return repos.slice().sort((a, b) => a.full_name.localeCompare(b.full_name));
}

export function toDeleteTarget(repo) {
  return {
    owner: repo.owner?.login,
    repo: repo.name,
    fullName: repo.full_name
  };
}
