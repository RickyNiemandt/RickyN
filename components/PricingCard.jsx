"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import MagneticButton from "./MagneticButton";

/**
 * Interactive glassmorphic pricing card. Hover/tap lifts the card via GPU
 * transforms; the highlighted tier gets a purple glow + trust badge. Layout is
 * fluid so cards collapse into a single column on tablet/mobile.
 */
export default function PricingCard({ pkg, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className={`glass-card gpu flex h-full flex-col p-6 sm:p-8 ${
        pkg.highlighted
          ? "border-highlight/40 shadow-purple-glow ring-1 ring-highlight/30"
          : ""
      }`}
    >
      {pkg.highlighted && (
        <span className="trust-badge mb-4 self-start">
          <Sparkles className="h-4 w-4 text-accent" />
          Most popular
        </span>
      )}

      <h3 className="text-2xl font-bold">{pkg.name}</h3>
      <p className="mt-2 text-sm text-body">{pkg.tagline}</p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold text-white">{pkg.price}</span>
        <span className="text-sm text-body">once-off</span>
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {pkg.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-body">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <MagneticButton
        as="a"
        href="#contact"
        className={`btn-accent mt-8 w-full ${
          pkg.highlighted ? "" : "bg-accent/90"
        }`}
      >
        {pkg.cta}
      </MagneticButton>
    </motion.article>
  );
}
