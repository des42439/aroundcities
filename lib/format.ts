export function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString(
    "en-MY",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

export function formatDateTime(
  value?: string | null
): string {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString(
    "en-MY",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export function formatTime(
  value?: string | null
): string {
  if (!value) {
    return "--";
  }

  const parts = value.split(":");

  if (parts.length < 2) {
    return value;
  }

  return `${parts[0]}:${parts[1]}`;
}

export function formatDateRange(
  start?: string | null,
  end?: string | null
): string {
  if (!start && !end) {
    return "-";
  }

  if (start && !end) {
    return formatDate(start);
  }

  if (!start && end) {
    return formatDate(end);
  }

  return `${formatDate(start)} - ${formatDate(end)}`;
}