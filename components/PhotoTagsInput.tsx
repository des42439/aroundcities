"use client";

import { useMemo, useState } from "react";
type Props = {
  name: string;
  initialTags: string[];
  suggestions: string[];
};

export default function PhotoTagsInput({
  name,
  initialTags,
  suggestions,
}: Props) {
  const [tags, setTags] = useState(
    normalizeTags(initialTags)
  );
  const [text, setText] = useState("");
  const normalizedText = text.trim().toLowerCase();
  const filteredSuggestions = useMemo(
    () =>
      normalizeTags(suggestions).filter(
        (tag) =>
          !tags.includes(tag) &&
          (!normalizedText || tag.includes(normalizedText))
      ),
    [normalizedText, suggestions, tags]
  );

  function addTag(value: string) {
    const tag = value.trim().toLowerCase();

    if (!tag || tags.includes(tag)) {
      setText("");
      return;
    }

    setTags([...tags, tag]);
    setText("");
  }

  function removeTag(value: string) {
    setTags(tags.filter((tag) => tag !== value));
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={tags.join(", ")} />
      <div className="flex min-h-11 flex-wrap gap-2 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => removeTag(tag)}
            className="rounded-full border border-neutral-700 px-3 py-1 text-sm text-neutral-200 hover:border-neutral-500"
          >
            {tag} x
          </button>
        ))}
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addTag(text);
            }
          }}
          onBlur={() => {
            if (text.trim()) {
              addTag(text);
            }
          }}
          placeholder="Add tag"
          className="min-w-32 flex-1 bg-transparent text-sm text-neutral-100 outline-none placeholder:text-neutral-600"
        />
      </div>
      {filteredSuggestions.length ? (
        <div className="flex flex-wrap gap-2">
          {filteredSuggestions.slice(0, 8).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="rounded-full border border-neutral-800 px-3 py-1 text-xs text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function normalizeTags(tags: string[]) {
  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}
