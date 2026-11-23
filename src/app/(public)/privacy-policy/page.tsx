import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { contactDetails } from "@/constants/site";

export const metadata = {
  title: "Privacy Policy – DocDuniya",
  description: "How DocDuniya collects, uses and protects your personal and health information.",
};

// DRAFT: placeholder policy text. Have it reviewed by a lawyer (including for
// India's Digital Personal Data Protection Act, 2023) before going live.
const sections = [
  {
    id: "information-we-collect",
    title: "1. Information we collect",
    body: [
      "Account details: your name, email address, mobile number, city, gender and date of birth.",
      "Health information you choose to share: symptoms, medical history, reports, prescriptions and consultation notes.",
      "Doctor details: registration number, qualifications, speciality, clinic and fees, used to verify and list doctors.",
      "Usage data: device, browser and pages visited, collected to keep the service secure and improve it.",
    ],
  },
  {
    id: "how-we-use",
    title: "2. How we use your information",
    body: [
      "To create your account, book appointments and run video consultations.",
      "To share relevant health information with the doctor you consult, only for your care.",
      "To send appointment reminders, prescriptions and service updates.",
      "To prevent fraud, verify doctors and comply with legal obligations.",
    ],
  },
  {
    id: "sharing",
    title: "3. When we share information",
    body: [
      "With doctors and clinics you book with, so they can treat you.",
      "With service providers (hosting, payments, messaging) who process data on our behalf under contract.",
      "When required by law or to protect the safety of our users.",
      "We never sell your personal or health information.",
    ],
  },
  {
    id: "security",
    title: "4. How we protect your data",
    body: [
      "Data is encrypted in transit and at rest.",
      "Access to health records is limited to you, the doctors you consult and staff who need it to support you.",
    ],
  },
  {
    id: "your-rights",
    title: "5. Your rights",
    body: [
      "You can access, correct or download your information from your profile.",
      "You can withdraw consent or ask us to delete your account at any time by contacting us.",
    ],
  },
  {
    id: "retention",
    title: "6. How long we keep data",
    body: [
      "We keep your information while your account is active, and afterwards for as long as the law requires for medical records.",
    ],
  },
  {
    id: "changes",
    title: "7. Changes to this policy",
    body: [
      "If we make important changes, we'll notify you by email or in the app before they take effect.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" sub="Last updated: 21 November 2026" />
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[220px_1fr]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-24 space-y-2 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-slate-600 hover:text-brand-700">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <article className="max-w-3xl space-y-10">
          <p className="text-slate-600">
            Your health information is personal. This policy explains what we collect when you use
            DocDuniya, why we collect it and the choices you have.
          </p>
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
                {s.body.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ))}
          <section className="rounded-2xl bg-brand-50 p-6">
            <h2 className="text-xl font-semibold">Questions?</h2>
            <p className="mt-2 text-slate-600">
              Write to us at{" "}
              <a href={`mailto:${contactDetails.email}`} className="font-medium text-brand-700 hover:underline">
                {contactDetails.email}
              </a>{" "}
              or use our{" "}
              <Link href="/contact" className="font-medium text-brand-700 hover:underline">
                contact form
              </Link>
              .
            </p>
          </section>
        </article>
      </div>
    </>
  );
}
