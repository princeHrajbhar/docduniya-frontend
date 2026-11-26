import { Suspense } from "react";
import {
  CtaStats,
  Hero,
  StatsStrip,
  HowItWorks,
  TopDoctors,
  TreatmentCategories,
  WhyChooseUs,
} from "@/features/home/components/Sections";
import { Testimonials } from "@/features/home/components/Testimonials";

/** The public landing page. Header and footer come from the (public) layout. */
export function HomePage() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <TreatmentCategories />
      <CtaStats />
      <WhyChooseUs />
      <HowItWorks />
      <Suspense>
        <TopDoctors />
      </Suspense>
      <Testimonials />
    </>
  );
}
