"use server";

import { redirect } from "next/navigation";
import {
  grantPublicPageAccess,
  isPublicPagePasswordValid,
} from "@/lib/public-lock";

export async function unlockPublicPage(formData: FormData) {
  const password =
    formData.get("password")?.toString() ?? "";

  if (!isPublicPagePasswordValid(password)) {
    redirect("/kch?publicLockError=1");
  }

  await grantPublicPageAccess();
  redirect("/kch");
}
