/** Formats an ISO date (YYYY-MM-DD) like "Mon, 24 Nov 2026". */
export function formatDate(iso: string, options?: Intl.DateTimeFormatOptions) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

/** Today's date in India as YYYY-MM-DD. */
export function todayInIndia() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}
