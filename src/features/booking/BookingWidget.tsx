"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { BuildingIcon, CalendarIcon, ClockIcon, VideoIcon } from "@/components/ui/icons";
import { Alert, Skeleton, Spinner, buttonClass, cx } from "@/components/ui/primitives";
import { inputCls } from "@/components/forms/fields";
import type { Availability, ConsultMode, PaymentPolicy } from "@/lib/api/types";
import { dateLabel, modeLabel, money, paymentLabel, timeLabel, upcomingDays } from "@/lib/format";
import { bookSlot, loadAvailability } from "./actions";

export type BookableOffering = {
  id: string;
  name: string;
  mode: ConsultMode;
  durationMinutes: number;
  paymentPolicy: PaymentPolicy;
  priceMinor?: number;
  facilityName: string;
};

type Viewer = "patient" | "other" | "guest";

const istHour = (iso: string) =>
  Number(new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }));

export function BookingWidget({ offerings, viewer, loginHref }: { offerings: BookableOffering[]; viewer: Viewer; loginHref: string }) {
  const days = useMemo(() => upcomingDays(14), []);
  const [offeringId, setOfferingId] = useState(offerings[0]?.id);
  const [date, setDate] = useState(days[0].iso);
  // Availability per offering+day. A revisited day shows its last result while it refreshes.
  const [results, setResults] = useState<Record<string, { data?: Availability; error?: string }>>({});
  const [startAt, setStartAt] = useState<string>();
  const [reason, setReason] = useState("");
  const [bookingError, setBookingError] = useState<string>();
  const [pending, start] = useTransition();

  const offering = offerings.find((o) => o.id === offeringId);
  const key = `${offeringId}|${date}`;
  const current = results[key];
  const slots = { loading: !current, data: current?.data, error: current?.error };

  useEffect(() => {
    if (!offeringId) return;
    let live = true;
    loadAvailability(offeringId, date).then((result) => {
      if (live) setResults((prev) => ({ ...prev, [`${offeringId}|${date}`]: result.ok ? { data: result.data } : { error: result.error } }));
    });
    return () => {
      live = false;
    };
  }, [offeringId, date]);

  const chooseOffering = (id: string) => {
    setOfferingId(id);
    setStartAt(undefined);
  };
  const chooseDate = (iso: string) => {
    setDate(iso);
    setStartAt(undefined);
  };

  if (!offering) {
    return <p className="text-sm text-slate-500">Online booking isn&apos;t available for this doctor yet. Contact the clinic to book.</p>;
  }

  const free = slots.data?.slots.filter((s) => s.available) ?? [];
  const groups = [
    { label: "Morning", items: free.filter((s) => istHour(s.startAt) < 12) },
    { label: "Afternoon", items: free.filter((s) => istHour(s.startAt) >= 12 && istHour(s.startAt) < 17) },
    { label: "Evening", items: free.filter((s) => istHour(s.startAt) >= 17) },
  ].filter((g) => g.items.length > 0);

  const book = () =>
    start(async () => {
      if (!startAt || !slots.data) return;
      setBookingError(undefined);
      const result = await bookSlot({
        offeringId: offering.id,
        offeringVersion: slots.data.offeringVersion,
        priceId: slots.data.price.id,
        startAt,
        paymentPolicy: offering.paymentPolicy,
        reasonForVisit: reason,
      });
      // Success redirects; we only get here on failure.
      if (!result.ok) {
        setBookingError(result.error);
        if (result.code === "SLOT_UNAVAILABLE" || result.code === "QUOTE_CHANGED") {
          const refreshed = await loadAvailability(offering.id, date);
          if (refreshed.ok) setResults((prev) => ({ ...prev, [key]: { data: refreshed.data } }));
          setStartAt(undefined);
        }
      }
    });

  const price = slots.data?.price.totalMinor ?? offering.priceMinor;

  return (
    <div className="space-y-6">
      {offerings.length > 1 && (
        <fieldset>
          <legend className="text-sm font-semibold text-slate-900">Consultation type</legend>
          <div className="mt-2 space-y-2">
            {offerings.map((o) => (
              <label
                key={o.id}
                className={cx(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
                  o.id === offeringId ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-100" : "border-slate-200 hover:border-slate-300",
                )}
              >
                <input type="radio" name="offering" checked={o.id === offeringId} onChange={() => chooseOffering(o.id)} className="mt-1 accent-brand-600" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-slate-900">{o.name}</span>
                    <span className="text-sm font-semibold text-slate-900">{money(o.priceMinor)}</span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    {o.mode === "IN_PERSON" ? <BuildingIcon className="h-3.5 w-3.5" /> : <VideoIcon className="h-3.5 w-3.5" />}
                    {modeLabel(o.mode)} · {o.durationMinutes} min · {o.facilityName}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <p className="text-sm font-semibold text-slate-900">Choose a day</p>
        <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label="Day">
          {days.map((d, i) => (
            <button
              key={d.iso}
              type="button"
              role="radio"
              aria-checked={d.iso === date}
              onClick={() => chooseDate(d.iso)}
              className={cx(
                "flex w-14 shrink-0 flex-col items-center rounded-xl border py-2 transition",
                d.iso === date ? "border-brand-600 bg-brand-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-brand-300",
              )}
            >
              <span className={cx("text-[11px] font-medium uppercase", d.iso === date ? "text-brand-100" : "text-slate-400")}>{i === 0 ? "Today" : d.weekday}</span>
              <span className="text-lg leading-tight font-bold">{d.day}</span>
              <span className={cx("text-[11px]", d.iso === date ? "text-brand-100" : "text-slate-400")}>{d.month}</span>
            </button>
          ))}
        </div>
      </div>

      <div aria-live="polite">
        <p className="text-sm font-semibold text-slate-900">Available times</p>
        {slots.loading ? (
          <div className="mt-3 grid grid-cols-3 gap-2" aria-busy="true">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : slots.error ? (
          <Alert tone="danger" className="mt-3">
            {slots.error}
          </Alert>
        ) : groups.length === 0 ? (
          <p className="mt-3 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No free slots on {dateLabel(`${date}T12:00:00+05:30`, { weekday: "long", year: undefined })}. Try another day.
          </p>
        ) : (
          <div className="mt-3 space-y-4">
            {groups.map((g) => (
              <div key={g.label}>
                <p className="mb-2 text-xs font-medium text-slate-500">{g.label}</p>
                <div className="grid grid-cols-3 gap-2">
                  {g.items.map((s) => (
                    <button
                      key={s.startAt}
                      type="button"
                      aria-pressed={s.startAt === startAt}
                      onClick={() => setStartAt(s.startAt === startAt ? undefined : s.startAt)}
                      className={cx(
                        "rounded-lg border px-2 py-2 text-sm font-medium tabular-nums transition",
                        s.startAt === startAt ? "border-brand-700 bg-brand-700 text-white" : "border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50",
                      )}
                    >
                      {timeLabel(s.startAt)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {startAt && viewer === "patient" && (
        <div>
          <label htmlFor="reason" className="text-sm font-semibold text-slate-900">
            Reason for visit <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea id="reason" rows={2} maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="E.g. follow-up for blood pressure" className={cx(inputCls, "resize-none")} />
        </div>
      )}

      <div className="rounded-xl bg-slate-50 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Consultation fee</span>
          <span className="text-base font-bold text-slate-900">{money(price)}</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">{paymentLabel(offering.paymentPolicy)}</p>
        {startAt && (
          <p className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3 font-medium text-slate-800">
            <CalendarIcon className="h-4 w-4 text-brand-600" />
            {dateLabel(startAt, { weekday: "short", year: undefined })}
            <ClockIcon className="ml-2 h-4 w-4 text-brand-600" />
            {timeLabel(startAt)}
          </p>
        )}
      </div>

      {bookingError && <Alert tone="danger">{bookingError}</Alert>}

      {viewer === "guest" ? (
        <Link href={loginHref} className={buttonClass("primary", "lg", "w-full")}>
          Sign in to book
        </Link>
      ) : viewer === "other" ? (
        <Alert tone="info">You&apos;re signed in with a doctor or admin account. Use a patient account to book.</Alert>
      ) : (
        <button type="button" disabled={!startAt || pending} onClick={book} className={buttonClass("primary", "lg", "w-full")}>
          {pending && <Spinner />}
          {pending ? "Reserving your slot…" : !startAt ? "Select a time" : offering.paymentPolicy === "PREPAY" ? "Continue to payment" : "Confirm booking"}
        </button>
      )}
    </div>
  );
}
