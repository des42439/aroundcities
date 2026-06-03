"use client";

import { useActionState } from "react";

export type AdminActionState = {
  error?: string | null;
};

type Props = {
  action: (
    state: AdminActionState,
    formData: FormData
  ) => Promise<AdminActionState>;
  children: React.ReactNode;
  className?: string;
};

const initialState: AdminActionState = {
  error: null,
};

export default function AdminActionForm({
  action,
  children,
  className,
}: Props) {
  const [state, formAction] = useActionState(
    action,
    initialState
  );

  return (
    <form action={formAction} className={className}>
      {state.error ? (
        <div className="rounded-md border border-red-950 bg-red-950/30 px-3 py-2 text-sm text-red-100">
          {state.error}
        </div>
      ) : null}
      {children}
    </form>
  );
}
