"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  inputClassName,
  secondaryButtonClassName,
} from "./AdminForm";
import {
  formatRelativeTime,
  getFeaturedPhoto,
} from "@/lib/format";
import { getAdminEventDisplayTitle } from "@/lib/event-display";
import { FeedWithPlaceAndPhotos } from "@/types/database";

type TitleMode = "default" | "eventDatePrefix";

type Props = {
  feeds: FeedWithPlaceAndPhotos[];
  emptyText: string;
  timeField: "updated_at" | "published_at";
  statusLabel: string;
  searchPlaceholder?: string;
  titleMode?: TitleMode;
};

export default function AdminFeedList({
  feeds,
  emptyText,
  timeField,
  statusLabel,
  searchPlaceholder = "Search feeds",
  titleMode = "default",
}: Props) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const visibleFeeds = useMemo(
    () =>
      feeds.filter((feed) => {
        if (!normalizedSearch) {
          return true;
        }

        const displayTitle = getDisplayTitle(feed, titleMode);

        return (
          displayTitle.toLowerCase().includes(normalizedSearch) ||
          (feed.content ?? "")
            .toLowerCase()
            .includes(normalizedSearch) ||
          (feed.description ?? "")
            .toLowerCase()
            .includes(normalizedSearch)
        );
      }),
    [feeds, normalizedSearch, titleMode]
  );

  return (
    <div className="space-y-5">
      <label className="block max-w-xl">
        <span className="text-sm text-neutral-400">Search</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={searchPlaceholder}
          className={`${inputClassName} mt-2`}
        />
      </label>

      {visibleFeeds.length === 0 ? (
        <p className="rounded-lg border border-neutral-900 p-4 text-sm text-neutral-500">
          {emptyText}
        </p>
      ) : (
        <div className="space-y-3">
          {visibleFeeds.map((feed) => {
            const thumbnail = getFeaturedPhoto(feed.photos);
            const displayTitle = getDisplayTitle(feed, titleMode);

            return (
              <article
                key={feed.feed_id}
                className="flex min-h-24 flex-col gap-3 rounded-lg border border-neutral-900 p-3 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 gap-3">
                  {thumbnail ? (
                    <Image
                      src={thumbnail.photo_url}
                      alt={thumbnail.title ?? feed.title}
                      width={72}
                      height={72}
                      unoptimized
                      className="h-[72px] w-[72px] shrink-0 rounded-md bg-neutral-900 object-cover"
                    />
                  ) : (
                    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-md border border-neutral-900 bg-neutral-950 text-xs text-neutral-600">
                      No photo
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-2 font-semibold text-neutral-100">
                      {displayTitle}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span>{formatRelativeTime(feed[timeField])}</span>
                      <span className="rounded-full border border-neutral-800 px-2 py-1 text-neutral-300">
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/admin/feeds/${feed.feed_id}`}
                  className={`${secondaryButtonClassName} justify-center`}
                >
                  Edit
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getDisplayTitle(
  feed: FeedWithPlaceAndPhotos,
  titleMode: TitleMode
) {
  return titleMode === "eventDatePrefix"
    ? getAdminEventDisplayTitle(feed)
    : feed.title;
}
