"use client";

import Link from "next/link";

type TrackedFeedLinkProps = {
  children: React.ReactNode;
  className?: string;
  feedId: string;
  href: string;
};

type TrackedPhotoLinkProps = {
  children: React.ReactNode;
  className?: string;
  href: string;
  photoId: string;
};

export function TrackedFeedLink({
  children,
  className,
  feedId,
  href,
}: TrackedFeedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackClick("/api/click/feed", { feedId })}
    >
      {children}
    </Link>
  );
}

export function TrackedPhotoLink({
  children,
  className,
  href,
  photoId,
}: TrackedPhotoLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={() => trackClick("/api/click/photo", { photoId })}
    >
      {children}
    </a>
  );
}

function trackClick(
  url: string,
  payload: Record<string, string>
) {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], {
      type: "application/json",
    });

    navigator.sendBeacon(url, blob);
    return;
  }

  void fetch(url, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
    },
    keepalive: true,
  });
}
