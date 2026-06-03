"use client";

import { useState } from "react";

function slugifyClient(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Props = {
  sourceLabel: string;
  sourceName: string;
  slugLabel?: string;
  initialSource?: string;
  initialSlug?: string;
};

export default function AutoSlugFields({
  sourceLabel,
  sourceName,
  slugLabel = "Slug",
  initialSource = "",
  initialSlug = "",
}: Props) {
  const [source, setSource] = useState(initialSource);
  const [slug, setSlug] = useState(initialSlug);
  const [slugEdited, setSlugEdited] = useState(
    Boolean(initialSlug)
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="block">
        <span className="text-sm text-neutral-400">
          {sourceLabel}
        </span>
        <input
          name={sourceName}
          value={source}
          onChange={(event) => {
            const nextValue = event.target.value;
            setSource(nextValue);

            if (!slugEdited) {
              setSlug(slugifyClient(nextValue));
            }
          }}
          required
          className="mt-2 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-500"
        />
      </label>

      <label className="block">
        <span className="text-sm text-neutral-400">
          {slugLabel}
        </span>
        <input
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugEdited(true);
            setSlug(slugifyClient(event.target.value));
          }}
          required
          className="mt-2 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-500"
        />
      </label>
    </div>
  );
}
