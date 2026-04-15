"use client";

import LandingNavbar from "@/components/landing/LandingNavbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import ValueProps from "@/components/landing/ValueProps";
import Testimonials from "@/components/landing/Testimonials";
import FutureFeatures from "@/components/landing/FutureFeatures";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)" }}>
      <LandingNavbar />
      <Hero />
      <HowItWorks />
      <ValueProps />
      <Testimonials />
      <FutureFeatures />
      <CTA />
      <Footer />
    </div>
  );
}
