import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE } from "./admin-session";

const SESSION_PAYLOAD = "aroundcities-admin-v1";

export function createAdminSessionToken(): string {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }

  return createHmac("sha256", password)
    .update(SESSION_PAYLOAD)
    .digest("hex");
}

export function verifyAdminSessionToken(
  token?: string | null
): boolean {
  if (!token) {
    return false;
  }

  const expected = createAdminSessionToken();
  const expectedBuffer = Buffer.from(expected);
  const tokenBuffer = Buffer.from(token);

  if (expectedBuffer.length !== tokenBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, tokenBuffer);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(
    ADMIN_SESSION_COOKIE
  )?.value;

  return verifyAdminSessionToken(token);
}

export async function requireAdmin() {
  const isAuthenticated =
    await isAdminAuthenticated();

  if (!isAuthenticated) {
    redirect("/admin/login");
  }
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: ADMIN_SESSION_COOKIE,
    value: createAdminSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 0,
  });
}
