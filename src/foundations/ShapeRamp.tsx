import { shapeScale, type ShapeRole } from "@/tokens/shape";

const roles = Object.keys(shapeScale) as ShapeRole[];

export function ShapeRamp() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
      {roles.map((role) => (
        <div key={role} className="flex flex-col items-center gap-2">
          <div
            className="size-20 bg-primary-container border border-outline-variant"
            style={{ borderRadius: shapeScale[role] }}
          />
          <code className="text-label-m">{role}</code>
          <code className="text-label-s text-on-surface-variant">
            {shapeScale[role]}
          </code>
        </div>
      ))}
    </div>
  );
}
