"use client";

import { useRouter } from "next/navigation";
import { selectClassName } from "./AdminForm";
import type { HistoryRecordFilter } from "@/lib/history";

type HistoryRecordFilterSelectProps = {
  filter: HistoryRecordFilter;
  basePath: "/admin/history" | "/admin/history/export";
  onFilterChange?: (filter: HistoryRecordFilter) => void;
};

const options: {
  value: HistoryRecordFilter;
  label: string;
}[] = [
  { value: "daily", label: "Daily Tasks" },
  { value: "all", label: "Show All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafted" },
  { value: "archived", label: "Archived" },
];

export default function HistoryRecordFilterSelect({
  filter,
  basePath,
  onFilterChange,
}: HistoryRecordFilterSelectProps) {
  const router = useRouter();

  return (
    <label className="block max-w-xs">
      <span className="text-sm text-neutral-400">View</span>
      <select
        value={filter}
        onChange={(event) => {
          const nextFilter = event.target.value as HistoryRecordFilter;
          onFilterChange?.(nextFilter);
          router.push(
            nextFilter === "daily"
              ? basePath
              : `${basePath}?view=${nextFilter}`
          );
        }}
        className={`${selectClassName} mt-2`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
