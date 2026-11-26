"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { BellIcon } from "@/components/ui/icons";
import { cx } from "@/components/ui/primitives";
import type { AppNotification } from "@/lib/api/types";
import { relativeTime } from "@/lib/format";
import { markNotificationsRead } from "./actions";

export function NotificationsMenu({ items, failed }: { items: AppNotification[]; failed?: boolean }) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => !n.readAt && !readIds.has(n.id));

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markAll = () => {
    const ids = unread.map((n) => n.id);
    if (ids.length === 0) return;
    setReadIds((prev) => new Set([...prev, ...ids]));
    start(async () => {
      await markNotificationsRead(ids);
    });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={unread.length ? `Notifications, ${unread.length} unread` : "Notifications"}
        className="relative grid h-10 w-10 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <BellIcon className="h-5 w-5" />
        {unread.length > 0 && (
          <span className="absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            {unread.length > 0 && (
              <button type="button" onClick={markAll} className="text-xs font-semibold text-brand-700 hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          {failed ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">Notifications are unavailable right now.</p>
          ) : items.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">You&apos;re all caught up</p>
              <p className="mt-1 text-xs text-slate-500">Booking updates and new records will appear here.</p>
            </div>
          ) : (
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {items.map((n) => {
                const isUnread = !n.readAt && !readIds.has(n.id);
                return (
                  <li key={n.id} className={cx("flex gap-3 px-4 py-3", isUnread && "bg-brand-50/40")}>
                    <span className={cx("mt-1.5 h-2 w-2 shrink-0 rounded-full", isUnread ? "bg-brand-600" : "bg-transparent")} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{n.body}</p>
                      <p className="mt-1 text-xs text-slate-400">{relativeTime(n.sentAt)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
