import { Suspense } from "react";
import { StarIcon } from "@/components/ui/icons";
import { ActionButton } from "@/components/ui/interactive";
import { Card, EmptyState, ListSkeleton, LoadError, PageHeader } from "@/components/ui/primitives";
import { moderateReview } from "@/features/admin/actions";
import { NoAccess } from "@/features/admin/NoAccess";
import { friendlyMessage } from "@/lib/api/errors";
import { api } from "@/lib/api/server";
import type { ModerationReview, Page } from "@/lib/api/types";
import { relativeTime } from "@/lib/format";
import { adminContext } from "@/services/admin";

export const metadata = { title: "Patient reviews – DocDuniya admin" };

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Patient reviews" description="Publish genuine feedback. Hide or remove reviews that include personal data, abuse or clinical claims." />
      <Suspense fallback={<ListSkeleton rows={4} />}>
        <Queue />
      </Suspense>
    </div>
  );
}

async function Queue() {
  const { allowed } = await adminContext("reviews.moderate");
  if (!allowed) return <NoAccess permission="reviews.moderate" />;
  let page: Page<ModerationReview>;
  try {
    page = await api<Page<ModerationReview>>("/platform/reviews", { query: { limit: 50 } });
  } catch (error) {
    return <LoadError message={friendlyMessage(error)} />;
  }
  if (page.items.length === 0) {
    return (
      <EmptyState icon={<StarIcon className="h-6 w-6" />} title="Nothing to moderate">
        New patient reviews will appear here.
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {page.items.map((r) => (
        <Card key={r.id} className="flex flex-col p-5">
          <div className="flex items-center justify-between">
            <span className="flex" aria-label={`${r.rating} out of 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <StarIcon key={i} className={`h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
              ))}
            </span>
            <span className="text-xs text-slate-400">{relativeTime(r.createdAt)}</span>
          </div>
          <p className="mt-3 flex-1 text-sm text-slate-700">{r.text ?? <span className="text-slate-400 italic">Rating only, no text</span>}</p>
          <p className="mt-2 font-mono text-xs text-slate-400">Doctor {r.doctorId.slice(-6)}</p>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <ActionButton action={moderateReview.bind(null, r.id, r.version, "PUBLISHED", r.doctorId)} variant="primary" confirm={{ title: "Publish this review?", confirmLabel: "Publish", reason: { label: "Moderation note", minLength: 5, placeholder: "Meets guidelines" } }}>
              Publish
            </ActionButton>
            <ActionButton action={moderateReview.bind(null, r.id, r.version, "HIDDEN", r.doctorId)} confirm={{ title: "Hide this review?", confirmLabel: "Hide", reason: { label: "Why?", minLength: 5 } }}>
              Hide
            </ActionButton>
            <ActionButton action={moderateReview.bind(null, r.id, r.version, "REMOVED", r.doctorId)} variant="ghost" confirm={{ title: "Remove this review?", confirmLabel: "Remove", tone: "danger", reason: { label: "Why?", minLength: 5 } }}>
              Remove
            </ActionButton>
          </div>
        </Card>
      ))}
    </div>
  );
}
