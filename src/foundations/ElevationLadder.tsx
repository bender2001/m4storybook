const levels = [
  { lvl: 0, cls: "shadow-elevation-0" },
  { lvl: 1, cls: "shadow-elevation-1" },
  { lvl: 2, cls: "shadow-elevation-2" },
  { lvl: 3, cls: "shadow-elevation-3" },
  { lvl: 4, cls: "shadow-elevation-4" },
  { lvl: 5, cls: "shadow-elevation-5" },
] as const;

export function ElevationLadder() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
      {levels.map(({ lvl, cls }) => (
        <div key={lvl} className="flex flex-col items-center gap-2">
          <div
            className={`size-24 rounded-shape-md bg-surface-container-high ${cls} flex items-center justify-center`}
          >
            <span className="text-headline-s">{lvl}</span>
          </div>
          <code className="text-label-m">level {lvl}</code>
        </div>
      ))}
    </div>
  );
}
