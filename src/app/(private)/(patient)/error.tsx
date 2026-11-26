"use client";

import { ErrorScreen } from "@/components/ui/ErrorScreen";

/** Sits inside the role layout, so the sidebar and top bar stay usable when a page fails. */
export default function AreaError({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorScreen error={error} retry={retry} homeHref="/patient/dashboard" />;
}
