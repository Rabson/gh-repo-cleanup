import readline from "node:readline";
import inquirer from "inquirer";
import { filterReposBySearch, sortRepos, toDeleteTarget } from "./repoFilters.js";

function formatRepoChoice(repo) {
  const visibility = repo.private ? "private" : "public";
  const archived = repo.archived ? " archived" : "";

  return {
    name: `${repo.full_name} [${visibility}]${archived}`,
    value: toDeleteTarget(repo)
  };
}

function renderInteractiveSelector(state) {
  const {
    query,
    cursor,
    filtered,
    selectedFullNames,
    totalCount,
    pageSize,
    statusMessage
  } = state;

  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);

  process.stdout.write(
    "Select repositories to delete\n" +
      "Keys: ↑/↓ move, Space toggle, type to search, Backspace delete query, Enter confirm, Esc exit, Ctrl+C exit\n\n"
  );
  process.stdout.write(`Search: ${query}\n`);
  process.stdout.write(
    `Showing ${filtered.length}/${totalCount} repositories | Selected: ${selectedFullNames.size}\n`
  );
  if (statusMessage) {
    process.stdout.write(`${statusMessage}\n`);
  }
  process.stdout.write("\n");

  if (filtered.length === 0) {
    process.stdout.write("No repositories match your search.\n");
    return;
  }

  const safeCursor = Math.max(0, Math.min(cursor, filtered.length - 1));
  const start = Math.max(
    0,
    Math.min(safeCursor - Math.floor(pageSize / 2), filtered.length - pageSize)
  );
  const end = Math.min(filtered.length, start + pageSize);

  for (let i = start; i < end; i += 1) {
    const repo = filtered[i];
    const focused = i === safeCursor ? ">" : " ";
    const checked = selectedFullNames.has(repo.full_name) ? "[x]" : "[ ]";
    const visibility = repo.private ? "private" : "public";
    const archived = repo.archived ? " archived" : "";
    process.stdout.write(
      `${focused} ${checked} ${repo.full_name} [${visibility}]${archived}\n`
    );
  }
}

export async function promptRepoSelectionInteractive(repos, initialSearch = "") {
  const sortedRepos = sortRepos(repos);

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    const choices = sortedRepos.map(formatRepoChoice);
    const { selectedRepos } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedRepos",
        message:
          "Select repositories to delete (Use ↑/↓ to move, Space to select, Enter to confirm):",
        pageSize: 18,
        choices,
        validate: (input) =>
          input.length > 0 ? true : "Select at least one repository."
      }
    ]);

    return {
      action: "delete",
      query: (initialSearch || "").trim(),
      selectedRepos
    };
  }

  return new Promise((resolve) => {
    const state = {
      query: (initialSearch || "").trim(),
      selectedFullNames: new Set(),
      cursor: 0,
      statusMessage: "",
      pageSize: 18
    };

    const getFiltered = () => filterReposBySearch(sortedRepos, state.query);
    let filtered = getFiltered();

    const render = () =>
      renderInteractiveSelector({
        ...state,
        filtered,
        totalCount: sortedRepos.length
      });

    const cleanup = () => {
      process.stdin.removeListener("keypress", onKeypress);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
      readline.cursorTo(process.stdout, 0);
      readline.clearScreenDown(process.stdout);
    };

    const finish = () => {
      const selectedRepos = sortedRepos
        .filter((repo) => state.selectedFullNames.has(repo.full_name))
        .map(toDeleteTarget);

      cleanup();
      resolve({
        action: "delete",
        query: state.query,
        selectedRepos
      });
    };

    const exit = () => {
      cleanup();
      resolve({
        action: "exit",
        query: state.query,
        selectedRepos: []
      });
    };

    const onKeypress = (str, key) => {
      if (key?.ctrl && key.name === "c") {
        cleanup();
        process.exit(1);
      }

      if (key?.name === "up") {
        if (filtered.length > 0) {
          state.cursor = (state.cursor - 1 + filtered.length) % filtered.length;
        }
      } else if (key?.name === "down") {
        if (filtered.length > 0) {
          state.cursor = (state.cursor + 1) % filtered.length;
        }
      } else if (key?.name === "space") {
        if (filtered.length > 0) {
          const target = filtered[state.cursor];
          if (state.selectedFullNames.has(target.full_name)) {
            state.selectedFullNames.delete(target.full_name);
          } else {
            state.selectedFullNames.add(target.full_name);
          }
        }
      } else if (key?.name === "backspace") {
        state.query = state.query.slice(0, -1);
      } else if (key?.name === "escape") {
        exit();
        return;
      } else if (key?.name === "return") {
        if (state.selectedFullNames.size === 0) {
          state.statusMessage = "Select at least one repository before confirming.";
          render();
          return;
        }
        finish();
        return;
      } else if (!key?.ctrl && !key?.meta && str && /^[\x20-\x7E]$/.test(str)) {
        state.query += str;
      }

      filtered = getFiltered();
      if (filtered.length === 0) {
        state.cursor = 0;
      } else if (state.cursor > filtered.length - 1) {
        state.cursor = filtered.length - 1;
      }
      state.statusMessage = "";
      render();
    };

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("keypress", onKeypress);
    render();
  });
}
