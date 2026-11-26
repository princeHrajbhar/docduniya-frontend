/** Display helpers. Everything is shown in India Standard Time, like the backend's schedules. */

const IST = "Asia/Kolkata";

/** Amounts come from the API in minor units (paise). */
export function money(minor: number | undefined | null, currency = "INR") {
  if (minor === undefined || minor === null) return "—";
  if (minor === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100);
}

export function dateLabel(value: string | Date | undefined, options: Intl.DateTimeFormatOptions = {}) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    timeZone: IST,
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function timeLabel(value: string | Date | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-IN", {
    timeZone: IST,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function dateTimeLabel(value: string | Date | undefined) {
  if (!value) return "—";
  return `${dateLabel(value, { weekday: "short" })}, ${timeLabel(value)}`;
}

/** YYYY-MM-DD in India for a date (today by default). */
export function isoDateInIndia(date = new Date()) {
  return date.toLocaleDateString("en-CA", { timeZone: IST });
}

/** The next `count` calendar days in India, starting today. */
export function upcomingDays(count: number, from = new Date()) {
  const start = new Date(`${isoDateInIndia(from)}T00:00:00+05:30`);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start.getTime() + i * 86_400_000);
    return {
      iso: isoDateInIndia(d),
      weekday: d.toLocaleDateString("en-IN", { timeZone: IST, weekday: "short" }),
      day: d.toLocaleDateString("en-IN", { timeZone: IST, day: "numeric" }),
      month: d.toLocaleDateString("en-IN", { timeZone: IST, month: "short" }),
    };
  });
}

export function relativeTime(value: string | Date | undefined, now = Date.now()) {
  if (!value) return "";
  const diff = new Date(value).getTime() - now;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en-IN", { numeric: "auto" });
  if (abs < 60_000) return "just now";
  if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), "minute");
  if (abs < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), "hour");
  if (abs < 30 * 86_400_000) return rtf.format(Math.round(diff / 86_400_000), "day");
  return dateLabel(value);
}

/** "Dr. Ananya Sharma" -> "AS" */
export function initials(name: string | undefined) {
  if (!name) return "?";
  const parts = name
    .replace(/^(dr|mr|mrs|ms)\.?\s+/i, "")
    .split(/[\s@._-]+/)
    .filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? "?").slice(0, 2)).toUpperCase();
}

/** "IN_PERSON" -> "In person" */
export function humanize(value: string | undefined) {
  if (!value) return "";
  const text = value.replace(/[_-]+/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const modeLabel = (mode: string) =>
  ({ IN_PERSON: "In-clinic visit", VIDEO: "Video consultation", AUDIO: "Audio consultation" })[mode] ??
  humanize(mode);

export const paymentLabel = (policy: string) =>
  ({ PREPAY: "Pay online now", PAY_AT_PROVIDER: "Pay at the clinic", FREE: "No charge" })[policy] ??
  humanize(policy);

/** A deterministic soft avatar colour for a name or id. */
const AVATARS = [
  "bg-brand-100 text-brand-800",
  "bg-accent-100 text-accent-800",
  "bg-amber-100 text-amber-800",
  "bg-sky-100 text-sky-800",
  "bg-violet-100 text-violet-800",
  "bg-teal-100 text-teal-800",
];
export function avatarTone(seed: string | undefined) {
  let hash = 0;
  for (const ch of seed ?? "") hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATARS[hash % AVATARS.length];
}

export function yearsSince(date: string | undefined) {
  if (!date) return undefined;
  const years = Math.floor((Date.now() - new Date(date).getTime()) / (365.25 * 86_400_000));
  return years >= 0 ? years : undefined;
}

/** "+919876543210" from a 10-digit Indian mobile number, or undefined. */
export function indianMobileToE164(raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "").replace(/^0(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : undefined;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Public doctor URLs read `/doctors/<slug>-<doctorId>`. */
export const doctorHref = (slug: string, doctorId: string) => `/doctors/${slug}-${doctorId}`;
export function doctorIdFromParam(param: string) {
  const match = /([a-f0-9]{24})$/i.exec(param);
  return match?.[1].toLowerCase();
}

/** Decimal128 values serialise as `{ $numberDecimal: "1.5" }`. */
export function decimal(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "object" && "$numberDecimal" in (value as object))
    return String((value as { $numberDecimal: string }).$numberDecimal);
  return String(value);
}
