export function exitWithError(message) {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}
