import { PageHero } from "@/components/ui/PageHero";
import { contactDetails } from "@/constants/site";
import { ContactForm } from "@/features/contact/components/ContactForm";

export const metadata = {
  title: "Contact Us – DocDuniya",
  description: "Get in touch with the DocDuniya support team.",
};

const channels = [
  { icon: "✉️", label: "Email", value: contactDetails.email, href: `mailto:${contactDetails.email}` },
  { icon: "📞", label: "Phone", value: contactDetails.phone, href: `tel:${contactDetails.phone.replace(/\s/g, "")}` },
  { icon: "📍", label: "Office", value: contactDetails.address },
  { icon: "🕑", label: "Support hours", value: contactDetails.hours },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="We're here to help"
        sub="Questions about a booking, payments or joining as a doctor? Send us a message and we'll get back to you."
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_2fr]">
        <ul className="space-y-4">
          {channels.map((c) => (
            <li key={c.label} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
              <span className="text-2xl">{c.icon}</span>
              <div>
                <p className="text-sm text-slate-500">{c.label}</p>
                {c.href ? (
                  <a href={c.href} className="font-medium text-slate-900 hover:text-brand-700">
                    {c.value}
                  </a>
                ) : (
                  <p className="font-medium text-slate-900">{c.value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold">Send us a message</h2>
          <p className="mt-1 mb-6 text-slate-600">For medical emergencies, call 112 or visit the nearest hospital.</p>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
