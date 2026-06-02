const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const requiredFiles = [
  "index.html",
  "assets/app.js",
  "assets/styles.css",
  "README.md",
  "package.json",
  "LICENSE"
];

for (const file of requiredFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing required project file: ${file}`);
  }
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "assets/app.js"), "utf8");

const requiredContent = [
  "Genome Insight Lab",
  "Sequence Analyzer",
  "Variant Reasoner",
  "Expression Explorer",
  "What This Teaches"
];

for (const text of requiredContent) {
  if (!html.includes(text)) {
    throw new Error(`Missing expected app section: ${text}`);
  }
}

const requiredFunctions = [
  "function cleanSequence",
  "function analyzeSequence",
  "function findOrfs",
  "function translate",
  "function interpretVariant"
];

for (const fn of requiredFunctions) {
  if (!app.includes(fn)) {
    throw new Error(`Missing expected analysis function: ${fn}`);
  }
}

console.log("Genome Insight Lab project smoke test passed.");
