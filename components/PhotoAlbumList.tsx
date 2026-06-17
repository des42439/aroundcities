"use client";

import Image from "next/image";
import Link from "next/link";
import {
  inputClassName,
  secondaryButtonClassName,
  selectClassName,
} from "./AdminForm";
import { formatRelativeTime } from "@/lib/format";
import type {
  Photo,
  PhotoAlbumStatus,
  PhotoAlbumWithPhotos,
} from "@/types/database";
import { useMemo, useState } from "react";

type StatusFilter = PhotoAlbumStatus | "all";

export default function PhotoAlbumList({
  albums,
}: {
  albums: PhotoAlbumWithPhotos[];
}) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const visibleAlbums = useMemo(
    () =>
      albums.filter((album) => {
        const matchesStatus = status === "all" || album.status === status;
        const matchesSearch =
          !normalizedSearch ||
          album.title.toLowerCase().includes(normalizedSearch) ||
          (album.description ?? "")
            .toLowerCase()
            .includes(normalizedSearch);

        return matchesStatus && matchesSearch;
      }),
    [albums, normalizedSearch, status]
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-neutral-400">Status</span>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as StatusFilter)
            }
            className={`${selectClassName} mt-2`}
          >
            <option value="all">Show All</option>
            <option value="drafted">Drafted</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-neutral-400">Search</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search albums"
            className={`${inputClassName} mt-2`}
          />
        </label>
      </div>

      {visibleAlbums.length === 0 ? (
        <p className="rounded-lg border border-neutral-900 p-4 text-sm text-neutral-500">
          No photo albums found.
        </p>
      ) : (
        <div className="space-y-3">
          {visibleAlbums.map((album) => {
            const thumbnail = getAlbumThumbnail(album.photos);

            return (
              <article
                key={album.album_id}
                className="grid gap-4 rounded-lg border border-neutral-900 p-4 sm:grid-cols-[112px_1fr_auto] sm:items-center"
              >
                <div className="relative aspect-square overflow-hidden rounded-md bg-neutral-900">
                  {thumbnail ? (
                    <Image
                      src={thumbnail.photo_url}
                      alt={album.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-600">
                      No photos
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-100">
                    {album.title}
                  </h2>
                  {album.description ? (
                    <p className="mt-1 text-sm text-neutral-500">
                      {album.description}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-500">
                    <span className={statusClassName(album.status)}>
                      {statusLabel(album.status)}
                    </span>
                    <span>{album.photos.length} photos</span>
                    <span>Updated {formatRelativeTime(album.updated_at)}</span>
                  </div>
                </div>
                <Link
                  href={`/admin/photos/${album.album_id}`}
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

function getAlbumThumbnail(photos: Photo[]) {
  return (
    photos.find((photo) => photo.is_album_cover) ??
    photos[0] ??
    null
  );
}

function statusLabel(status: PhotoAlbumStatus) {
  const labels: Record<PhotoAlbumStatus, string> = {
    drafted: "Drafted",
    published: "Published",
    archived: "Archived",
  };

  return labels[status];
}

function statusClassName(status: PhotoAlbumStatus) {
  const base = "rounded-full border px-2 py-1";
  const colors: Record<PhotoAlbumStatus, string> = {
    drafted: "border-neutral-800 text-neutral-300",
    published:
      "border-emerald-950 bg-emerald-950/30 text-emerald-100",
    archived: "border-neutral-800 bg-neutral-900 text-neutral-400",
  };

  return `${base} ${colors[status]}`;
}
