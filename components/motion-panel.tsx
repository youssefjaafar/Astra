"use client";

import { motion } from "framer-motion";

export function MotionPanel({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0.92, y: 4 }}
      transition={{ delay: Math.min(delay, 0.12), duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
