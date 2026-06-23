"use client";

import { useRouter } from "next/navigation";
import { selectClassName } from "./AdminForm";
import { useGlobalLoading } from "./GlobalLoading";
import type { FeedStatus } from "@/types/database";

type EventStatusFilterProps = {
  status: FeedStatus;
};

export default function EventStatusFilter({
  status,
}: EventStatusFilterProps) {
  const router = useRouter();
  const { startLoading } = useGlobalLoading();

  return (
    <label className="block max-w-xs">
      <span className="text-sm text-neutral-400">Status</span>
      <select
        value={status}
        onChange={(event) => {
          startLoading();
          router.push(`/admin/events?status=${event.target.value}`);
        }}
        className={`${selectClassName} mt-2`}
      >
        <option value="draft">Drafted</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
    </label>
  );
}
