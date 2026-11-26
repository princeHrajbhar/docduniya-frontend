"use client";

import { Field, fieldError, inputCls } from "@/components/forms/fields";
import { cx } from "@/components/ui/primitives";
import type { Specialty } from "@/lib/api/types";

export type ProfileKind = "patient" | "doctor";
export type Values = Record<string, string>;

const SEX_OPTIONS = [
  { value: "FEMALE", label: "Female" },
  { value: "MALE", label: "Male" },
  { value: "OTHER", label: "Other" },
  { value: "UNKNOWN", label: "Prefer not to say" },
];
export const LANGUAGES = ["English", "Hindi", "Bengali", "Marathi", "Tamil", "Telugu", "Kannada", "Malayalam", "Gujarati", "Punjabi", "Urdu"];

export const emptyProfile = (kind: ProfileKind): Values =>
  kind === "patient"
    ? { name: "", sex: "", birthDate: "", phone: "" }
    : { name: "", phone: "", specialtyId: "", careerStartYear: "", languages: "English", bio: "" };

export function ProfileFields({
  kind,
  values,
  errors,
  onChange,
  specialties = [],
}: {
  kind: ProfileKind;
  values: Values;
  errors: Record<string, string>;
  onChange: (key: string, value: string) => void;
  specialties?: Specialty[];
}) {
  const bind = (key: string) => ({
    id: key,
    name: key,
    value: values[key] ?? "",
    onChange: (e: { target: { value: string } }) => onChange(key, e.target.value),
    className: inputCls,
    ...fieldError(errors, key),
  });

  const phone = (
    <Field id="phone" label="Mobile number" error={errors.phone} optional hint="Used by clinics to reach you about bookings.">
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3.5 mt-0.75 -translate-y-1/2 text-sm text-slate-500">+91</span>
        <input {...bind("phone")} type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={11} placeholder="98765 43210" className={cx(inputCls, "pl-12")} />
      </div>
    </Field>
  );

  if (kind === "patient") {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Full name" error={errors.name} className="sm:col-span-2" hint="As it appears on your ID, so clinics can register you correctly.">
          <input {...bind("name")} autoComplete="name" placeholder="Rohit Verma" />
        </Field>
        <Field id="birthDate" label="Date of birth" error={errors.birthDate}>
          <input {...bind("birthDate")} type="date" autoComplete="bday" />
        </Field>
        {phone}
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium text-slate-700">Sex</legend>
          <div role="radiogroup" className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-describedby={errors.sex ? "sex-error" : undefined}>
            {SEX_OPTIONS.map((o) => (
              <label
                key={o.value}
                className={cx(
                  "flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                  values.sex === o.value ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-100" : "border-slate-300 text-slate-700 hover:border-slate-400",
                )}
              >
                <input type="radio" name="sex" value={o.value} checked={values.sex === o.value} onChange={() => onChange("sex", o.value)} className="sr-only" />
                {o.label}
              </label>
            ))}
          </div>
          {errors.sex && (
            <p id="sex-error" className="mt-1.5 text-sm text-rose-600">
              {errors.sex}
            </p>
          )}
        </fieldset>
      </div>
    );
  }

  const chosen = new Set((values.languages ?? "").split(",").filter(Boolean));
  const toggle = (lang: string) => {
    const next = new Set(chosen);
    if (next.has(lang)) next.delete(lang);
    else next.add(lang);
    onChange("languages", [...next].join(","));
  };

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field id="name" label="Full name" error={errors.name} className="sm:col-span-2" hint='We add "Dr." for you. Use the name on your council registration.'>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3.5 mt-0.75 -translate-y-1/2 text-sm text-slate-500">Dr.</span>
          <input {...bind("name")} autoComplete="name" placeholder="Ananya Sharma" className={cx(inputCls, "pl-11")} />
        </div>
      </Field>
      {specialties.length > 0 && (
        <Field id="specialtyId" label="Primary speciality" error={errors.specialtyId}>
          <select {...bind("specialtyId")}>
            <option value="">Select speciality</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field id="careerStartYear" label="Practising since" error={errors.careerStartYear} optional>
        <input {...bind("careerStartYear")} inputMode="numeric" maxLength={4} placeholder="2012" />
      </Field>
      {phone}
      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-medium text-slate-700">Languages you consult in</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              aria-pressed={chosen.has(lang)}
              onClick={() => toggle(lang)}
              className={cx(
                "rounded-full border px-3 py-1 text-sm font-medium transition",
                chosen.has(lang) ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 text-slate-700 hover:border-slate-400",
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </fieldset>
      <Field
        id="bio"
        label="About you"
        error={errors.bio}
        className="sm:col-span-2"
        hint={`${values.bio?.length ?? 0}/4000 · Patients read this on your public profile. Mention your focus areas and approach.`}
      >
        <textarea {...bind("bio")} rows={4} maxLength={4000} placeholder="I'm a consultant cardiologist with a focus on preventive care and heart failure…" className={cx(inputCls, "resize-y")} />
      </Field>
    </div>
  );
}
