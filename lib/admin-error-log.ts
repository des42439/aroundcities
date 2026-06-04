import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdmin } from "./supabase-admin";

type AdminErrorContext = Record<string, unknown>;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}

export async function logAdminError(
  area: string,
  error: unknown,
  context: AdminErrorContext = {}
) {
  const errorId = crypto.randomUUID();
  const serializedError = serializeError(error);
  const message = serializedError.message;
  const entry = {
    error_id: errorId,
    area,
    message,
    details: {
      ...context,
      error: serializedError,
    },
    created_at: new Date().toISOString(),
  };

  console.error("[admin-error]", JSON.stringify(entry));

  try {
    await getSupabaseAdmin()
      .from("admin_error_logs")
      .insert(entry);
  } catch (logError) {
    console.error(
      "[admin-error-log-db-failed]",
      serializeError(logError)
    );
  }

  try {
    const logDir = path.join(process.cwd(), ".logs");
    await mkdir(logDir, { recursive: true });
    await appendFile(
      path.join(logDir, "admin-errors.jsonl"),
      `${JSON.stringify(entry)}\n`,
      "utf8"
    );
  } catch (fileError) {
    console.error(
      "[admin-error-log-file-failed]",
      serializeError(fileError)
    );
  }

  return {
    errorId,
    message,
  };
}
