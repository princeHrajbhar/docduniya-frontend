"use client";

import { useState, useTransition } from "react";
import { StarIcon } from "@/components/ui/icons";
import { inputCls } from "@/components/forms/fields";
import { Alert, Spinner, buttonClass, cx } from "@/components/ui/primitives";
import { submitReview } from "./actions";

export function ReviewForm({ appointmentId }: { appointmentId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string }>();
  const [pending, start] = useTransition();

  if (result?.ok) return <Alert tone="success">{result.message}</Alert>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await submitReview(appointmentId, rating, text);
          setResult(r.ok ? { ok: true, message: r.message ?? "Thanks for your review." } : { ok: false, message: r.error });
        });
      }}
      className="space-y-4"
    >
      <div className="flex gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => setRating(n)}
            className="rounded p-0.5"
          >
            <StarIcon className={cx("h-8 w-8 transition", n <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
          </button>
        ))}
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000} placeholder="What went well? What could be better? (optional)" className={cx(inputCls, "resize-none")} />
      {result && !result.ok && <Alert tone="danger">{result.message}</Alert>}
      <button type="submit" disabled={!rating || pending} className={buttonClass("primary")}>
        {pending && <Spinner />}
        Submit review
      </button>
    </form>
  );
}
