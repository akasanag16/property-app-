
import { animate } from "framer-motion";
import React, { useEffect, useRef } from "react";

export function AnimatedCounter({ value, from = 0, duration = 1 }: { value: number; from?: number; duration?: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      const controls = animate(from, value, {
        duration,
        onUpdate(value) {
          node.textContent = Math.round(value).toLocaleString();
        },
      });
      return () => controls.stop();
    }
  }, [from, value, duration]);

  return <span ref={nodeRef} />;
}
