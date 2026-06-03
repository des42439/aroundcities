"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import {
  dangerButtonClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "./AdminForm";

type Props = {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "primary" | "secondary" | "danger";
  name?: string;
  value?: string;
  confirmMessage?: string;
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
}: Props) {
  const { pending } = useFormStatus();
  const [clicked, setClicked] = useState(false);

  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      onClick={(event) => {
        if (
          confirmMessage &&
          !window.confirm(confirmMessage)
        ) {
          event.preventDefault();
          return;
        }

        setClicked(true);
      }}
      className={variantClassNames[variant]}
    >
      {pending && clicked ? pendingLabel : children}
    </button>
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
