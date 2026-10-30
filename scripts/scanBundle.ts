import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * MONEYVERSE Bundle Secret Scanner
 *
 * Scans production build output (dist/) for leaked secrets, API keys, and server-only env vars.
 * Run after `npm run build`.
 *
 * Checks:
 *  - Static patterns: "sk-ant-", "service_role", "ANTHROPIC_API_KEY"
 *  - Values of non-VITE_* environment variables defined in .env.local or .env
 *
 * NEVER prints secret values — only prints the offending filenames and variable names.
 */

const STATIC_PATTERNS = ["sk-ant-", "service_role", "ANTHROPIC_API_KEY"] as const;

function getRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

function loadNonViteEnvValues(): { name: string; value: string }[] {
  const root = getRoot();
  const envFiles = [".env.local", ".env"];
  const secrets: { name: string; value: string }[] = [];

  for (const file of envFiles) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) continue;

    try {
      const content = fs.readFileSync(fullPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }

        // Only scan for values belonging to non-VITE_* keys
        if (!key.startsWith("VITE_") && val.length >= 6) {
          // Skip generic placeholders like "your-key"
          if (val !== "your-anthropic-key" && val !== "your-service-role-key") {
            secrets.push({ name: key, value: val });
          }
        }
      }
    } catch {
      // Continue
    }
  }

  return secrets;
}

function getAllFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllFiles(full));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results;
}

function main(): void {
  console.log("=== MONEYVERSE Bundle Secret Scan ===");
  const root = getRoot();
  const distDir = path.join(root, "dist");

  if (!fs.existsSync(distDir)) {
    console.error("[FAIL] dist/ folder not found. Run 'npm run build' before scanning.");
    process.exit(1);
  }

  const files = getAllFiles(distDir);
  if (files.length === 0) {
    console.error("[FAIL] dist/ is empty. Run 'npm run build' before scanning.");
    process.exit(1);
  }

  const customSecrets = loadNonViteEnvValues();
  const textExtensions = new Set([".js", ".mjs", ".css", ".html", ".json", ".map", ".txt", ".svg"]);

  const violations: { file: string; rule: string }[] = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!textExtensions.has(ext)) continue;

    let content = "";
    try {
      content = fs.readFileSync(file, "utf-8");
    } catch {
      continue;
    }

    const relPath = path.relative(root, file);

    // 1. Static pattern check
    for (const pattern of STATIC_PATTERNS) {
      if (content.includes(pattern)) {
        violations.push({ file: relPath, rule: `Pattern "${pattern}"` });
      }
    }

    // 2. Custom non-VITE env values check
    for (const { name, value } of customSecrets) {
      if (content.includes(value)) {
        violations.push({ file: relPath, rule: `Value of env variable ${name}` });
      }
    }
  }

  if (violations.length > 0) {
    console.error("\n[SECURITY ALERT] Leaked secrets or forbidden patterns detected in dist/:\n");
    for (const v of violations) {
      console.error(`  - In file: ${v.file}`);
      console.error(`    Matched: ${v.rule}`);
    }
    console.error("\nBuild scan failed. Remove sensitive data before deploying!");
    process.exit(1);
  }

  console.log(`[PASS] Scanned ${files.length} files in dist/. No secrets or forbidden patterns found.`);
  process.exit(0);
}

main();

