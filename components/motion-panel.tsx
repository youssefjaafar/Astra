"use client";

import { motion } from "framer-motion";

export function MotionPanel({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
