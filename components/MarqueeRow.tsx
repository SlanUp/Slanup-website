"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useAnimationControls } from "framer-motion";
import PlanCard from "./PlanCard";
import { Plan } from "@/lib/data";

interface MarqueeRowProps {
  plans: Plan[];
  direction: "left" | "right";
}

export default function MarqueeRow({ plans, direction }: MarqueeRowProps) {
  const controls = useAnimationControls();
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const animationVariants = {
    left: {
      x: ["0%", "-100%"],
    },
    right: {
      x: ["-100%", "0%"],
    },
  };

  useEffect(() => {
    if (!isDragging) {
      controls.start(animationVariants[direction], {
        duration: 60,
        repeat: Infinity,
        ease: "linear",
      });
    }
  }, [isDragging, direction, controls]);

  return (
    <div 
      ref={containerRef}
      className="w-full overflow-hidden marquee-row mb-6 sm:mb-8 py-4 cursor-grab active:cursor-grabbing"
    >
      <motion.div
        className="flex marquee-content"
        animate={controls}
        drag="x"
        dragConstraints={{ left: -2000, right: 0 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setIsDragging(false);
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