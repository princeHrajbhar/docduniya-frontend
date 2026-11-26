"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Field, inputCls } from "@/components/forms/fields";
import { Dialog } from "@/components/ui/interactive";
import { DownloadIcon, FileTextIcon, UploadIcon } from "@/components/ui/icons";
import { Alert, Badge, Button, EmptyState, Spinner, buttonClass, type Tone } from "@/components/ui/primitives";
import type { DocumentCategory, PatientDocument } from "@/lib/api/types";
import { dateLabel, humanize } from "@/lib/format";
import { completeUpload, createUploadIntent, openDocument } from "./actions";

const CATEGORIES: Array<{ value: DocumentCategory; label: string }> = [
  { value: "CLINICAL_REPORT", label: "Lab or clinical report" },
  { value: "PRESCRIPTION", label: "Prescription" },
  { value: "IDENTITY", label: "ID document" },
  { value: "OTHER", label: "Other" },
];

const STATUS: Record<string, { label: string; tone: Tone }> = {
  AVAILABLE: { label: "Available", tone: "success" },
  PENDING_UPLOAD: { label: "Uploading", tone: "neutral" },
  QUARANTINED: { label: "Security scan", tone: "info" },
  REJECTED: { label: "Rejected", tone: "danger" },
};

export function DocumentsPanel({ documents, maxMb = 20 }: { documents: PatientDocument[]; maxMb?: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File>();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("CLINICAL_REPORT");
  const [error, setError] = useState<string>();
  const [step, setStep] = useState<string>();
  const [pending, start] = useTransition();
  const [opening, setOpening] = useState<string>();
  const [viewError, setViewError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(undefined);
    setTitle("");
    setError(undefined);
    setStep(undefined);
  };

  const upload = () =>
    start(async () => {
      if (!file) return;
      if (file.size > maxMb * 1024 * 1024) {
        setError(`Files can be up to ${maxMb} MB.`);
        return;
      }
      setError(undefined);
      setStep("Preparing upload…");
      const intent = await createUploadIntent({ title, category, name: file.name, type: file.type, size: file.size });
      if (!intent.ok) {
        setError(intent.error);
        setStep(undefined);
        return;
      }
      setStep("Uploading securely…");
      try {
        const res = await fetch(intent.data.upload.url, { method: "PUT", headers: intent.data.upload.headers, body: file });
        if (!res.ok) throw new Error(String(res.status));
      } catch {
        setError("The upload didn't complete. Check your connection and try again.");
        setStep(undefined);
        return;
      }
      setStep("Finishing…");
      const done = await completeUpload(intent.data.id, intent.data.version);
      if (!done.ok) {
        setError(done.error);
        setStep(undefined);
        return;
      }
      setOpen(false);
      reset();
      router.refresh();
    });

  const view = async (id: string) => {
    setOpening(id);
    setViewError(undefined);
    const result = await openDocument(id);
    setOpening(undefined);
    if (result.ok) window.open(result.data.url, "_blank", "noopener");
    else setViewError(result.error);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Your uploads and documents your clinics have shared with you. Files are scanned for safety before they open.</p>
        <Button onClick={() => setOpen(true)}>
          <UploadIcon className="h-4 w-4" /> Upload document
        </Button>
      </div>
      {viewError && <Alert tone="danger">{viewError}</Alert>}
      {documents.length === 0 ? (
        <EmptyState icon={<FileTextIcon className="h-6 w-6" />} title="No documents yet">
          Upload old reports or prescriptions so your doctors can see your history.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white">
          {documents.map((d) => {
            const s = STATUS[d.status] ?? { label: humanize(d.status), tone: "neutral" as Tone };
            return (
              <li key={d.id} className="flex items-center gap-4 px-5 py-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
                  <FileTextIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{d.title}</p>
                  <p className="text-xs text-slate-500">
                    {humanize(d.category)} · {d.custody === "PATIENT" ? "Uploaded by you" : "Shared by your clinic"} · {dateLabel(d.createdAt)}
                  </p>
                  {d.status === "REJECTED" && d.rejectionReason && <p className="mt-0.5 text-xs text-rose-600">{humanize(d.rejectionReason)}</p>}
                </div>
                <Badge tone={s.tone}>{s.label}</Badge>
                {d.status === "AVAILABLE" && (
                  <button type="button" onClick={() => view(d.id)} disabled={opening === d.id} className={buttonClass("secondary", "sm")}>
                    {opening === d.id ? <Spinner className="h-3.5 w-3.5" /> : <DownloadIcon className="h-3.5 w-3.5" />}
                    Open
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={open} onClose={() => !pending && (setOpen(false), reset())} title="Upload a document" description={`PDF or image, up to ${maxMb} MB. Only you and clinics you share with can see it.`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            upload();
          }}
          className="space-y-4"
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center rounded-xl border-2 border-dashed border-slate-300 px-4 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50/40"
          >
            <UploadIcon className="h-6 w-6 text-slate-400" />
            <span className="mt-2 text-sm font-medium text-slate-700">{file ? file.name : "Choose a file"}</span>
            <span className="text-xs text-slate-500">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "PDF, PNG, JPEG or WebP"}</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setFile(f);
              if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ""));
            }}
          />
          <Field id="doc-title" label="Title">
            <input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="E.g. Blood test, March 2026" className={inputCls} required />
          </Field>
          <Field id="doc-category" label="Type">
            <select id="doc-category" value={category} onChange={(e) => setCategory(e.target.value as DocumentCategory)} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          {error && <Alert tone="danger">{error}</Alert>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <button type="submit" disabled={!file || !title.trim() || pending} className={buttonClass("primary")}>
              {pending && <Spinner />}
              {step ?? "Upload"}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
