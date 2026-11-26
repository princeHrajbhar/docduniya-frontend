import { Suspense } from "react";
import { PillIcon } from "@/components/ui/icons";
import { Badge, Card, EmptyState, ListSkeleton, LoadError, PageHeader, type Tone } from "@/components/ui/primitives";
import { friendlyMessage } from "@/lib/api/errors";
import { api } from "@/lib/api/server";
import type { PatientRecords, Prescription, PrescriptionItem } from "@/lib/api/types";
import { dateLabel, decimal, humanize } from "@/lib/format";
import { patientContext } from "@/services/patient";

export const metadata = { title: "Prescriptions – DocDuniya" };

export default function PrescriptionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Prescriptions" description="Every prescription your doctors have digitally signed, with dosage and refill details." />
      <Suspense fallback={<ListSkeleton />}>
        <Prescriptions />
      </Suspense>
    </div>
  );
}

async function Prescriptions() {
  const { patientId } = await patientContext();
  let list: Prescription[];
  try {
    list = (await api<PatientRecords>(`/patients/${patientId}/clinical-records`)).prescriptions;
  } catch (error) {
    return <LoadError message={friendlyMessage(error)} />;
  }
  if (list.length === 0) {
    return (
      <EmptyState icon={<PillIcon className="h-6 w-6" />} title="No prescriptions yet">
        When a doctor signs a prescription for you after a consultation, it appears here.
      </EmptyState>
    );
  }
  return (
    <div className="space-y-5">
      {list.map((p) => (
        <PrescriptionCard key={p.id} prescription={p} />
      ))}
    </div>
  );
}

const ITEM_STATUS: Record<string, Tone> = { ACTIVE: "success", COMPLETED: "neutral", STOPPED: "danger" };

function dose(item: PrescriptionItem) {
  return item.dosage
    .map((d) => {
      const amount = [decimal(d.doseValue), d.doseUnit].filter(Boolean).join(" ");
      const freq = d.asNeeded ? "when needed" : d.frequencyPerDay ? `${d.frequencyPerDay}× a day` : "";
      const when = d.timesOfDay?.length ? `(${d.timesOfDay.map(humanize).join(", ")})` : "";
      const length = d.durationDays ? `for ${d.durationDays} day${d.durationDays > 1 ? "s" : ""}` : "";
      return [amount, freq, when, length].filter(Boolean).join(" ") || d.instructions;
    })
    .join("; ");
}

function PrescriptionCard({ prescription: p }: { prescription: Prescription }) {
  const expired = p.validUntil && new Date(p.validUntil) < new Date();
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
        <div>
          <p className="flex items-center gap-2 font-semibold text-slate-900">
            <span className="font-serif text-lg text-brand-700 italic">℞</span>
            {p.number ?? "Prescription"}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            {p.prescriberSnapshot?.name ?? "Your doctor"}
            {p.prescriberSnapshot?.facilityName && ` · ${p.prescriberSnapshot.facilityName}`}
          </p>
          {p.prescriberSnapshot?.registrationNumber && (
            <p className="text-xs text-slate-400">
              Reg. {p.prescriberSnapshot.registrationNumber}
              {p.prescriberSnapshot.registrationAuthority && `, ${p.prescriberSnapshot.registrationAuthority}`}
            </p>
          )}
        </div>
        <div className="text-right text-sm">
          <p className="text-slate-500">Issued {dateLabel(p.issuedAt)}</p>
          {p.validUntil && <Badge tone={expired ? "neutral" : "success"}>{expired ? "Expired" : `Valid until ${dateLabel(p.validUntil)}`}</Badge>}
        </div>
      </div>
      <ul className="divide-y divide-slate-100">
        {p.items.map((item) => (
          <li key={item.id} className="flex gap-4 px-6 py-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <PillIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">
                  {item.medication.name}
                  {item.medication.strength && <span className="font-normal text-slate-500"> {item.medication.strength}</span>}
                </p>
                <Badge tone={ITEM_STATUS[item.status] ?? "neutral"}>{humanize(item.status)}</Badge>
              </div>
              <p className="mt-0.5 text-sm text-slate-700">{dose(item)}</p>
              <p className="mt-1 text-xs text-slate-500">
                {humanize(item.medication.form)} · {item.dosage[0]?.route && `${humanize(item.dosage[0].route)} · `}Qty {item.quantity.value} {item.quantity.unit}
                {item.refillsAllowed ? ` · ${item.refillsAllowed} refill${item.refillsAllowed > 1 ? "s" : ""}` : ""}
              </p>
              {item.instructions && <p className="mt-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">{item.instructions}</p>}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
