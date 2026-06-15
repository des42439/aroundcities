import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../types/supabase.generated";

export type CliOptions = {
  limit: number | null;
  dryRun: boolean;
  force: boolean;
  historyId: string | null;
};

export type ToolConfig = CliOptions & {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  storageBucket: string;
  screenshotTimeoutMs: number;
  maxScreenshotWidth: number;
};

export function loadConfig(argv = process.argv.slice(2)): ToolConfig {
  const repoRoot = findRepoRoot(process.cwd());
  loadEnvFile(resolve(repoRoot, ".env"));
  loadEnvFile(resolve(repoRoot, ".env.local"));

  const options = parseArgs(argv);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  if (!supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return {
    ...options,
    supabaseUrl,
    supabaseServiceRoleKey,
    storageBucket: process.env.HISTORY_SCREENSHOT_BUCKET || "photos",
    screenshotTimeoutMs: numberFromEnv(
      process.env.HISTORY_SCREENSHOT_TIMEOUT_MS,
      30_000
    ),
    maxScreenshotWidth: numberFromEnv(
      process.env.HISTORY_SCREENSHOT_MAX_WIDTH,
      1600
    ),
  };
}

function findRepoRoot(startPath: string) {
  let current = resolve(startPath);

  while (true) {
    if (
      existsSync(join(current, ".env.local")) ||
      existsSync(join(current, "next.config.ts"))
    ) {
      return current;
    }

    const parent = dirname(current);

    if (parent === current) {
      return resolve(startPath);
    }

    current = parent;
  }
}

export function createSupabaseAdmin(config: ToolConfig) {
  return createClient<Database>(
    config.supabaseUrl,
    config.supabaseServiceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    limit: null,
    dryRun: false,
    force: false,
    historyId: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--limit") {
      options.limit = parsePositiveInteger(argv[index + 1], "--limit");
      index += 1;
      continue;
    }

    if (arg.startsWith("--limit=")) {
      options.limit = parsePositiveInteger(
        arg.slice("--limit=".length),
        "--limit"
      );
      continue;
    }

    if (arg === "--history-id") {
      options.historyId = requiredValue(argv[index + 1], "--history-id");
      index += 1;
      continue;
    }

    if (arg.startsWith("--history-id=")) {
      options.historyId = requiredValue(
        arg.slice("--history-id=".length),
        "--history-id"
      );
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return options;
}

function parsePositiveInteger(value: string | undefined, label: string) {
  const number = Number(requiredValue(value, label));

  if (!Number.isSafeInteger(number) || number < 1) {
    throw new Error(`${label} must be a positive whole number.`);
  }

  return number;
}

function requiredValue(value: string | undefined, label: string) {
  const text = value?.trim() ?? "";

  if (!text) {
    throw new Error(`${label} requires a value.`);
  }

  return text;
}

function numberFromEnv(value: string | undefined, fallback: number) {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function loadEnvFile(path: string) {
  if (!existsSync(path)) {
    return;
  }

  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;

    if (process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = stripQuotes(rawValue.trim());
  }
}

function stripQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
