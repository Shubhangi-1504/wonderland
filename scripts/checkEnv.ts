import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * MONEYVERSE Environment Variable Checker
 *
 * Checks required and optional environment variables from .env.local / process.env.
 * PRINTS VARIABLE NAMES ONLY with PASS / FAIL status.
 * NEVER prints variable values to prevent accidental credential leakage in logs.
 *
 * Run with: npm run check:env
 */

const REQUIRED_VARS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "ANTHROPIC_API_KEY",
] as const;

const OPTIONAL_VARS = [
  "LLM_MODEL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DEMO_PASSWORD",
] as const;

function loadLocalEnv(): Record<string, string> {
  const env: Record<string, string> = { ...process.env } as Record<string, string>;
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const envFiles = [".env.local", ".env"];

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
        if (key && !env[key]) {
          env[key] = val;
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  return env;
}

function main(): void {
  console.log("=== MONEYVERSE Environment Check ===\n");

  const env = loadLocalEnv();
  let hasFailure = false;

  console.log("Required variables:");
  for (const name of REQUIRED_VARS) {
    const val = env[name];
    const isPresent = Boolean(val && val.trim().length > 0);
    if (isPresent) {
      console.log(`  [PASS] ${name}`);
    } else {
      console.log(`  [FAIL] ${name}`);
      hasFailure = true;
    }
  }

  console.log("\nOptional variables:");
  for (const name of OPTIONAL_VARS) {
    const val = env[name];
    const isPresent = Boolean(val && val.trim().length > 0);
    if (isPresent) {
      console.log(`  [PASS] ${name} (optional)`);
    } else {
      console.log(`  [FAIL] ${name} (optional)`);
    }
  }

  console.log("\n-------------------------------------");
  if (hasFailure) {
    console.error("Result: FAILED. Missing one or more required environment variables.");
    console.error("Check your .env.local file or platform configuration.");
    process.exit(1);
  } else {
    console.log("Result: PASSED. All required environment variables are set.");
    process.exit(0);
  }
}

main();

