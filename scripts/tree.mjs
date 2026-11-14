import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const OUTPUT_FILE = path.join(ROOT_DIR, "tree.txt");

// Customize this list based on the specific project's build artifacts and secrets
const IGNORE_LIST = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  "tree.txt",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".devin", // Private rule folder. Remove this line if your project doesn't use one.
  ".kilo",
  ".next",
  ".nuxt",
  ".vite",
  ".cache"
]);

function generateTree(dir, prefix = "") {
  let output = "";
  // Use withFileTypes to avoid statSync calls and safely handle broken links
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const filteredEntries = entries
    .filter((entry) => {
      if (IGNORE_LIST.has(entry.name)) return false;
      if (entry.name.endsWith(".bak")) return false;
      if (entry.isSymbolicLink()) return false; // Prevent infinite symlink loops

      // Hide any .env file except the committed example
      if (entry.name.startsWith(".env") && entry.name !== ".env.example") return false;

      return true;
    })
    .sort((a, b) => {
      // Sort: Folders first, then files, alphabetically
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  filteredEntries.forEach((entry, index) => {
    const fullPath = path.join(dir, entry.name);
    const isLast = index === filteredEntries.length - 1;
    const isDir = entry.isDirectory();

    const pointer = isLast ? "└── " : "├── ";
    const newPrefix = prefix + (isLast ? "    " : "│   ");

    output += `${prefix}${pointer}${entry.name}${isDir ? "/" : ""}\n`;

    if (isDir) {
      output += generateTree(fullPath, newPrefix);
    }
  });

  return output;
}

try {
  console.log("Generating file tree...");

  // Add the root folder name at the top
  let finalOutput = `${path.basename(ROOT_DIR)}/\n`;
  finalOutput += generateTree(ROOT_DIR);

  fs.writeFileSync(OUTPUT_FILE, finalOutput, "utf8");

  console.log(`✅ Tree successfully saved to: ${OUTPUT_FILE}`);
} catch (error) {
  console.error("❌ Error generating tree:", error);
  process.exit(1);
}
