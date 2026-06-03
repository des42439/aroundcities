import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";

const SESSION_PAYLOAD = "aroundcities-admin-v1";

async function createExpectedToken(
  password: string
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(SESSION_PAYLOAD)
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/")
  ) {
    return NextResponse.next();
  }

  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  const token = request.cookies.get(
    ADMIN_SESSION_COOKIE
  )?.value;

  const expectedToken =
    await createExpectedToken(password);

  if (token !== expectedToken) {
    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
