import { exitWithError } from "./errors.js";

export function validateToken(token) {
  if (!token) {
    exitWithError("Missing GITHUB_TOKEN. Add it to your environment or .env file.");
  }
}

export function validateVisibility(visibility) {
  const allowed = new Set(["all", "public", "private"]);
  const normalized = (visibility || "all").trim().toLowerCase();

  if (!allowed.has(normalized)) {
    exitWithError(
      `Invalid visibility "${visibility}". Use one of: all, public, private.`
    );
  }

  return normalized;
}
