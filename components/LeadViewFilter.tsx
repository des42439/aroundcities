"use client";

import { useRouter } from "next/navigation";
import { selectClassName } from "./AdminForm";
import { useGlobalLoading } from "./GlobalLoading";
import type { LeadListView } from "@/lib/leads";

type Props = {
  view: LeadListView;
};

export default function LeadViewFilter({ view }: Props) {
  const router = useRouter();
  const { startLoading } = useGlobalLoading();

  return (
    <label className="block max-w-xs">
      <span className="text-sm text-neutral-400">Status</span>
      <select
        value={view}
        onChange={(event) => {
          const nextView = event.target.value;
          startLoading();
          router.push(
            nextView === "active"
              ? "/admin/leads"
              : `/admin/leads?view=${nextView}`
          );
        }}
        className={`${selectClassName} mt-2`}
      >
        <option value="active">Active</option>
        <option value="archived">Archived</option>
        <option value="all">Show All</option>
      </select>
    </label>
  );
}
