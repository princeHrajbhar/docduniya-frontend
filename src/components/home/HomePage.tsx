import { SiteHeader } from "@/components/SiteHeader";
import {
  CtaStats,
  Footer,
  Hero,
  HowItWorks,
  TopDoctors,
  TreatmentCategories,
  WhyChooseUs,
} from "@/components/patient/Sections";
import { Testimonials } from "@/components/patient/Testimonials";

const links = [
  { href: "#treatments", label: "Treatments" },
  { href: "#why-us", label: "Why Us" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#doctors", label: "Top Doctors" },
  { href: "#testimonials", label: "Testimonials" },
];

/** The public home page; also shown to signed-in patients at /patient. */
export function HomePage({ home }: { home: string }) {
  return (
    <>
      <SiteHeader home={home} links={links} />
      <main>
        <Hero />
        <TreatmentCategories />
        <CtaStats />
        <WhyChooseUs />
        <HowItWorks />
        <TopDoctors />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
