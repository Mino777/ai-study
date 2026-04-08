import { watch } from "chokidar";
import { execSync } from "child_process";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");

console.log("👁️  Watching content/ for changes...");

// Generate once on start
try {
  execSync("node scripts/generate-content-manifest.mjs", { stdio: "inherit" });
} catch {
  // Non-fatal on initial run
}

const watcher = watch(CONTENT_DIR, {
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 300 },
});

let debounceTimer = null;

function regenerate() {
  try {
    execSync("node scripts/generate-content-manifest.mjs", { stdio: "inherit" });
  } catch {
    // Errors are printed by the script itself
  }
}

watcher.on("all", (event, filePath) => {
  if (!filePath.endsWith(".mdx")) return;
  console.log(`\n📝 ${event}: ${path.relative(process.cwd(), filePath)}`);
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(regenerate, 500);
});
