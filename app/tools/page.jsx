"use client";

import { motion } from "framer-motion";
import { FileSpreadsheet, MessageSquare, ShieldCheck } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import PdfToExcel from "@/components/PdfToExcel";

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-32 sm:pt-40">
      <section className="text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="trust-badge"
        >
          <ShieldCheck className="h-4 w-4 text-accent" />
          Secure server-side tools
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mx-auto mt-6 max-w-2xl text-4xl font-extrabold sm:text-5xl"
        >
          Lead tools, <span className="text-gradient">processed server-side.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mx-auto mt-4 max-w-xl text-base text-body"
        >
          Form submissions and file conversions run through Next.js Server Actions
          and API routes — credentials stay on the server.
        </motion.p>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="glass-card gpu p-6 sm:p-8"
        >
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-accent" />
            <h2 className="text-xl font-bold">PDF → Excel converter</h2>
          </div>
          <p className="mt-2 text-sm text-body">
            Upload a report/waybill PDF and get a structured .xlsx back. Parsing
            happens in a server API route.
          </p>
          <div className="mt-6">
            <PdfToExcel />
          </div>
        </motion.div>

        <motion.div
          id="contact"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="glass-card gpu p-6 sm:p-8"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-accent" />
            <h2 className="text-xl font-bold">Start a project</h2>
          </div>
          <p className="mt-2 text-sm text-body">
            This form posts to a Server Action that validates and stores the lead.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </motion.div>
      </section>
    </div>
  );
}
