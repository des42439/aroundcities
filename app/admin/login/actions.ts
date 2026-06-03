"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSessionCookie,
  setAdminSessionCookie,
} from "@/lib/admin-auth";

export async function loginAdmin(formData: FormData) {
  const password =
    formData.get("password")?.toString() ?? "";

  if (
    !process.env.ADMIN_PASSWORD ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    redirect("/admin/login?error=1");
  }

  await setAdminSessionCookie();
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
