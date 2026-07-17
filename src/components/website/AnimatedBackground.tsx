"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AnimatedBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <motion.div
        className="bg-primary/15 absolute top-[-10%] left-[10%] size-[32rem] rounded-full blur-3xl"
        animate={shouldReduceMotion ? undefined : { x: [0, 40, 0], y: [0, 24, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="bg-info/10 absolute top-[20%] right-[5%] size-[28rem] rounded-full blur-3xl"
        animate={shouldReduceMotion ? undefined : { x: [0, -32, 0], y: [0, 32, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="bg-success/10 absolute bottom-[-15%] left-[30%] size-[26rem] rounded-full blur-3xl"
        animate={shouldReduceMotion ? undefined : { x: [0, 28, 0], y: [0, -20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
