import test from "node:test";
import assert from "node:assert/strict";
import { validateToken, validateVisibility } from "../src/lib/validation.js";

function runWithExitCapture(fn) {
  const originalExit = process.exit;
  const originalError = console.error;
  let exitCode;
  let errorOutput = "";

  process.exit = (code) => {
    exitCode = code;
    throw new Error(`EXIT_${code}`);
  };

  console.error = (...args) => {
    errorOutput += args.join(" ");
  };

  try {
    fn();
    return { exited: false, exitCode: undefined, errorOutput };
  } catch (error) {
    if (String(error.message).startsWith("EXIT_")) {
      return { exited: true, exitCode, errorOutput };
    }
    throw error;
  } finally {
    process.exit = originalExit;
    console.error = originalError;
  }
}

test("validateVisibility normalizes valid values", () => {
  assert.equal(validateVisibility(" PRIVATE "), "private");
  assert.equal(validateVisibility("all"), "all");
});

test("validateVisibility exits for invalid value", () => {
  const result = runWithExitCapture(() => validateVisibility("internal"));

  assert.equal(result.exited, true);
  assert.equal(result.exitCode, 1);
  assert.match(result.errorOutput, /Invalid visibility/);
});

test("validateToken does not exit when token exists", () => {
  const result = runWithExitCapture(() => validateToken("ghp_xxx"));
  assert.equal(result.exited, false);
});

test("validateToken exits when token is missing", () => {
  const result = runWithExitCapture(() => validateToken(""));

  assert.equal(result.exited, true);
  assert.equal(result.exitCode, 1);
  assert.match(result.errorOutput, /Missing GITHUB_TOKEN/);
});
