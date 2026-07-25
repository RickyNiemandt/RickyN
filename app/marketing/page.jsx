"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import PricingCard from "@/components/PricingCard";
import MagneticButton from "@/components/MagneticButton";
import { creativePackages } from "@/lib/packages";

export default function MarketingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-32 sm:pt-40">
      <section className="text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="trust-badge"
        >
          Creative packages
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mx-auto mt-6 max-w-2xl text-4xl font-extrabold sm:text-5xl"
        >
          Fixed pricing. <span className="text-gradient">No surprises.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mx-auto mt-4 max-w-xl text-base text-body"
        >
          Choose the creative tier that matches your ambition. Every build is
          responsive, motion-rich and optimized for desktop, iPad and mobile.
        </motion.p>
      </section>

      {/* Grid collapses 3 -> 2 -> 1 columns; items-stretch keeps card heights equal */}
      <section className="mt-16 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
        {creativePackages.map((pkg, index) => (
          <PricingCard key={pkg.id} pkg={pkg} index={index} />
        ))}
      </section>

      {/* Sticky reassurance panel + contact anchor */}
      <section className="mt-20 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="glass-card gpu p-8">
            <h2 className="text-2xl font-bold">Why teams choose Charm Systems</h2>
            <ul className="mt-6 space-y-4 text-sm text-body">
              <li>Fast, AI-directed builds without the agency overhead.</li>
              <li>A single, consistent design system across every screen.</li>
              <li>Performance-tuned for smooth 60fps on tablet and mobile.</li>
              <li>Clear scope, fixed pricing, and a working-build focus.</li>
            </ul>
          </div>
        </div>

        <div id="contact" className="glass-card gpu flex flex-col justify-center p-8">
          <h2 className="text-2xl font-bold">Ready to start?</h2>
          <p className="mt-3 text-sm text-body">
            Tell us which tier fits and we&apos;ll scope your creative build.
          </p>
          <MagneticButton
            as="a"
            href="mailto:hello@charmsystems.co.za"
            className="btn-accent mt-6 self-start"
          >
            <Mail className="h-4 w-4" />
            Get in touch
          </MagneticButton>
        </div>
      </section>
    </div>
  );
}
