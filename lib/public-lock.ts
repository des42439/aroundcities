import { cookies } from "next/headers";

export const LOCK_USER_PAGE = true;
export const USER_PAGE_PASSWORD = "127";

export const PUBLIC_ACCESS_COOKIE = "ac_public_access";
const PUBLIC_ACCESS_VALUE = "granted";

export async function hasPublicPageAccess(): Promise<boolean> {
  if (!LOCK_USER_PAGE) {
    return true;
  }

  const cookieStore = await cookies();

  return (
    cookieStore.get(PUBLIC_ACCESS_COOKIE)?.value ===
    PUBLIC_ACCESS_VALUE
  );
}

export function isPublicPagePasswordValid(
  password: string
): boolean {
  return password === USER_PAGE_PASSWORD;
}

export async function grantPublicPageAccess() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: PUBLIC_ACCESS_COOKIE,
    value: PUBLIC_ACCESS_VALUE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
