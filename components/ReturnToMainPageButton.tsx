"use client";

import { useRouter } from "next/navigation";
import { secondaryButtonClassName } from "./AdminForm";
import { useGlobalLoading } from "./GlobalLoading";

export default function ReturnToMainPageButton({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const { startLoading } = useGlobalLoading();

  return (
    <button
      type="button"
      onClick={() => {
        startLoading();

        if (
          document.referrer &&
          new URL(document.referrer).origin === window.location.origin
        ) {
          router.back();
          return;
        }

        router.push("/kch");
      }}
      className={`${secondaryButtonClassName} ${className}`}
    >
      Return to Main Page
    </button>
  );
}
