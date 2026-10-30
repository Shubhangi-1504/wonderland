import { createClient } from "@supabase/supabase-js";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * MONEYVERSE Demo Seeder
 *
 * Safe, idempotent seeding script for judges/demoers.
 * Run with: npx tsx scripts/seedDemo.ts (or npm run seed:demo)
 *
 * Uses:
 *  - SUPABASE_SERVICE_ROLE_KEY (never VITE_*, never committed)
 *  - VITE_SUPABASE_URL
 *  - DEMO_PASSWORD (optional, defaults to DemoSafe2026!)
 */

// ─── Symbols configuration ──────────────────────────────────────────────────
// Editable SYMBOLS constant for demo seed. Uses real symbols NVLM and HRHB
// representing 3 holdings across 2 sectors (tech and consumer).
export interface SeedSymbol {
  companyId: string;
  symbol: string;
  sector: "tech" | "consumer" | "energy";
  qty: number;
  avgCost: number;
  avgPrice: number;
}

export const SYMBOLS: SeedSymbol[] = [
  {
    companyId: "nova-loom",
    symbol: "NVLM",
    sector: "tech",
    qty: 15,
    avgCost: 120,
    avgPrice: 120,
  },
  {
    companyId: "hearth-harbor",
    symbol: "HRHB",
    sector: "consumer",
    qty: 25,
    avgCost: 48,
    avgPrice: 48,
  },
  {
    companyId: "nova-loom-options",
    symbol: "NVLM-B",
    sector: "tech",
    qty: 10,
    avgCost: 35,
    avgPrice: 35,
  },
];

const DEMO_EMAIL = "demo@moneyverse.dev";
const DEMO_DISPLAY_NAME = "Demo Explorer";
const DEMO_XP = 120;
const DEMO_CASH = 4000;

function loadLocalEnv(): void {
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
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    } catch {
      // Continue if unreadable
    }
  }
}

async function main(): Promise<void> {
  loadLocalEnv();

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const demoPassword = process.env.DEMO_PASSWORD || "DemoSafe2026!";

  if (!supabaseUrl) {
    console.error("[FAIL] Missing VITE_SUPABASE_URL in environment or .env.local");
    process.exit(1);
  }

  if (!serviceRoleKey) {
    console.error("[FAIL] Missing SUPABASE_SERVICE_ROLE_KEY in environment or .env.local");
    console.error("The service role key is required for admin user creation and seeding.");
    console.error("Set SUPABASE_SERVICE_ROLE_KEY in your local environment or .env.local (never commit it).");
    process.exit(1);
  }

  console.log("=== MONEYVERSE Demo Seeder ===");
  console.log(`Target Supabase URL: ${supabaseUrl}`);

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // 1. Find or create demo user
  let userId: string | null = null;
  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    console.error("[FAIL] Could not list Supabase users:", listError.message);
    process.exit(1);
  }

  const existing = usersData.users.find((u) => u.email?.toLowerCase() === DEMO_EMAIL.toLowerCase());

  if (existing) {
    userId = existing.id;
    console.log(`[OK] Found existing demo user: ${DEMO_EMAIL} (id: ${userId})`);
    // Ensure password and metadata match
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: demoPassword,
      email_confirm: true,
      user_metadata: { display_name: DEMO_DISPLAY_NAME },
    });
    if (updateError) {
      console.warn("[WARN] Could not update demo user password:", updateError.message);
    }
  } else {
    console.log(`[INFO] Creating demo user: ${DEMO_EMAIL}...`);
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: demoPassword,
      email_confirm: true,
      user_metadata: { display_name: DEMO_DISPLAY_NAME },
    });

    if (createError || !created.user) {
      console.error("[FAIL] Failed to create demo user:", createError?.message);
      process.exit(1);
    }

    userId = created.user.id;
    console.log(`[OK] Created demo user (id: ${userId})`);
  }

  // 2. Upsert profile
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    {
      id: userId,
      display_name: DEMO_DISPLAY_NAME,
      xp: DEMO_XP,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error("[FAIL] Failed to upsert profile:", profileError.message);
    process.exit(1);
  }
  console.log(`[OK] Upserted profile: "${DEMO_DISPLAY_NAME}", XP: ${DEMO_XP}`);

  // 3. Upsert portfolio (cash 4000, 3 holdings across 2 sectors)
  const holdingsPayload = SYMBOLS.map((s) => ({
    companyId: s.companyId,
    symbol: s.symbol,
    qty: s.qty,
    avgCost: s.avgCost,
    avgPrice: s.avgPrice,
  }));

  const { error: portfolioError } = await supabaseAdmin.from("portfolios").upsert(
    {
      user_id: userId,
      cash: DEMO_CASH,
      holdings: holdingsPayload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (portfolioError) {
    console.error("[FAIL] Failed to upsert portfolio:", portfolioError.message);
    process.exit(1);
  }
  console.log(`[OK] Upserted portfolio: $${DEMO_CASH} cash, ${holdingsPayload.length} holdings across 2 sectors`);

  // 4. Upsert 2 completed missions
  const missionsPayload = [
    {
      user_id: userId,
      mission_id: "first-trade",
      completed: true,
      quiz_score: 100,
    },
    {
      user_id: userId,
      mission_id: "diversify-sectors",
      completed: true,
      quiz_score: 90,
    },
  ];

  const { error: missionsError } = await supabaseAdmin.from("mission_progress").upsert(
    missionsPayload,
    { onConflict: "user_id,mission_id" },
  );

  if (missionsError) {
    console.error("[FAIL] Failed to upsert missions:", missionsError.message);
    process.exit(1);
  }
  console.log(`[OK] Upserted ${missionsPayload.length} completed missions`);

  // Print final summary
  console.log("\n--- Demo Seeding Summary ---");
  console.log(`User Email:    ${DEMO_EMAIL}`);
  console.log(`Display Name:  ${DEMO_DISPLAY_NAME}`);
  console.log(`XP:            ${DEMO_XP}`);
  console.log(`Cash:          $${DEMO_CASH}`);
  console.log(`Holdings:      ${SYMBOLS.map((s) => `${s.symbol} (${s.qty} shares @ $${s.avgCost})`).join(", ")}`);
  console.log(`Missions:      ${missionsPayload.map((m) => `${m.mission_id} (completed)`).join(", ")}`);
  console.log("Seeding finished successfully. Safe to run repeatedly.");
}

void main();

