"use client";

import { useState, useTransition } from "react";
import { Alert, Button, Spinner } from "@/components/ui/primitives";
import type { Specialty } from "@/lib/api/types";
import { completeOnboarding } from "../actions";
import { AuthCard } from "./AuthCard";
import { ProfileFields, emptyProfile, type ProfileKind } from "./ProfileFields";

export function OnboardingForm({ kind, specialties, retry }: { kind: ProfileKind; specialties?: Specialty[]; retry?: boolean }) {
  const [values, setValues] = useState(() => emptyProfile(kind));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  return (
    <AuthCard
      wide
      title={kind === "patient" ? "Complete your profile" : "Set up your doctor profile"}
      subtitle={
        kind === "patient"
          ? "Clinics need these details to register you for appointments."
          : "This becomes your public profile once you're verified."
      }
    >
      {retry && (
        <Alert tone="warning" className="mb-6">
          Your account is ready, but we couldn&apos;t save your profile. Please check the details and try again.
        </Alert>
      )}
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const result = await completeOnboarding(kind, values);
            if (!result.ok) {
              setErrors(result.fieldErrors ?? {});
              setError(result.error);
            }
          });
        }}
        className="space-y-6"
      >
        <ProfileFields kind={kind} values={values} errors={errors} specialties={specialties} onChange={(k, v) => setValues((p) => ({ ...p, [k]: v }))} />
        {error && <Alert tone="danger">{error}</Alert>}
        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending && <Spinner />}
          {pending ? "Saving…" : "Save and continue"}
        </Button>
      </form>
    </AuthCard>
  );
}
