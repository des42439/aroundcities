"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  dangerButtonClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "./AdminForm";
import { useGlobalLoading } from "./GlobalLoading";

type Props = {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "primary" | "secondary" | "danger";
  name?: string;
  value?: string;
  confirmMessage?: string;
  disabled?: boolean;
};

const variantClassNames = {
  primary: primaryButtonClassName,
  secondary: secondaryButtonClassName,
  danger: dangerButtonClassName,
};

export function AdminSubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  name,
  value,
  confirmMessage,
  disabled = false,
}: Props) {
  const { pending } = useFormStatus();
  const { startLoading, stopLoading } = useGlobalLoading();
  const [clicked, setClicked] = useState(false);
  const showOverlay = pending && clicked;

  useEffect(() => {
    if (!pending && clicked) {
      stopLoading();
    }
  }, [clicked, pending, stopLoading]);

  return (
    <>
      {showOverlay ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 px-4 backdrop-blur-sm">
          <div
            role="status"
            aria-live="polite"
            className="w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-950 p-6 text-center shadow-2xl"
          >
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-100" />
            <p className="mt-4 font-medium text-neutral-100">
              {pendingLabel}
            </p>
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        name={name}
        value={value}
        disabled={pending || disabled}
        onClick={(event) => {
          if (
            confirmMessage &&
            !window.confirm(confirmMessage)
          ) {
            event.preventDefault();
            return;
          }

          setClicked(true);
          startLoading();
        }}
        className={variantClassNames[variant]}
      >
        {showOverlay ? pendingLabel : children}
      </button>
    </>
  );
}

export function AdminFormProgress({
  className = "",
}: {
  className?: string;
}) {
  const { pending } = useFormStatus();

  if (!pending) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`h-1 overflow-hidden rounded-full bg-neutral-900 ${className}`}
    >
      <div className="h-full w-1/2 animate-pulse rounded-full bg-neutral-300" />
    </div>
  );
}
