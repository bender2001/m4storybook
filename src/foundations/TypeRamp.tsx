import { typeScale, type TypeRole } from "@/tokens/typography";

const roles = Object.keys(typeScale) as TypeRole[];

export function TypeRamp() {
  return (
    <ul className="space-y-3">
      {roles.map((role) => (
        <li
          key={role}
          className="flex items-baseline justify-between gap-6 rounded-shape-md bg-surface-container-low px-4 py-3"
        >
          <span className={`text-${role}`}>The quick brown fox</span>
          <span className="text-label-s text-on-surface-variant">{role}</span>
        </li>
      ))}
    </ul>
  );
}
