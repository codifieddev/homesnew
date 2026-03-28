"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSiteTemplate } from "@/components/shared/LocaleProvider";

const ORBS = [
  {
    className:
      "left-[-4rem] top-8 h-44 w-44 bg-[radial-gradient(circle,rgba(41,194,242,0.28),transparent_70%)]",
    animate: {
      x: [0, 18, -12, 0],
      y: [0, 20, -14, 0],
      scale: [1, 1.08, 0.96, 1],
    },
    duration: 18,
  },
  {
    className:
      "right-[-3rem] top-24 h-56 w-56 bg-[radial-gradient(circle,rgba(20,41,102,0.24),transparent_70%)]",
    animate: {
      x: [0, -16, 12, 0],
      y: [0, -18, 16, 0],
      scale: [1, 0.94, 1.06, 1],
    },
    duration: 22,
  },
  {
    className:
      "bottom-[-3rem] left-[20%] h-52 w-52 bg-[radial-gradient(circle,rgba(63,64,63,0.16),transparent_70%)]",
    animate: {
      x: [0, 20, -8, 0],
      y: [0, -12, 18, 0],
      scale: [1, 1.04, 0.92, 1],
    },
    duration: 20,
  },
];

export function AmbientOrbs({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const siteTemplate = useSiteTemplate();

  if (prefersReducedMotion || siteTemplate !== "immersive") {
    return null;
  }

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {ORBS.map((orb) => (
        <motion.div
          key={orb.className}
          className={cn("absolute rounded-full blur-3xl", orb.className)}
          animate={orb.animate}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
