import { FeedType, Photo } from "@/types/database";

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
  maxLength = 180
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
