"use server";

import { api } from "@/lib/api/server";
import { fail, run } from "@/lib/actions";
import type { DocumentCategory, UploadIntent } from "@/lib/api/types";
import { getSession } from "@/lib/session";

const TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

/** Step 1 of an upload: the backend returns a short-lived URL the browser PUTs the file to. */
export async function createUploadIntent(input: { title: string; category: DocumentCategory; name: string; type: string; size: number }) {
  const session = await getSession();
  if (!session?.patientId) return fail("Sign in as a patient to upload documents.");
  if (!TYPES.includes(input.type)) return fail("Upload a PDF, PNG, JPEG or WebP file.");
  if (!input.title.trim()) return fail("Give the document a title.");
  return run(() =>
    api<UploadIntent>("/documents/upload-intents", {
      method: "POST",
      body: {
        custody: { kind: "PATIENT", patientId: session.patientId },
        category: input.category,
        title: input.title.trim().slice(0, 200),
        originalName: input.name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").slice(0, 200),
        mimeType: input.type,
        sizeBytes: input.size,
      },
    }),
  );
}

/** Step 2: tell the backend the bytes are in place; it verifies and scans them. */
export async function completeUpload(documentId: string, expectedVersion: number) {
  return run(() => api(`/documents/${documentId}/complete-upload`, { method: "POST", body: { expectedVersion } }));
}

/** A 60-second download link, issued after the backend audits the access. */
export async function openDocument(documentId: string) {
  return run(() => api<{ url: string }>(`/documents/${documentId}/access`, { method: "POST", body: { purpose: "PATIENT_ACCESS" } }));
}
