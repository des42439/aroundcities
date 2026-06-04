"use client";

import { useState } from "react";
import AdminActionForm from "./AdminActionForm";
import {
  Field,
  inputClassName,
  selectClassName,
} from "./AdminForm";
import {
  AdminFormProgress,
  AdminSubmitButton,
} from "./AdminSubmitButton";
import { replaceFeedOperatingHoursAction } from "@/lib/admin-actions";
import {
  FeedOperatingHour,
  FeedOperatingHourScheduleType,
} from "@/types/database";

type RowState = {
  id: string;
  schedule_type: FeedOperatingHourScheduleType;
  days_of_week: number[];
  date_start: string;
  date_end: string;
  time_start: string;
  time_end: string;
  closed: boolean;
  note: string;
};

type Props = {
  feedId: string;
  rows: FeedOperatingHour[];
};

const dayOptions = [
  {
    value: 1,
    label: "Mon",
  },
  {
    value: 2,
    label: "Tue",
  },
  {
    value: 3,
    label: "Wed",
  },
  {
    value: 4,
    label: "Thu",
  },
  {
    value: 5,
    label: "Fri",
  },
  {
    value: 6,
    label: "Sat",
  },
  {
    value: 0,
    label: "Sun",
  },
];

function createEmptyRow(): RowState {
  return {
    id: crypto.randomUUID(),
    schedule_type: "weekly",
    days_of_week: [],
    date_start: "",
    date_end: "",
    time_start: "",
    time_end: "",
    closed: false,
    note: "",
  };
}

function toInputTime(value: string | null) {
  return value?.slice(0, 5) ?? "";
}

function toRowState(row: FeedOperatingHour): RowState {
  return {
    id: row.operating_hour_id,
    schedule_type: row.schedule_type,
    days_of_week: row.days_of_week ?? [],
    date_start: row.date_start ?? "",
    date_end: row.date_end ?? "",
    time_start: toInputTime(row.time_start),
    time_end: toInputTime(row.time_end),
    closed: row.closed,
    note: row.note ?? "",
  };
}

export default function FeedOperatingHoursForm({
  feedId,
  rows,
}: Props) {
  const [scheduleRows, setScheduleRows] = useState<
    RowState[]
  >(() =>
    rows.length ? rows.map(toRowState) : [createEmptyRow()]
  );
  const action =
    replaceFeedOperatingHoursAction.bind(null, feedId);

  function updateRow(
    id: string,
    update: Partial<RowState>
  ) {
    setScheduleRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              ...update,
            }
          : row
      )
    );
  }

  function toggleDay(row: RowState, day: number) {
    const days = row.days_of_week.includes(day)
      ? row.days_of_week.filter((value) => value !== day)
      : [...row.days_of_week, day];

    updateRow(row.id, {
      days_of_week: days.sort((a, b) => a - b),
    });
  }

  function removeRow(id: string) {
    setScheduleRows((current) =>
      current.length === 1
        ? [createEmptyRow()]
        : current.filter((row) => row.id !== id)
    );
  }

  return (
    <section className="space-y-4 rounded-lg border border-neutral-900 p-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-100">
          Structured operating hours
        </h2>
        <p className="mt-2 text-sm leading-6 text-neutral-500">
          Use this for future open-now queries. Keep the free-text
          schedule note above for public wording.
        </p>
      </div>

      <AdminActionForm action={action} className="space-y-5">
        <AdminFormProgress />

        <input
          type="hidden"
          name="operating_hour_row_count"
          value={scheduleRows.length}
        />

        <div className="space-y-4">
          {scheduleRows.map((row, index) => (
            <div
              key={row.id}
              className="space-y-4 rounded-lg border border-neutral-900 bg-neutral-950 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-neutral-300">
                  Schedule row {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="rounded-md border border-neutral-800 px-3 py-2 text-sm text-neutral-400 hover:border-neutral-600"
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Schedule type">
                  <select
                    name={`operating_hour_${index}_schedule_type`}
                    value={row.schedule_type}
                    onChange={(event) =>
                      updateRow(row.id, {
                        schedule_type: event.target
                          .value as FeedOperatingHourScheduleType,
                      })
                    }
                    className={selectClassName}
                  >
                    <option value="weekly">
                      Weekly recurring
                    </option>
                    <option value="date_range">
                      Date range
                    </option>
                  </select>
                </Field>

                <label className="flex items-end gap-3 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    name={`operating_hour_${index}_closed`}
                    checked={row.closed}
                    onChange={(event) =>
                      updateRow(row.id, {
                        closed: event.target.checked,
                      })
                    }
                    className="mb-3 h-4 w-4"
                  />
                  <span className="mb-2">Closed</span>
                </label>
              </div>

              {row.schedule_type === "weekly" ? (
                <div>
                  <p className="mb-2 text-sm text-neutral-400">
                    Days
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dayOptions.map((day) => (
                      <label
                        key={day.value}
                        className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                          row.days_of_week.includes(day.value)
                            ? "border-neutral-500 bg-neutral-900 text-neutral-100"
                            : "border-neutral-900 text-neutral-400 hover:border-neutral-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name={`operating_hour_${index}_days_of_week`}
                          value={day.value}
                          checked={row.days_of_week.includes(
                            day.value
                          )}
                          onChange={() =>
                            toggleDay(row, day.value)
                          }
                          className="h-4 w-4"
                        />
                        {day.label}
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Start date">
                    <input
                      name={`operating_hour_${index}_date_start`}
                      type="date"
                      value={row.date_start}
                      onChange={(event) =>
                        updateRow(row.id, {
                          date_start: event.target.value,
                        })
                      }
                      className={inputClassName}
                    />
                  </Field>

                  <Field label="End date">
                    <input
                      name={`operating_hour_${index}_date_end`}
                      type="date"
                      value={row.date_end}
                      onChange={(event) =>
                        updateRow(row.id, {
                          date_end: event.target.value,
                        })
                      }
                      className={inputClassName}
                    />
                  </Field>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Start time">
                  <input
                    name={`operating_hour_${index}_time_start`}
                    type="time"
                    value={row.time_start}
                    disabled={row.closed}
                    onChange={(event) =>
                      updateRow(row.id, {
                        time_start: event.target.value,
                      })
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="End time">
                  <input
                    name={`operating_hour_${index}_time_end`}
                    type="time"
                    value={row.time_end}
                    disabled={row.closed}
                    onChange={(event) =>
                      updateRow(row.id, {
                        time_end: event.target.value,
                      })
                    }
                    className={inputClassName}
                  />
                </Field>
              </div>

              <Field label="Note">
                <input
                  name={`operating_hour_${index}_note`}
                  value={row.note}
                  onChange={(event) =>
                    updateRow(row.id, {
                      note: event.target.value,
                    })
                  }
                  placeholder="Lunch break, last order, appointment only..."
                  className={inputClassName}
                />
              </Field>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              setScheduleRows((current) => [
                ...current,
                createEmptyRow(),
              ])
            }
            className="rounded-md border border-neutral-800 px-4 py-2 text-neutral-300 hover:border-neutral-600"
          >
            Add schedule row
          </button>

          <AdminSubmitButton
            variant="secondary"
            pendingLabel="Saving hours..."
          >
            Save operating hours
          </AdminSubmitButton>
        </div>
      </AdminActionForm>
    </section>
  );
}
