import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { avatarTone, initials } from "@/lib/format";

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

// ── Buttons ────────────────────────────────────────────────────────────────

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dark";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800",
  secondary: "border border-slate-200 bg-white text-slate-800 shadow-xs hover:bg-slate-50 hover:border-slate-300",
  ghost: "text-slate-700 hover:bg-slate-100",
  danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
  dark: "bg-slate-900 text-white shadow-sm hover:bg-slate-800",
};
const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 rounded-lg px-3 text-xs",
  md: "h-10 gap-2 rounded-xl px-4 text-sm",
  lg: "h-12 gap-2 rounded-xl px-6 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cx(
    "inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    extra,
  );
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={cx("animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ── Surfaces ───────────────────────────────────────────────────────────────

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("rounded-2xl border border-slate-200/80 bg-white shadow-xs", className)} {...props} />;
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6", className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-semibold tracking-wider text-brand-700 uppercase">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// ── Status ─────────────────────────────────────────────────────────────────

export type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info" | "accent";
const TONES: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  danger: "bg-rose-50 text-rose-700 ring-rose-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  accent: "bg-accent-50 text-accent-700 ring-accent-200",
};

export function Badge({ tone = "neutral", children, dot, className }: { tone?: Tone; children: ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", TONES[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

const ALERT: Record<"info" | "success" | "warning" | "danger", string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-rose-200 bg-rose-50 text-rose-900",
};

export function Alert({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: keyof typeof ALERT;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cx("flex flex-wrap items-start gap-3 rounded-xl border px-4 py-3 text-sm", ALERT[tone], className)}>
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cx(title ? "mt-0.5" : "", "opacity-90")}>{children}</div>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center", className)}>
      {icon && <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">{icon}</span>}
      <p className="mt-4 font-semibold text-slate-900">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-slate-500">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-lg bg-slate-200/70", className)} />;
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card className="divide-y divide-slate-100" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </Card>
  );
}

export function Avatar({ name, seed, size = "md", className }: { name?: string; seed?: string; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg", xl: "h-24 w-24 text-3xl rounded-3xl" };
  return (
    <span
      aria-hidden="true"
      className={cx("grid shrink-0 place-items-center rounded-full font-semibold", sizes[size], avatarTone(seed ?? name), className)}
    >
      {initials(name)}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  href,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">{icon}</span>}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </>
  );
  const cls = "block rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs";
  return href ? (
    <Link href={href} className={cx(cls, "transition hover:border-brand-200 hover:shadow-md")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** Label/value rows for detail panels. */
export function DescriptionList({ items, className }: { items: Array<[ReactNode, ReactNode]>; className?: string }) {
  return (
    <dl className={cx("divide-y divide-slate-100 text-sm", className)}>
      {items.map(([term, detail], i) => (
        <div key={i} className="grid grid-cols-3 gap-4 py-2.5">
          <dt className="text-slate-500">{term}</dt>
          <dd className="col-span-2 font-medium text-slate-900">{detail ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Link-based tabs: state lives in the URL, so it survives refreshes and can be shared. */
export function TabLinks({ tabs, active }: { tabs: Array<{ href: string; label: ReactNode; key: string; count?: number }>; active: string }) {
  return (
    <nav aria-label="Sections" className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? "page" : undefined}
          scroll={false}
          className={cx(
            "flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition",
            tab.key === active ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900",
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cx("rounded-full px-1.5 text-xs tabular-nums", tab.key === active ? "bg-brand-50 text-brand-700" : "bg-slate-200 text-slate-600")}>
              {tab.count}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

/** Shown when a backend call fails while rendering a section. */
export function LoadError({ message, title = "We couldn't load this section" }: { message: string; title?: string }) {
  return (
    <Alert tone="danger" title={title}>
      {message}
    </Alert>
  );
}
