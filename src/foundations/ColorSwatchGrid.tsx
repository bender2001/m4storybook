import { lightColors, type ColorRole } from "@/tokens/colors";

const groups: { title: string; roles: ColorRole[] }[] = [
  {
    title: "Primary",
    roles: ["primary", "on-primary", "primary-container", "on-primary-container"],
  },
  {
    title: "Secondary",
    roles: [
      "secondary",
      "on-secondary",
      "secondary-container",
      "on-secondary-container",
    ],
  },
  {
    title: "Tertiary",
    roles: [
      "tertiary",
      "on-tertiary",
      "tertiary-container",
      "on-tertiary-container",
    ],
  },
  {
    title: "Error",
    roles: ["error", "on-error", "error-container", "on-error-container"],
  },
  {
    title: "Surface",
    roles: [
      "background",
      "on-background",
      "surface",
      "on-surface",
      "surface-variant",
      "on-surface-variant",
      "surface-dim",
      "surface-bright",
      "surface-container-lowest",
      "surface-container-low",
      "surface-container",
      "surface-container-high",
      "surface-container-highest",
    ],
  },
  {
    title: "Outline + Inverse",
    roles: [
      "outline",
      "outline-variant",
      "inverse-surface",
      "inverse-on-surface",
      "inverse-primary",
    ],
  },
];

export function ColorSwatchGrid() {
  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <section key={g.title}>
          <h3 className="text-title-m mb-3">{g.title}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {g.roles.map((role) => (
              <div
                key={role}
                className="rounded-shape-md border border-outline-variant overflow-hidden"
              >
                <div
                  className="h-16"
                  style={{ backgroundColor: `var(--md-sys-color-${role})` }}
                />
                <div className="p-2 bg-surface-container-low">
                  <div className="text-label-l">{role}</div>
                  <code className="text-label-s text-on-surface-variant">
                    {lightColors[role]}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
