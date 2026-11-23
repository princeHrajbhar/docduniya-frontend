import Link from "next/link";
import { publicNavigation } from "@/constants/navigation";
import { contactDetails } from "@/constants/site";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-sm text-slate-400">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="text-white">
            <Logo />
          </div>
          <p className="mt-4 max-w-sm">
            Find and book verified doctors for in-clinic visits and video consultations across India.
          </p>
        </div>
        <div>
          <p className="font-semibold text-white">Company</p>
          <ul className="mt-4 space-y-2">
            {publicNavigation.slice(1).map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Get in touch</p>
          <ul className="mt-4 space-y-2">
            <li>
              <a href={`mailto:${contactDetails.email}`} className="hover:text-white">
                {contactDetails.email}
              </a>
            </li>
            <li>
              <a href={`tel:${contactDetails.phone.replace(/\s/g, "")}`} className="hover:text-white">
                {contactDetails.phone}
              </a>
            </li>
            <li>{contactDetails.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-6 text-center">
        © 2026 DocDuniya. All rights reserved.
      </div>
    </footer>
  );
}
