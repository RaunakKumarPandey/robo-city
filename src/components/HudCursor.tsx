"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function HudCursor() {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Smooth mouse coordinates with springs
  const cursorX = useSpring(-100, { damping: 28, stiffness: 450 });
  const cursorY = useSpring(-100, { damping: 28, stiffness: 450 });

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (window.matchMedia("(pointer: fine)").matches) {
      setMounted(true);
      document.body.classList.add("custom-cursor-active");
    }

    const moveHandler = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const mouseOverHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest("a") ||
          target.closest("button") ||
          target.closest("input") ||
          target.closest("select") ||
          target.closest("[role='button']"))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const mouseLeaveHandler = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", moveHandler);
    window.addEventListener("mouseover", mouseOverHandler);
    document.addEventListener("mouseleave", mouseLeaveHandler);

    return () => {
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mouseover", mouseOverHandler);
      document.removeEventListener("mouseleave", mouseLeaveHandler);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [cursorX, cursorY, isVisible]);

  if (!mounted || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Outer HUD Reticle Bracket */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovered ? 1.6 : 1,
          rotate: isHovered ? 45 : 0,
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="pointer-events-none absolute flex h-7 w-7 items-center justify-center"
      >
        <div
          className={`h-full w-full rounded-full border transition-colors duration-200 ${
            isHovered
              ? "border-[#35D9FF] shadow-[0_0_12px_rgba(53,217,255,0.7)]"
              : "border-[#FF2D8D]/60 shadow-[0_0_8px_rgba(255,45,141,0.4)]"
          }`}
        />
        {/* Reticle Crosshair Ticks */}
        <div className="absolute h-1.5 w-1.5 rounded-full bg-white opacity-80" />
      </motion.div>
    </div>
  );
}
