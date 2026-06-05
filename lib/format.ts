import { FeedType, FeedWithPlaceAndPhotos, Photo } from "@/types/database";

export function formatDate(value?: string | null): string {
  if (!value) {
    return "Unpublished";
  }

  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kuching",
  }).format(new Date(value));
}

export function formatRelativeTime(value?: string | null): string {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);
  const timestamp = date.getTime();

  if (Number.isNaN(timestamp)) {
    return "Just now";
  }

  const diffSeconds = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 1000)
  );

  if (diffSeconds < 60) {
    return "Just now";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 14) {
    return `${diffDays} days ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);

  if (diffWeeks < 8) {
    return `${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths < 12) {
    return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
  }

  const diffYears = Math.max(1, Math.floor(diffDays / 365));

  return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`;
}

export function formatFeedType(feedType: FeedType): string {
  const labels: Record<FeedType, string> = {
    photo_walk: "Photo Walk",
    food_visit: "Food Visit",
    event_observation: "Event Observation",
    local_discovery: "Local Discovery",
  };

  return labels[feedType];
}

export function getContentPreview(
  content?: string | null,
  maxLength = 140
): string {
  if (!content) {
    return "";
  }

  const trimmed = content.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength).trim()}...`;
}

export function getFeaturedPhoto(
  photos?: Photo[] | null
): Photo | null {
  if (!photos?.length) {
    return null;
  }

  return (
    photos.find((photo) => photo.featured) ??
    photos[0] ??
    null
  );
}

export function isPlaceholderPhoto(photo?: Photo | null): boolean {
  if (!photo) {
    return false;
  }

  return /placehold\.co|placeholder|dummyimage/i.test(photo.photo_url);
}

export function isVisualFirstFeed(feed: FeedWithPlaceAndPhotos): boolean {
  const text = `${feed.feed_type} ${feed.title} ${feed.tags.join(" ")}`.toLowerCase();

  if (
    text.includes("registration") ||
    text.includes("competition") ||
    text.includes("route") ||
    text.includes("jersey") ||
    text.includes("announcement")
  ) {
    return false;
  }

  return (
    feed.feed_type === "photo_walk" ||
    feed.feed_type === "food_visit" ||
    text.includes("featured") ||
    text.includes("walk") ||
    text.includes("visit")
  );
}

export function toDateTimeInputValue(
  value?: string | null
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}
