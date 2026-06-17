"use client";

import { useRouter } from "next/navigation";
import { selectClassName } from "./AdminForm";
import type { SourceListView } from "@/lib/sources";
import { useGlobalLoading } from "./GlobalLoading";

type SourceViewFilterProps = {
  view: SourceListView;
};

export default function SourceViewFilter({
  view,
}: SourceViewFilterProps) {
  const router = useRouter();
  const { startLoading } = useGlobalLoading();

  return (
    <label className="block max-w-xs">
      <span className="text-sm text-neutral-400">Status</span>
      <select
        value={view}
        onChange={(event) => {
          startLoading();
          router.push(
            event.target.value === "all"
              ? "/admin/sources?view=all"
              : "/admin/sources"
          );
        }}
        className={`${selectClassName} mt-2`}
      >
        <option value="pending">Pending</option>
        <option value="all">Show all</option>
      </select>
    </label>
  );
}
