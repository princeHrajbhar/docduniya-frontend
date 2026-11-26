import { Suspense, type ReactNode } from "react";
import { AlertTriangleIcon, ActivityIcon, ClipboardIcon, FileTextIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { Badge, Card, CardHeader, EmptyState, ListSkeleton, LoadError, PageHeader, TabLinks, cx, type Tone } from "@/components/ui/primitives";
import { DocumentsPanel } from "@/features/records/DocumentsPanel";
import { api, attempt } from "@/lib/api/server";
import type { DiagnosticReport, Page, PatientDocument, PatientRecords } from "@/lib/api/types";
import { dateLabel, dateTimeLabel, decimal, humanize, modeLabel } from "@/lib/format";
import { patientContext } from "@/services/patient";

export const metadata = { title: "Health records – DocDuniya" };

const TABS = [
  { key: "summary", label: "Summary" },
  { key: "visits", label: "Visits" },
  { key: "reports", label: "Lab reports" },
  { key: "documents", label: "Documents" },
] as const;
type Tab = (typeof TABS)[number]["key"];

export default function RecordsPage({ searchParams }: PageProps<"/patient/records">) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Health records"
        description="Signed records from every DocDuniya clinic you've visited. Only you, and clinics you choose to share with, can see them."
      />
      <Suspense fallback={<ListSkeleton rows={5} />}>
        <Records searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Records({ searchParams }: { searchParams: PageProps<"/patient/records">["searchParams"] }) {
  const { tab: raw } = await searchParams;
  const tab: Tab = TABS.some((t) => t.key === raw) ? (raw as Tab) : "summary";
  const { patientId } = await patientContext();

  const nav = <TabLinks active={tab} tabs={TABS.map((t) => ({ key: t.key, label: t.label, href: t.key === "summary" ? "/patient/records" : `/patient/records?tab=${t.key}` }))} />;

  let body;
  if (tab === "reports") {
    const reports = await attempt(api<DiagnosticReport[]>(`/patients/${patientId}/diagnostic-reports`));
    body = reports.ok ? <Reports reports={reports.data} /> : <LoadError message={reports.error} />;
  } else if (tab === "documents") {
    const docs = await attempt(api<Page<PatientDocument>>(`/patients/${patientId}/documents`, { query: { limit: 50 } }));
    body = docs.ok ? <DocumentsPanel documents={docs.data.items} /> : <LoadError message={docs.error} />;
  } else {
    const records = await attempt(api<PatientRecords>(`/patients/${patientId}/clinical-records`));
    body = !records.ok ? <LoadError message={records.error} /> : tab === "visits" ? <Visits records={records.data} /> : <Summary records={records.data} />;
  }

  return (
    <>
      {nav}
      <div className="mt-5">{body}</div>
    </>
  );
}

function Section({ title, icon, children, empty }: { title: string; icon: ReactNode; children: ReactNode[]; empty: string }) {
  return (
    <Card>
      <CardHeader title={<span className="flex items-center gap-2">{icon}{title}</span>} />
      {children.length === 0 ? <p className="px-6 py-6 text-sm text-slate-500">{empty}</p> : <ul className="divide-y divide-slate-100">{children}</ul>}
    </Card>
  );
}

const CRITICALITY: Record<string, Tone> = { HIGH: "danger", LOW: "warning", UNABLE_TO_ASSESS: "neutral" };

function Summary({ records: r }: { records: PatientRecords }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Allergies" icon={<AlertTriangleIcon className="h-4 w-4 text-rose-500" />} empty="No allergies have been recorded. Tell your doctor about any you know of.">
        {r.allergies.map((a) => (
          <li key={a.id} className="flex items-start justify-between gap-3 px-6 py-3.5">
            <div>
              <p className="text-sm font-semibold text-slate-900">{a.substance.text}</p>
              <p className="text-xs text-slate-500">
                {humanize(a.category)} · {humanize(a.clinicalStatus)}
                {a.reactions?.[0]?.manifestation?.text && ` · ${a.reactions[0].manifestation.text}`}
              </p>
            </div>
            <Badge tone={CRITICALITY[a.criticality] ?? "neutral"}>{humanize(a.criticality)} risk</Badge>
          </li>
        ))}
      </Section>
      <Section title="Conditions" icon={<ActivityIcon className="h-4 w-4 text-brand-600" />} empty="No ongoing conditions recorded.">
        {r.conditions.map((c) => (
          <li key={c.id} className="flex items-start justify-between gap-3 px-6 py-3.5">
            <div>
              <p className="text-sm font-semibold text-slate-900">{c.code.text}</p>
              <p className="text-xs text-slate-500">
                {humanize(c.clinicalStatus)}
                {c.onset && ` · since ${dateLabel(c.onset, { day: undefined })}`}
              </p>
            </div>
            {c.verificationStatus === "PROVISIONAL" && <Badge tone="info">Provisional</Badge>}
          </li>
        ))}
      </Section>
      <Section title="Immunizations" icon={<ShieldCheckIcon className="h-4 w-4 text-sky-600" />} empty="No vaccinations recorded.">
        {r.immunizations.map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-3 px-6 py-3.5">
            <div>
              <p className="text-sm font-semibold text-slate-900">{i.vaccine.text}</p>
              <p className="text-xs text-slate-500">{i.doseText ?? humanize(i.status)}</p>
            </div>
            <span className="text-xs text-slate-500">{dateLabel(i.occurrenceAt)}</span>
          </li>
        ))}
      </Section>
      <Section title="Consultation notes" icon={<FileTextIcon className="h-4 w-4 text-violet-600" />} empty="Notes your doctors release to you will appear here.">
        {r.notes.map((n) => (
          <li key={n.id} className="px-6 py-3.5">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{humanize(n.noteType)} note</span>
                  <span className="text-xs text-slate-500">{dateTimeLabel(n.signedAt)}</span>
                </span>
                <span className="text-xs font-semibold text-brand-700 group-open:hidden">Read</span>
              </summary>
              <div className="mt-3 space-y-3 text-sm text-slate-700">
                {(["assessment", "plan", "history", "examination"] as const).map((k) =>
                  n.sections[k] ? (
                    <div key={k}>
                      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{k}</p>
                      <p className="mt-0.5 whitespace-pre-line">{n.sections[k]}</p>
                    </div>
                  ) : null,
                )}
              </div>
            </details>
          </li>
        ))}
      </Section>
    </div>
  );
}

function Visits({ records }: { records: PatientRecords }) {
  if (records.visits.length === 0) {
    return (
      <EmptyState icon={<ClipboardIcon className="h-6 w-6" />} title="No visits yet">
        Consultations appear here once your doctor opens them.
      </EmptyState>
    );
  }
  return (
    <ol className="relative space-y-4 border-l-2 border-slate-200 pl-6">
      {records.visits.map((v) => (
        <li key={v.id} className="relative">
          <span className={cx("absolute top-4 -left-[31px] h-3 w-3 rounded-full ring-4 ring-slate-50", v.status === "FINISHED" ? "bg-brand-500" : "bg-amber-400")} />
          <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-900">{v.type ?? "Consultation"}</p>
              <Badge tone={v.status === "FINISHED" ? "neutral" : "warning"}>{v.status === "FINISHED" ? "Completed" : "In progress"}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {v.provider ?? "Clinic"} · {v.mode ? modeLabel(v.mode) : "Visit"} · {dateTimeLabel(v.startedAt)}
            </p>
          </Card>
        </li>
      ))}
    </ol>
  );
}

const INTERPRETATION: Record<string, { label: string; tone: Tone }> = {
  NORMAL: { label: "Normal", tone: "success" },
  LOW: { label: "Low", tone: "warning" },
  HIGH: { label: "High", tone: "warning" },
  CRITICAL_LOW: { label: "Critically low", tone: "danger" },
  CRITICAL_HIGH: { label: "Critically high", tone: "danger" },
  ABNORMAL: { label: "Abnormal", tone: "warning" },
};

function Reports({ reports }: { reports: DiagnosticReport[] }) {
  if (reports.length === 0) {
    return (
      <EmptyState icon={<FileTextIcon className="h-6 w-6" />} title="No lab reports yet">
        Results appear here once the laboratory verifies them.
      </EmptyState>
    );
  }
  return (
    <div className="space-y-5">
      {reports.map((r) => (
        <Card key={r.id}>
          <CardHeader
            title={r.code?.text ?? "Lab report"}
            description={`${r.reportNumber ? `${r.reportNumber} · ` : ""}Issued ${dateTimeLabel(r.issuedAt)}`}
            action={r.status === "AMENDED" ? <Badge tone="info">Amended</Badge> : r.critical ? <Badge tone="danger">Needs attention</Badge> : undefined}
          />
          {r.results.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-slate-500">
                  <tr>
                    <th className="px-6 py-2.5 font-medium">Test</th>
                    <th className="px-6 py-2.5 font-medium">Result</th>
                    <th className="px-6 py-2.5 font-medium">Reference</th>
                    <th className="px-6 py-2.5 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {r.results.map((o) => {
                    const value =
                      o.valueType === "QUANTITY"
                        ? `${decimal(o.valueQuantity?.value) ?? "—"} ${o.valueQuantity?.unit ?? ""}`
                        : o.valueType === "BOOLEAN"
                          ? o.valueBoolean ? "Positive" : "Negative"
                          : (o.valueText ?? o.valueCode?.text ?? "—");
                    const range = o.referenceRange;
                    const interp = o.interpretation ? INTERPRETATION[o.interpretation] : undefined;
                    return (
                      <tr key={o.id}>
                        <td className="px-6 py-3 font-medium text-slate-900">{o.code.text}</td>
                        <td className="px-6 py-3 tabular-nums">{value}</td>
                        <td className="px-6 py-3 text-slate-500 tabular-nums">
                          {range?.text ?? (range && (range.low !== undefined || range.high !== undefined) ? `${decimal(range.low) ?? ""}–${decimal(range.high) ?? ""} ${range.unit ?? ""}` : "—")}
                        </td>
                        <td className="px-6 py-3 text-right">{interp && <Badge tone={interp.tone}>{interp.label}</Badge>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {r.conclusion && <p className="border-t border-slate-100 px-6 py-4 text-sm text-slate-700"><span className="font-semibold">Conclusion: </span>{r.conclusion}</p>}
        </Card>
      ))}
    </div>
  );
}
