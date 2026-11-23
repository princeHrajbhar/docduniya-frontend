"use client";

import { useState } from "react";
import {
  BuildingIcon,
  CalendarIcon,
  VideoIcon,
  XCircleIcon,
} from "@/components/ui/icons";
import { initials } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import type { Appointment } from "@/types/appointment";
import { StatusBadge } from "./StatusBadge";

export function AppointmentCard({ appointment: a, today }: { appointment: Appointment; today: string }) {
  const [reminder, setReminder] = useState(true);
  const dateLabel = `${a.date === today ? "Today, " : ""}${formatDate(a.date, {
    weekday: a.date === today ? undefined : "short",
  })}`;

  return (
    <article
      className={`flex flex-col rounded-2xl border border-l-4 border-slate-200 bg-white p-5 shadow-sm ${a.accent}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`grid h-11 w-11 place-items-center rounded-full text-sm font-semibold ${a.avatarColor}`}
          >
            {initials(a.doctor)}
          </span>
          <div>
            <p className="font-semibold">{a.doctor}</p>
            <p className="text-sm text-slate-500">{a.speciality}</p>
          </div>
        </div>
        <StatusBadge status={a.status} />
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex gap-3">
          <IconChip>
            <CalendarIcon className="h-4 w-4" />
          </IconChip>
          <div>
            <p className="font-medium">{dateLabel}</p>
            <p className="text-xs text-slate-500">
              {a.start} – {a.end}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <IconChip>
            {a.mode === "video" ? (
              <VideoIcon className="h-4 w-4" />
            ) : (
              <BuildingIcon className="h-4 w-4" />
            )}
          </IconChip>
          <div>
            <p className="font-medium">
              {a.mode === "video" ? "Video Consultation" : "In-clinic Visit"}
            </p>
            {a.mode === "video" ? (
              <a href="#" className="text-xs text-brand-700 hover:underline">
                Join meeting (opens 10 mins before)
              </a>
            ) : (
              <p className="text-xs text-slate-500">{a.location}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-700">
        <button type="button" className="flex items-center gap-1.5 hover:text-brand-700">
          <CalendarIcon className="h-3.5 w-3.5" />
          Reschedule
        </button>
        <button type="button" className="flex items-center gap-1.5 hover:text-rose-600">
          <XCircleIcon className="h-3.5 w-3.5" />
          Cancel
        </button>
        <label className="flex cursor-pointer items-center gap-2">
          Reminder
          <input
            type="checkbox"
            role="switch"
            checked={reminder}
            onChange={(e) => setReminder(e.target.checked)}
            className="peer sr-only"
          />
          <span className="relative h-4 w-7 rounded-full bg-slate-300 transition-colors peer-checked:bg-brand-700 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-300 after:absolute after:top-0.5 after:left-0.5 after:h-3 after:w-3 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-3" />
        </label>
      </div>
    </article>
  );
}

function IconChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
      {children}
    </span>
  );
}
