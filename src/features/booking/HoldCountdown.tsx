"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Live countdown for a held slot; refreshes the page when the hold lapses. */
export function HoldCountdown({ expiresAt }: { expiresAt: string }) {
  const router = useRouter();
  const [left, setLeft] = useState(() => new Date(expiresAt).getTime() - Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      const ms = new Date(expiresAt).getTime() - Date.now();
      setLeft(ms);
      if (ms <= 0) {
        clearInterval(t);
        router.refresh();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [expiresAt, router]);

  if (left <= 0) return <span className="font-semibold">expired</span>;
  const m = Math.floor(left / 60_000);
  const s = Math.floor((left % 60_000) / 1000);
  return (
    <span className="font-mono font-semibold tabular-nums">
      {m}:{String(s).padStart(2, "0")}
    </span>
  );
}
