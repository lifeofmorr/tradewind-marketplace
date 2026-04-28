import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}

/**
 * Lightweight scroll-reveal: fade + translate-up once when entering viewport.
 * Respects reduced-motion preferences.
 */
export function Reveal({ children, delay = 0, y = 16, className, as = "div" }: Props) {
  const reduce = useReducedMotion();
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "-40px 0px" });

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag =
    as === "section" ? motion.section :
    as === "li" ? motion.li :
    as === "article" ? motion.article :
    motion.div;

  return (
    <MotionTag
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
