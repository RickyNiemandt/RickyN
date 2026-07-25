"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Magnetic hover CTA. On pointer devices the button eases toward the cursor for
 * a magnetic micro-interaction. Touch devices (no fine pointer) skip the magnet
 * to avoid layout jumps; they still get the tactile tap scale. Movement uses
 * transform (x/y/scale) only, so it's GPU-composited and stays at 60fps.
 */
export default function MagneticButton({
  children,
  as = "button",
  className = "",
  strength = 0.35,
  ...props
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });

  const isFinePointer = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches;

  function handleMove(e) {
    if (!isFinePointer() || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  const MotionTag = as === "a" ? motion.a : motion.button;

  return (
    <MotionTag
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.04 }}
      className={`gpu ${className}`}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
