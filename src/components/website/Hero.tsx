"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { AnimatedBackground } from "@/components/website/AnimatedBackground";
import { StatStrip } from "@/components/website/StatStrip";
import { Caption, Display, Text } from "@/components/ui/typography";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const reduced = Boolean(shouldReduceMotion);

  return (
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
      <AnimatedBackground />

      <motion.div
        className="mx-auto max-w-4xl px-6 text-center lg:px-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer(reduced)}
      >
        <motion.div variants={fadeInUp(reduced)}>
          <Caption>Vidyadhar Nagar, Jaipur</Caption>
        </motion.div>

        <motion.div variants={fadeInUp(reduced, 0.05)}>
          <Display className="mt-4">Where every child is known by name.</Display>
        </motion.div>

        <motion.div variants={fadeInUp(reduced, 0.1)}>
          <Text variant="lead" className="mx-auto mt-6 max-w-2xl">
            Pant Public School pairs attentive teaching with a modern, digital-first campus — built
            around how families in Vidyadhar Nagar actually live and learn.
          </Text>
        </motion.div>

        <motion.div
          variants={fadeInUp(reduced, 0.15)}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/admissions"
            className="bg-primary text-primary-foreground shadow-soft duration-fast inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Apply for admission
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/academics"
            className="text-foreground border-border hover:bg-surface-muted duration-fast inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors"
          >
            Explore academics
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="mx-auto mt-20 max-w-5xl px-6 lg:px-8"
        initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.3, delay: reduced ? 0 : 0.3 }}
      >
        <StatStrip />
      </motion.div>
    </section>
  );
}
