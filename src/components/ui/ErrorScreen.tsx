"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangleIcon } from "./icons";
import { buttonClass } from "./primitives";

/** Shared fallback for error.tsx boundaries. */
export function ErrorScreen({ error, retry, homeHref = "/" }: { error: unknown; retry: () => void; homeHref?: string }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
        <AlertTriangleIcon className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-xl font-bold text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-500">
        We couldn&apos;t load this page. It may be a brief connection problem. Your data is safe.
      </p>
      <div className="mt-6 flex gap-2">
        <button type="button" onClick={retry} className={buttonClass("primary")}>
          Try again
        </button>
        <Link href={homeHref} className={buttonClass("secondary")}>
          Go home
        </Link>
      </div>
    </div>
  );
}
