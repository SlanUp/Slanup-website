"use client";

import React from "react";
import { motion } from "framer-motion";
import PlanCard from "./PlanCard";
import { Plan } from "@/lib/data";

interface MarqueeRowProps {
  plans: Plan[];
  direction: "left" | "right";
}

export default function MarqueeRow({ plans, direction }: MarqueeRowProps) {
  const animationVariants = {
    left: {
      x: ["0%", "-100%"],
    },
    right: {
      x: ["-100%", "0%"],
    },
  };

  return (
    <div className="w-full overflow-hidden marquee-row mb-6 sm:mb-8 py-4">
      <motion.div
        className="flex marquee-content"
        animate={animationVariants[direction]}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {[...plans, ...plans, ...plans].map((plan, index) => (
          <div key={`${plan.id}-${index}`} className="px-2">
            <PlanCard plan={plan} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}