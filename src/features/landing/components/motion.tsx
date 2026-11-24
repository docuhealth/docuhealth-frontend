import {
  animate,
  MotionConfig,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { type ReactNode, useEffect, useRef } from "react";
import { ease } from "@/features/landing/lib/motion";

// The landing page's motion: things rise gently into place the first time they scroll into
// view, groups arrive one after another, and figures count up. Only opacity and transforms move
// (cheap on any phone), each plays once, and with "reduce motion" on (the OS setting) MotionConfig
// drops the movement and keeps a plain fade.

/** Start a little before the element is fully in view, and only once. */
const viewport = { once: true, amount: 0.2, margin: "0px 0px -8% 0px" } as const;

const tags = {
  div: motion.div,
  h2: motion.h2,
  p: motion.p,
  ul: motion.ul,
  li: motion.li,
  article: motion.article,
  span: motion.span,
} as const;
type Tag = keyof typeof tags;

/** Wrap the landing page (or any page using these) so the OS's reduced-motion setting is kept. */
export function LandingMotion({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Rises (or slides, with `x`) and fades in the first time it scrolls into view. */
export function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
  y = 24,
  x = 0,
  scale = 1,
}: {
  as?: Tag;
  children?: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  scale?: number;
}) {
  const Component = tags[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={viewport}
      transition={{ duration: 0.7, ease, delay }}
    >
      {children}
    </Component>
  );
}

const group = {
  hidden: {},
  shown: (stagger: number) => ({ transition: { staggerChildren: stagger, delayChildren: 0.05 } }),
};
const item = {
  hidden: ({ y, x }: { y: number; x: number }) => ({ opacity: 0, y, x }),
  shown: { opacity: 1, y: 0, x: 0, transition: { duration: 0.6, ease } },
};

/** Its `RevealItem`s come in one after another when the group scrolls into view. */
export function RevealGroup({
  as = "div",
  children,
  className,
  stagger = 0.09,
}: {
  as?: Tag;
  children?: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const Component = tags[as];
  return (
    <Component
      className={className}
      variants={group}
      custom={stagger}
      initial="hidden"
      whileInView="shown"
      viewport={viewport}
    >
      {children}
    </Component>
  );
}

/** One of a `RevealGroup`'s children; `x` slides it in from the side instead of rising. */
export function RevealItem({
  as = "div",
  children,
  className,
  y = 20,
  x = 0,
}: {
  as?: Tag;
  children?: ReactNode;
  className?: string;
  y?: number;
  x?: number;
}) {
  const Component = tags[as];
  return (
    <Component className={className} variants={item} custom={{ y, x }}>
      {children}
    </Component>
  );
}

/**
 * A figure like "15K+" or "95%" that counts up from 0 the first time it's seen; the text around
 * the number stays put. Reduced motion shows the final figure straight away.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [, prefix = "", digits = "", suffix = ""] = /^(\D*)(\d+(?:\.\d+)?)(.*)$/.exec(value) ?? [];
  const target = Number(digits);
  const count = useMotionValue(reduce || !digits ? target : 0);
  const shown = useTransform(count, (latest) => `${prefix}${Math.round(latest)}${suffix}`);

  useEffect(() => {
    if (!inView || reduce || !digits) return;
    const controls = animate(count, target, { duration: 1.6, ease });
    return () => controls.stop();
  }, [inView, reduce, digits, target, count]);

  if (!digits) return <span className={className}>{value}</span>;
  return (
    // Screen readers get the real figure, not every number on the way up.
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <motion.span aria-hidden>{shown}</motion.span>
    </span>
  );
}
