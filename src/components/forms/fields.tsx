import type { ReactNode } from "react";

export const cities = [
  "Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune",
  "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Kochi", "Indore", "Patna",
  "Bhopal", "Nagpur", "Surat", "Guwahati", "Other",
];

export const inputCls =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 aria-[invalid=true]:border-red-400";

/** aria attributes linking an input to its error message */
export function fieldError(errors: Record<string, string | undefined>, key: string) {
  return errors[key] ? { "aria-invalid": true, "aria-describedby": `${key}-error` } : {};
}

export function Field({
  id,
  label,
  error,
  optional,
  className = "",
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label} {optional && <span className="font-normal text-slate-400">(optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
