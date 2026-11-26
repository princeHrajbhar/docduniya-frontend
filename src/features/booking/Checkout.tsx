"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LockIcon } from "@/components/ui/icons";
import { Alert, Spinner, buttonClass } from "@/components/ui/primitives";
import { money } from "@/lib/format";
import { getAppointmentStatus, getPaymentIntent, startPayment, verifyPayment } from "./actions";

type RazorpayResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type RazorpayInstance = { open(): void; on(event: string, cb: (e: { error?: { description?: string } }) => void): void };
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const SCRIPT = process.env.NEXT_PUBLIC_RAZORPAY_CHECKOUT_URL ?? "https://checkout.razorpay.com/v1/checkout.js";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type Phase = "idle" | "preparing" | "paying" | "verifying" | "done";

/**
 * Online payment for a held, prepaid appointment:
 * create a payment intent → wait for the backend to create the Razorpay order →
 * open Razorpay Checkout → send the signed result back → wait for the booking to confirm.
 * The amount always comes from the backend; nothing here can change it.
 */
export function Checkout({
  appointmentId,
  amountMinor,
  currency,
  description,
  email,
  autoStart,
}: {
  appointmentId: string;
  amountMinor: number;
  currency: string;
  description: string;
  email?: string;
  autoStart?: boolean;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string>();

  const waitForConfirmation = async () => {
    setPhase("verifying");
    for (let i = 0; i < 15; i++) {
      const status = await getAppointmentStatus(appointmentId);
      if (status.ok && status.data.status === "CONFIRMED") break;
      await sleep(2000);
    }
    setPhase("done");
    router.replace(`/patient/appointments/${appointmentId}?paid=1`);
    router.refresh();
  };

  const pay = async () => {
    setError(undefined);
    setPhase("preparing");
    const created = await startPayment(appointmentId);
    if (!created.ok) {
      setPhase("idle");
      setError(created.error);
      return;
    }
    let intent = created.data;
    // The Razorpay order is created by a background worker; give it a moment.
    for (let i = 0; !intent.checkout && i < 20; i++) {
      if (intent.status === "CANCELLED" || intent.status === "RECONCILE") break;
      await sleep(1500);
      const latest = await getPaymentIntent(intent.id);
      if (latest.ok) intent = latest.data;
    }
    if (intent.status === "SUCCEEDED") return waitForConfirmation();
    if (!intent.checkout) {
      setPhase("idle");
      setError("Online payment isn't available for this clinic right now. Please try again shortly, or contact the clinic.");
      return;
    }
    if (!(await loadRazorpay()) || !window.Razorpay) {
      setPhase("idle");
      setError("We couldn't load the payment window. Check your connection or disable blockers and try again.");
      return;
    }

    setPhase("paying");
    const { checkout } = intent;
    const razorpay = new window.Razorpay({
      key: checkout.keyId,
      order_id: checkout.orderId,
      amount: intent.amountMinor,
      currency: intent.currency,
      name: "DocDuniya",
      description,
      prefill: email ? { email } : undefined,
      theme: { color: "#387358" },
      modal: { ondismiss: () => setPhase("idle") },
      handler: async (response: RazorpayResponse) => {
        setPhase("verifying");
        const verified = await verifyPayment(intent.id, {
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });
        if (!verified.ok) {
          // The webhook may still confirm it; keep checking rather than failing hard.
          setError("We're confirming your payment with the bank. This can take a minute.");
        }
        await waitForConfirmation();
      },
    });
    razorpay.on("payment.failed", (e) => {
      setError(e.error?.description ?? "The payment didn't go through. No money was taken; you can try again.");
    });
    razorpay.open();
  };

  useEffect(() => {
    // Arriving from the booking widget opens payment straight away (once, on mount).
    if (!autoStart) return;
    const t = setTimeout(() => void pay(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const busy = phase !== "idle";
  return (
    <div className="space-y-3">
      {error && <Alert tone="danger">{error}</Alert>}
      <button type="button" onClick={pay} disabled={busy} className={buttonClass("primary", "lg", "w-full")}>
        {busy ? <Spinner /> : <LockIcon className="h-4 w-4" />}
        {phase === "preparing"
          ? "Preparing secure payment…"
          : phase === "paying"
            ? "Complete payment in the window…"
            : phase === "verifying" || phase === "done"
              ? "Confirming your booking…"
              : `Pay ${money(amountMinor, currency)} securely`}
      </button>
      <p className="text-center text-xs text-slate-500">Payments are processed by Razorpay. UPI, cards and net banking accepted.</p>
    </div>
  );
}
