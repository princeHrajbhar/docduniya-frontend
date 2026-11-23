"use client";

import { useState } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon } from "@/components/ui/icons";
import { initials } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { timeSlots } from "@/constants/appointments";
import { pastAppointments, upcomingAppointments } from "@/features/appointment/data";
import { StatusBadge } from "@/features/appointment/components/StatusBadge";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/** Calendar, time slots and the appointments list, sharing the selected date. */
export function BookingPanel({ today }: { today: string }) {
  const [ty, tm] = today.split("-").map(Number);
  const [view, setView] = useState({ year: ty, month: tm - 1 });
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <Calendar
        today={today}
        view={view}
        onViewChange={setView}
        selected={selectedDate}
        onSelect={(iso) => {
          setSelectedDate(iso);
          setSelectedSlot(null);
        }}
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-center text-lg font-semibold">Available Time Slots</h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          {formatDate(selectedDate, { weekday: "long", year: undefined })}
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {timeSlots.map((slot) => {
            const active = slot === selectedSlot;
            return (
              <button
                key={slot}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedSlot(active ? null : slot)}
                className={`rounded-lg border px-2 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>
      <YourAppointments selectedDate={selectedDate} selectedSlot={selectedSlot} />
    </section>
  );
}

function Calendar({
  today,
  view,
  onViewChange,
  selected,
  onSelect,
}: {
  today: string;
  view: { year: number; month: number };
  onViewChange: (v: { year: number; month: number }) => void;
  selected: string;
  onSelect: (iso: string) => void;
}) {
  const { year, month } = view;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  // Monday-first offset of the 1st of the month.
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const prevMonthDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-IN", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });

  const shift = (delta: number) => {
    const d = new Date(Date.UTC(year, month + delta, 1));
    onViewChange({ year: d.getUTCFullYear(), month: d.getUTCMonth() });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Previous month"
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <p className="font-medium text-slate-700">{monthLabel}</p>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Next month"
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-y-1 text-center text-sm">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-2 text-slate-500">
            {d}
          </span>
        ))}
        {Array.from({ length: totalCells }, (_, i) => {
          const day = i - offset + 1;
          if (day < 1 || day > daysInMonth) {
            const label = day < 1 ? prevMonthDays + day : day - daysInMonth;
            return (
              <span key={i} className="py-2 text-slate-300">
                {label}
              </span>
            );
          }
          const iso = toIso(year, month, day);
          const isPast = iso < today;
          const isSelected = iso === selected;
          const isToday = iso === today;
          return (
            <button
              key={i}
              type="button"
              disabled={isPast}
              onClick={() => onSelect(iso)}
              aria-pressed={isSelected}
              aria-label={formatDate(iso, { weekday: "long" })}
              className={`mx-auto grid h-9 w-9 place-items-center rounded-lg font-medium transition-colors ${
                isSelected
                  ? "bg-brand-700 text-white"
                  : isPast
                    ? "cursor-not-allowed text-slate-300"
                    : `text-slate-700 hover:bg-brand-50 ${isToday ? "ring-1 ring-brand-300" : ""}`
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YourAppointments({
  selectedDate,
  selectedSlot,
}: {
  selectedDate: string;
  selectedSlot: string | null;
}) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const list = tab === "upcoming" ? upcomingAppointments : pastAppointments;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-center text-lg font-semibold">Your Appointments</h2>
      <p className="text-center text-xs text-slate-500">
        Manage your upcoming and past appointments
      </p>
      <div role="tablist" className="mx-auto mt-4 flex rounded-lg border border-slate-200 p-1">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-md px-6 py-1.5 text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <ul className="mt-4 flex-1 divide-y divide-slate-100">
        {list.slice(0, 2).map((a) => (
          <li key={a.id} className="flex gap-3 py-3">
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${a.avatarColor}`}
            >
              {initials(a.doctor)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{a.doctor}</p>
                  <p className="text-xs text-slate-500">{a.speciality}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {formatDate(a.date, { weekday: undefined })}
                </span>
                <span className="flex items-center gap-1.5">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {a.start}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={!selectedSlot}
        className="mt-3 rounded-lg bg-brand-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-brand-300"
      >
        {selectedSlot
          ? `Book ${formatDate(selectedDate, { weekday: undefined, year: undefined })}, ${selectedSlot}`
          : "Pick a time slot to book"}
      </button>
    </div>
  );
}
