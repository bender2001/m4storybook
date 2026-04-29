import { useState } from "react";
import { motion } from "motion/react";
import { easing, duration, type EasingRole } from "@/tokens/motion";
import { springs } from "@/motion/presets";

const easings: EasingRole[] = [
  "emphasized",
  "emphasized-decelerate",
  "emphasized-accelerate",
  "standard",
  "standard-decelerate",
  "standard-accelerate",
];

export function MotionDemo() {
  const [tick, setTick] = useState(0);

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setTick((t) => t + 1)}
        className="rounded-shape-full bg-primary text-on-primary px-6 h-10 text-label-l"
      >
        Replay
      </button>

      <section>
        <h3 className="text-title-m mb-3">Easings (medium2 = {duration.medium2})</h3>
        <div className="space-y-2">
          {easings.map((e) => (
            <div key={e} className="flex items-center gap-3">
              <code className="w-56 text-label-m text-on-surface-variant">
                {e}
              </code>
              <div className="flex-1 h-6 bg-surface-container-low rounded-shape-full relative overflow-hidden">
                <motion.div
                  key={`${e}-${tick}`}
                  initial={{ x: 0 }}
                  animate={{ x: "calc(100% - 24px)" }}
                  transition={{
                    duration: 0.3,
                    ease: parseCubic(easing[e]),
                  }}
                  className="absolute top-0 left-0 h-6 w-6 rounded-shape-full bg-primary"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-title-m mb-3">Springs</h3>
        <div className="flex flex-wrap gap-6">
          {(Object.keys(springs) as (keyof typeof springs)[]).map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <motion.div
                key={`${s}-${tick}`}
                initial={{ scale: 0.6, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={springs[s]}
                className="size-16 rounded-shape-md bg-tertiary-container"
              />
              <code className="text-label-m">{s}</code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function parseCubic(value: string): [number, number, number, number] {
  const m = value.match(/cubic-bezier\(([^)]+)\)/);
  if (!m) return [0.2, 0, 0, 1];
  return m[1].split(",").map((n) => Number(n.trim())) as [
    number,
    number,
    number,
    number,
  ];
}
