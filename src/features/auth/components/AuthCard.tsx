import type { ReactNode } from "react";
import { cx } from "@/components/ui/primitives";

export function AuthCard({
  title,
  subtitle,
  icon,
  badge,
  children,
  wide,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  badge?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cx("w-full rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9", wide ? "max-w-2xl" : "max-w-md")}>
      {icon && <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">{icon}</span>}
      {badge && (
        <span className="mb-3 inline-block rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white uppercase">
          {badge}
        </span>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-7">{children}</div>
    </div>
  );
}
