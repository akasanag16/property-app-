
import { animate } from "framer-motion";
import React, { useEffect, useRef } from "react";

export function AnimatedCounter({ 
  value, 
  from = 0, 
  duration = 1,
  prefix = "" 
}: { 
  value: number; 
  from?: number; 
  duration?: number;
  prefix?: string;
}) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      const controls = animate(from, value, {
        duration,
        onUpdate(value) {
          node.textContent = `${prefix}${Math.round(value).toLocaleString()}`;
        },
      });
      return () => controls.stop();
    }
  }, [from, value, duration, prefix]);

  return <span ref={nodeRef} />;
}
