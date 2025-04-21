
import { animate } from "framer-motion";
import React, { useEffect, useRef } from "react";

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
}

export function AnimatedCounter({ from, to, duration = 1 }: AnimatedCounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      const controls = animate(from, to, {
        duration,
        onUpdate(value) {
          node.textContent = Math.round(value).toLocaleString();
        },
      });
      return () => controls.stop();
    }
  }, [from, to, duration]);

  return <span ref={nodeRef} />;
}
