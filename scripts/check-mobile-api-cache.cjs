const fs = require("fs");
const path = require("path");

const root = path.join(process.cwd(), "app", "api", "mobile");

function walk(dir) {
  let files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(walk(full));
    } else if (entry.name === "route.ts") {
      files.push(full);
    }
  }

  return files;
}

const problems = [];

for (const file of walk(root)) {
  const content = fs.readFileSync(file, "utf8");

  if (
    /s-maxage\s*=/i.test(content) ||
    /stale-while-revalidate\s*=/i.test(content)
  ) {
    problems.push(path.relative(process.cwd(), file));
  }
}

if (problems.length) {
  console.error("\nERROR: Mobile API CDN caching detected:");

  for (const file of problems) {
    console.error(" - " + file);
  }

  process.exit(1);
}

console.log("OK: Mobile API cache protection passed.");
