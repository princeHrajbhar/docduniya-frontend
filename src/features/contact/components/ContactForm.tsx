"use client";

import { useActionState } from "react";
import { Field, fieldError, inputCls } from "@/components/forms/fields";
import { sendContactMessage, type ContactState } from "@/features/contact/actions";

const topics = [
  "Booking an appointment",
  "Payments & refunds",
  "Joining as a doctor",
  "Technical problem",
  "Feedback",
  "Something else",
];

export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    sendContactMessage,
    {},
  );

  if (state.ok) {
    return (
      <div role="status" className="rounded-2xl bg-brand-50 p-8 text-center">
        <p className="text-4xl">✅</p>
        <h2 className="mt-3 text-xl font-semibold">Thanks, we&apos;ve got your message</h2>
        <p className="mt-1 text-slate-600">Our team usually replies within one working day.</p>
      </div>
    );
  }

  const errors = state.errors ?? {};
  const v = state.values ?? {};

  return (
    <form action={formAction} noValidate className="grid gap-5 sm:grid-cols-2">
      <Field id="name" label="Full name" error={errors.name}>
        <input id="name" name="name" autoComplete="name" defaultValue={v.name} className={inputCls} {...fieldError(errors, "name")} />
      </Field>
      <Field id="email" label="Email" error={errors.email}>
        <input id="email" name="email" type="email" autoComplete="email" defaultValue={v.email} className={inputCls} {...fieldError(errors, "email")} />
      </Field>
      <Field id="phone" label="Mobile number" optional error={errors.phone}>
        <input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} className={inputCls} {...fieldError(errors, "phone")} />
      </Field>
      <Field id="topic" label="Topic" error={errors.topic}>
        <select id="topic" name="topic" defaultValue={v.topic ?? ""} className={inputCls} {...fieldError(errors, "topic")}>
          <option value="" disabled>
            Choose a topic
          </option>
          {topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field id="message" label="Message" error={errors.message} className="sm:col-span-2">
        <textarea id="message" name="message" rows={5} defaultValue={v.message} className={inputCls} {...fieldError(errors, "message")} />
      </Field>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
