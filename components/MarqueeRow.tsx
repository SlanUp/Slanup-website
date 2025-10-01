"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import PlanCard from "./PlanCard";
import { Plan } from "@/lib/data";

interface MarqueeRowProps {
  plans: Plan[];
  direction: "left" | "right";
}

export default function MarqueeRow({ plans, direction }: MarqueeRowProps) {
  const x = useMotionValue(direction === "right" ? -1500 : 0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (!isDragging) {
      const currentX = x.get();
      let targetX;
      
      if (direction === "left") {
        targetX = currentX > -1500 ? -3000 : -3000;
      } else {
        targetX = currentX < -1500 ? 0 : 0;
      }
      
      const distance = Math.abs(targetX - currentX);
      const duration = distance > 0 ? (distance / 3000) * 60 : 60;

      animationRef.current = animate(x, targetX, {
        duration: duration,
        ease: "linear",
        onComplete: () => {
          // Reset to start seamlessly and loop
          x.set(direction === "left" ? 0 : -3000);
          if (!isDragging) {
            animationRef.current = animate(x, direction === "left" ? -3000 : 0, {
              duration: 60,
              ease: "linear",
              repeat: Infinity,
            });
          }
        },
      });
    } else {
      animationRef.current?.stop();
    }

    return () => animationRef.current?.stop();
  }, [isDragging, direction, x]);

  return (
    <div 
      ref={containerRef}
      className="w-full overflow-hidden marquee-row mb-6 sm:mb-8 py-4 cursor-grab active:cursor-grabbing"
    >
      <motion.div
        className="flex marquee-content"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -2000, right: 100 }}
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
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