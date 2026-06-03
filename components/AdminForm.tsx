type FieldProps = {
  label: string;
  children: React.ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm text-neutral-400">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const inputClassName =
  "w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-500";

export const textareaClassName =
  "min-h-36 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-500";

export const selectClassName =
  "w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-500";

export const primaryButtonClassName =
  "rounded-md bg-neutral-100 px-4 py-2 font-medium text-neutral-950 hover:bg-white";

export const secondaryButtonClassName =
  "rounded-md border border-neutral-800 px-4 py-2 text-neutral-300 hover:border-neutral-600";
