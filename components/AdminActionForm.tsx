"use client";

import { FormEvent, useEffect, useState } from "react";
import { useActionState } from "react";

export type AdminActionState = {
  error?: string | null;
  errorId?: string | null;
};

type Props = {
  action: (
    state: AdminActionState,
    formData: FormData
  ) => Promise<AdminActionState>;
  children: React.ReactNode;
  className?: string;
  maxFileBytes?: number;
  maxFileBytesMessage?: string;
};

const initialState: AdminActionState = {
  error: null,
};

export default function AdminActionForm({
  action,
  children,
  className,
  maxFileBytes,
  maxFileBytesMessage,
}: Props) {
  const [clientError, setClientError] = useState<
    string | null
  >(null);
  const [state, formAction] = useActionState(
    action,
    initialState
  );

  useEffect(() => {
    if (state.error) {
      console.error("[admin-action-error]", {
        error: state.error,
        errorId: state.errorId,
      });
    }
  }, [state.error, state.errorId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setClientError(null);

    if (!maxFileBytes) {
      return;
    }

    const form = event.currentTarget;
    const fileInputs = Array.from(
      form.querySelectorAll<HTMLInputElement>(
        'input[type="file"]'
      )
    );
    const totalBytes = fileInputs.reduce((total, input) => {
      return (
        total +
        Array.from(input.files ?? []).reduce(
          (fileTotal, file) => fileTotal + file.size,
          0
        )
      );
    }, 0);

    if (totalBytes > maxFileBytes) {
      event.preventDefault();
      setClientError(
        maxFileBytesMessage ??
          `Selected files are too large. Maximum total upload size is ${Math.floor(
            maxFileBytes / 1024 / 1024
          )}MB.`
      );
    }
  }

  const visibleError = clientError ?? state.error;

  return (
    <form
      action={formAction}
      className={className}
      onSubmit={handleSubmit}
    >
      {visibleError ? (
        <div className="rounded-md border border-red-950 bg-red-950/30 px-3 py-2 text-sm text-red-100">
          {visibleError}
        </div>
      ) : null}
      {children}
    </form>
  );
}
