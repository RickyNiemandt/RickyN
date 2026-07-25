"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Palette, Rocket, ShieldCheck } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";

const pillars = [
  {
    icon: Palette,
    title: "Creative craft",
    body: "Distinctive, motion-rich interfaces built on a strict design system.",
  },
  {
    icon: Rocket,
    title: "Shipped fast",
    body: "AI-directed builds get you live in days, not months.",
  },
  {
    icon: ShieldCheck,
    title: "Built to last",
    body: "Responsive, accessible and performance-tuned for every device.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:pt-40">
      <section className="flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="trust-badge"
        >
          AI-powered studio · South Africa
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl"
        >
          Creative digital experiences,{" "}
          <span className="text-gradient">engineered to convert.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mt-6 max-w-xl text-base text-body sm:text-lg"
        >
          Charm Systems is a creative and business app studio. We pair bold
          design with AI-directed builds to launch fast, responsive products.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <MagneticButton as="a" href="/marketing" className="btn-accent">
            View creative packages
            <ArrowRight className="h-4 w-4" />
          </MagneticButton>
          <Link
            href="/marketing"
            className="text-sm text-body underline-offset-4 hover:text-white hover:underline"
          >
            See pricing tiers
          </Link>
        </motion.div>
      </section>

      <section className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pillars.map((pillar, i) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="glass-card gpu p-6"
          >
            <pillar.icon className="h-8 w-8 text-accent" />
            <h3 className="mt-4 text-lg font-semibold">{pillar.title}</h3>
            <p className="mt-2 text-sm text-body">{pillar.body}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
