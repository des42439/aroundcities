import {
  FeedEventDetails,
  FeedSchedule,
} from "@/types/database";

type LocalDateParts = {
  year: number;
  month: number;
  day: number;
};

const KUCHING_TIME_ZONE = "Asia/Kuching";
const DAY_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_EVENT_DURATION_MINUTES = 60;

export function getEventTimingLabel(
  schedules?: FeedSchedule[] | null,
  now = new Date()
): string | null {
  const nextSchedule = getNextSchedule(schedules, now);

  if (!nextSchedule?.schedule_date) {
    return null;
  }

  const today = getKuchingDateParts(now);
  const scheduleDate = parseDateParts(nextSchedule.schedule_date);

  if (!scheduleDate) {
    return null;
  }

  const diffDays = daysBetween(today, scheduleDate);

  if (diffDays < 0) {
    return null;
  }

  if (diffDays === 0 && isHappeningNow(nextSchedule, now)) {
    return "Happening Now";
  }

  if (diffDays === 0) {
    return "Happening Today";
  }

  if (diffDays === 1) {
    return "Happening Tomorrow";
  }

  if (isWeekend(scheduleDate)) {
    if (isThisWeekend(today, scheduleDate)) {
      return "Happening This Weekend";
    }

    if (isNextWeekend(today, scheduleDate)) {
      return "Happening Next Weekend";
    }
  }

  if (isNextMonth(today, scheduleDate)) {
    return "Happening Next Month";
  }

  return null;
}

export function getEventDetailLabels(
  details?: FeedEventDetails | null
): string[] {
  if (!details) {
    return [];
  }

  const labels: string[] = [];

  if (details.entry_type === "free") {
    labels.push("Free entry");
  } else if (details.entry_type === "paid") {
    labels.push("Paid entry");
  }

  if (details.registration_type === "free_registration") {
    labels.push("Free registration");
  } else if (details.registration_type === "registration_required") {
    labels.push("Registration required");
  } else if (details.registration_type === "walk_in") {
    labels.push("Walk-in welcome");
  }

  if (details.open_to_public === true) {
    labels.push("Open to public");
  } else if (details.open_to_public === false) {
    labels.push("Not public");
  }

  if (details.ticket_required === true) {
    labels.push("Ticket required");
  } else if (details.ticket_required === false) {
    labels.push("No ticket needed");
  }

  if (details.lucky_draw === true) {
    labels.push("Lucky draw available");
  }

  if (details.dress_code) {
    labels.push(`Dress code: ${details.dress_code}`);
  }

  if (details.organizer) {
    labels.push(`Organizer: ${details.organizer}`);
  }

  if (details.event_notes) {
    labels.push(details.event_notes);
  }

  return labels;
}

function getNextSchedule(
  schedules?: FeedSchedule[] | null,
  now = new Date()
): FeedSchedule | null {
  const today = getKuchingDateParts(now);

  return (
    (schedules ?? [])
      .filter((schedule) => schedule.schedule_date)
      .map((schedule) => ({
        schedule,
        dateParts: parseDateParts(schedule.schedule_date),
      }))
      .filter(
        (
          item
        ): item is {
          schedule: FeedSchedule;
          dateParts: LocalDateParts;
        } => item.dateParts !== null
      )
      .filter(
        ({ schedule, dateParts }) =>
          daysBetween(today, dateParts) >= 0 &&
          !isScheduleExpiredToday(schedule, dateParts, today, now)
      )
      .sort(
        (left, right) =>
          daysBetween(today, left.dateParts) -
            daysBetween(today, right.dateParts) ||
          timeToMinutes(left.schedule.start_time) -
            timeToMinutes(right.schedule.start_time)
      )[0]?.schedule ?? null
  );
}

function isHappeningNow(schedule: FeedSchedule, now: Date) {
  if (!schedule.start_time) {
    return false;
  }

  const startMinutes = timeToMinutes(schedule.start_time);
  const endMinutes = getScheduleEndMinutes(schedule, startMinutes);
  const nowMinutes = getKuchingMinutes(now);

  return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
}

export function isScheduledEventExpired(
  schedules?: FeedSchedule[] | null,
  now = new Date()
): boolean {
  const datedSchedules = (schedules ?? [])
    .map((schedule) => ({
      schedule,
      dateParts: parseDateParts(schedule.schedule_date),
    }))
    .filter(
      (
        item
      ): item is {
        schedule: FeedSchedule;
        dateParts: LocalDateParts;
      } => item.dateParts !== null
    );

  if (!datedSchedules.length) {
    return false;
  }

  const today = getKuchingDateParts(now);

  return datedSchedules.every(({ schedule, dateParts }) => {
    const diffDays = daysBetween(today, dateParts);

    if (diffDays < 0) {
      return true;
    }

    if (diffDays > 0) {
      return false;
    }

    return isScheduleExpiredToday(schedule, dateParts, today, now);
  });
}

export function hasTodaySchedule(
  schedules?: FeedSchedule[] | null,
  now = new Date()
): boolean {
  const today = getKuchingDateParts(now);

  return (schedules ?? []).some((schedule) => {
    const dateParts = parseDateParts(schedule.schedule_date);

    return (
      dateParts !== null &&
      daysBetween(today, dateParts) === 0 &&
      !isScheduleExpiredToday(schedule, dateParts, today, now)
    );
  });
}

export function getEarliestScheduleMinutes(
  schedules?: FeedSchedule[] | null,
  now = new Date()
): number {
  const today = getKuchingDateParts(now);
  const scheduleMinutes = (schedules ?? [])
    .map((schedule) => {
      const dateParts = parseDateParts(schedule.schedule_date);

      if (
        !dateParts ||
        daysBetween(today, dateParts) !== 0 ||
        isScheduleExpiredToday(schedule, dateParts, today, now)
      ) {
        return null;
      }

      return timeToMinutes(schedule.start_time);
    })
    .filter((value): value is number => value !== null);

  return Math.min(...scheduleMinutes, Number.MAX_SAFE_INTEGER);
}

function isScheduleExpiredToday(
  schedule: FeedSchedule,
  scheduleDate: LocalDateParts,
  today: LocalDateParts,
  now: Date
) {
  if (daysBetween(today, scheduleDate) !== 0) {
    return false;
  }

  if (!schedule.start_time) {
    return false;
  }

  const startMinutes = timeToMinutes(schedule.start_time);
  const endMinutes = getScheduleEndMinutes(schedule, startMinutes);

  return getKuchingMinutes(now) > endMinutes;
}

function getScheduleEndMinutes(
  schedule: FeedSchedule,
  startMinutes: number
) {
  if (schedule.end_time) {
    return timeToMinutes(schedule.end_time);
  }

  return Math.min(
    startMinutes + DEFAULT_EVENT_DURATION_MINUTES,
    24 * 60 - 1
  );
}

function getKuchingDateParts(date: Date): LocalDateParts {
  const parts = new Intl.DateTimeFormat("en-MY", {
    timeZone: KUCHING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

function getKuchingMinutes(date: Date) {
  const parts = new Intl.DateTimeFormat("en-MY", {
    timeZone: KUCHING_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);

  return hour * 60 + minute;
}

function parseDateParts(value: string | null): LocalDateParts | null {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function daysBetween(
  first: LocalDateParts,
  second: LocalDateParts
) {
  return Math.round(
    (Date.UTC(second.year, second.month - 1, second.day) -
      Date.UTC(first.year, first.month - 1, first.day)) /
      DAY_MS
  );
}

function timeToMinutes(value?: string | null) {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const [hour = "0", minute = "0"] = value.split(":");

  return Number(hour) * 60 + Number(minute);
}

function isWeekend(date: LocalDateParts) {
  const day = new Date(
    Date.UTC(date.year, date.month - 1, date.day)
  ).getUTCDay();

  return day === 0 || day === 6;
}

function isThisWeekend(
  today: LocalDateParts,
  scheduleDate: LocalDateParts
) {
  const todayDay = new Date(
    Date.UTC(today.year, today.month - 1, today.day)
  ).getUTCDay();
  const diffDays = daysBetween(today, scheduleDate);

  if (todayDay === 0) {
    return diffDays === 0;
  }

  const daysUntilSaturday = (6 - todayDay + 7) % 7;
  const daysUntilSunday = daysUntilSaturday + 1;

  return diffDays >= daysUntilSaturday && diffDays <= daysUntilSunday;
}

function isNextWeekend(
  today: LocalDateParts,
  scheduleDate: LocalDateParts
) {
  const todayDay = new Date(
    Date.UTC(today.year, today.month - 1, today.day)
  ).getUTCDay();
  const daysUntilSaturday = (6 - todayDay + 7) % 7;
  const nextSaturday =
    daysUntilSaturday === 0 ? 7 : daysUntilSaturday + 7;
  const nextSunday = nextSaturday + 1;
  const diffDays = daysBetween(today, scheduleDate);

  return diffDays >= nextSaturday && diffDays <= nextSunday;
}

function isNextMonth(
  today: LocalDateParts,
  scheduleDate: LocalDateParts
) {
  const nextMonth = today.month === 12 ? 1 : today.month + 1;
  const nextMonthYear =
    today.month === 12 ? today.year + 1 : today.year;

  return (
    scheduleDate.year === nextMonthYear &&
    scheduleDate.month === nextMonth
  );
}
