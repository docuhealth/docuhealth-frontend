import {
  animate,
  motion,
  type MotionValue,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// The footer's big "DocuHealth": an outline, like an empty pipe, that fills with white from the
// first letter to the last when it scrolls into view. The water's leading edge is a moving wave,
// with a lighter wash just ahead of it; both settle flat once the word is full.

/** Points down the wave's edge: more makes a smoother curve. */
const EDGE_POINTS = 28;
/** How far the wave bulges, in % of the width, mid-way through. */
const AMPLITUDE = 2.4;

/**
 * A clip-path for the water at `progress` (0 empty, 1 full): everything left of a wavy edge that
 * sweeps from just off the left to just off the right. `lead` puts the edge a little ahead (the
 * lighter wash). The wave flattens at both ends so it starts and finishes cleanly.
 */
function waterEdge(progress: number, lead = 0) {
  const front = -8 + progress * 118 + lead;
  const swell = AMPLITUDE * Math.sin(Math.PI * Math.min(1, Math.max(0, progress)));
  const points: string[] = ["0% 0%"];
  for (let i = 0; i <= EDGE_POINTS; i++) {
    const y = (i / EDGE_POINTS) * 100;
    // Two waves of different speeds, so the edge churns rather than slides.
    const wave =
      Math.sin((y / 100) * Math.PI * 3 + progress * 14) * 0.65 +
      Math.sin((y / 100) * Math.PI * 7 - progress * 22) * 0.35;
    points.push(`${(front + swell * wave).toFixed(2)}% ${y.toFixed(2)}%`);
  }
  points.push("0% 100%");
  return `polygon(${points.join(", ")})`;
}

function Word({ outline = false }: { outline?: boolean }) {
  return (
    // Stretched to the container's width exactly; the bottom of the letters runs off the edge.
    <svg viewBox="0 0 1000 178" className="block h-auto w-full overflow-hidden" aria-hidden>
      <text
        x="2"
        y="218"
        textLength="996"
        lengthAdjust="spacingAndGlyphs"
        className="font-heading font-bold"
        fontSize="248"
        letterSpacing="-6"
        fill={outline ? "none" : "currentColor"}
        stroke={outline ? "currentColor" : "none"}
        strokeWidth={outline ? 1.5 : 0}
        vectorEffect="non-scaling-stroke"
      >
        DocuHealth
      </text>
    </svg>
  );
}

function Layer({ clipPath, className }: { clipPath: MotionValue<string>; className: string }) {
  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{ clipPath, WebkitClipPath: clipPath }}
    >
      <Word />
    </motion.div>
  );
}

export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const progress = useMotionValue(reduce ? 1 : 0);
  const water = useTransform(progress, (p) => waterEdge(p));
  const wash = useTransform(progress, (p) => waterEdge(p, 3.5));

  useEffect(() => {
    if (reduce) {
      progress.set(1);
      return;
    }
    if (!inView) return;
    // Slow to start, rushes through the middle, eases into the last letter.
    const controls = animate(progress, 1, { duration: 2.6, ease: [0.65, 0, 0.35, 1] });
    return () => controls.stop();
  }, [inView, reduce, progress]);

  return (
    <div ref={ref} aria-hidden className="relative mt-16 select-none lg:mt-24">
      {/* The empty pipe. */}
      <div className="text-white/25">
        <Word outline />
      </div>
      <Layer clipPath={wash} className="text-white/35" />
      <Layer clipPath={water} className="text-white" />
    </div>
  );
}
