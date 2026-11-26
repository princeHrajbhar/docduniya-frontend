"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { inputCls } from "@/components/forms/fields";
import { Alert, Button, Spinner, buttonClass, cx } from "./primitives";

type Result = { ok: true; message?: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Submit button that shows progress while its form's action runs. */
export function SubmitButton({
  children,
  pendingLabel,
  variant,
  size,
  className,
  disabled,
}: {
  children: ReactNode;
  pendingLabel?: ReactNode;
  variant?: Parameters<typeof buttonClass>[0];
  size?: Parameters<typeof buttonClass>[1];
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} aria-busy={pending} className={buttonClass(variant, size, className)}>
      {pending && <Spinner />}
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}

/** Accessible modal built on the native <dialog> element. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={cx(
        "m-auto w-[calc(100%-2rem)] rounded-2xl p-0 shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-[2px]",
        { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }[size],
      )}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-1 grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {open && <div className="mt-5">{children}</div>}
      </div>
    </dialog>
  );
}

/**
 * A button that runs a server action, optionally after a confirmation dialog that can
 * collect a reason (the backend requires one for cancellations, decisions and similar).
 */
export function ActionButton({
  action,
  children,
  variant = "secondary",
  size = "sm",
  confirm,
  className,
}: {
  action: (reason?: string) => Promise<Result>;
  children: ReactNode;
  variant?: Parameters<typeof buttonClass>[0];
  size?: Parameters<typeof buttonClass>[1];
  className?: string;
  confirm?: {
    title: ReactNode;
    description?: ReactNode;
    confirmLabel: string;
    tone?: "danger" | "primary";
    reason?: { label: string; placeholder?: string; minLength?: number; required?: boolean };
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  const minLength = confirm?.reason?.minLength ?? 0;

  const execute = () =>
    start(async () => {
      setError(undefined);
      const result = await action(confirm?.reason ? reason.trim() : undefined);
      if (result.ok) {
        setOpen(false);
        setReason("");
        router.refresh();
      } else {
        setError(result.error);
      }
    });

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => (confirm ? setOpen(true) : execute())}
        className={buttonClass(variant, size, className)}
      >
        {pending && !confirm && <Spinner />}
        {children}
      </button>
      {!confirm && error && (
        <span role="alert" className="text-xs text-rose-600">
          {error}
        </span>
      )}
      {confirm && (
        <Dialog open={open} onClose={() => setOpen(false)} title={confirm.title} description={confirm.description} size="sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              execute();
            }}
            className="space-y-4"
          >
            {confirm.reason && (
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="action-reason">
                  {confirm.reason.label}
                </label>
                <textarea
                  id="action-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={confirm.reason.placeholder}
                  className={cx(inputCls, "resize-none")}
                  required={confirm.reason.required ?? true}
                  minLength={minLength}
                />
                {minLength > 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    At least {minLength} characters{reason.trim().length > 0 && ` · ${reason.trim().length} typed`}
                  </p>
                )}
              </div>
            )}
            {error && <Alert tone="danger">{error}</Alert>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Keep it
              </Button>
              <button
                type="submit"
                disabled={pending || (Boolean(confirm.reason) && reason.trim().length < minLength)}
                className={buttonClass(confirm.tone === "danger" ? "danger" : "primary")}
              >
                {pending && <Spinner />}
                {confirm.confirmLabel}
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  );
}

