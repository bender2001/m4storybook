type AtomicLevel = "atom" | "molecule" | "organism";

type IndexEntry = {
  /** Display name for the component card. */
  name: string;
  /** Storybook story-kind slug, e.g. "buttons-button". */
  slug: string;
  /** MUI navigation category. */
  category: string;
  /** One-line role summary used as the card description. */
  role: string;
};

const atoms: IndexEntry[] = [
  {
    name: "Avatar",
    slug: "data-display-avatar",
    category: "Data Display",
    role: "Single image / monogram primitive.",
  },
  {
    name: "Backdrop",
    slug: "feedback-backdrop",
    category: "Feedback",
    role: "Full-bleed scrim primitive.",
  },
  {
    name: "Badge",
    slug: "data-display-badge",
    category: "Data Display",
    role: "Notification dot anchored to a target.",
  },
  {
    name: "Box",
    slug: "layout-box",
    category: "Layout",
    role: "Token-aware styled <div>.",
  },
  {
    name: "Button",
    slug: "buttons-button",
    category: "Buttons",
    role: "M3 Expressive action primitive.",
  },
  {
    name: "Click-Away Listener",
    slug: "utils-click-away-listener",
    category: "Utils",
    role: "Outside-click detector primitive.",
  },
  {
    name: "Container",
    slug: "layout-container",
    category: "Layout",
    role: "Width-clamped layout primitive.",
  },
  {
    name: "CSS Baseline",
    slug: "utils-css-baseline",
    category: "Utils",
    role: "Global baseline reset.",
  },
  {
    name: "Divider",
    slug: "data-display-divider",
    category: "Data Display",
    role: "Hairline rule primitive.",
  },
  {
    name: "Floating Action Button",
    slug: "buttons-floating-action-button",
    category: "Buttons",
    role: "Primary screen action atom.",
  },
  {
    name: "Icon",
    slug: "data-display-icon",
    category: "Data Display",
    role: "1em SVG glyph primitive.",
  },
  {
    name: "Icon Button",
    slug: "buttons-icon-button",
    category: "Buttons",
    role: "Single-icon action primitive.",
  },
  {
    name: "Link",
    slug: "navigation-link",
    category: "Navigation",
    role: "Inline navigational anchor primitive.",
  },
  {
    name: "Material Symbols",
    slug: "data-display-material-symbols",
    category: "Data Display",
    role: "Variable-font icon primitive.",
  },
  {
    name: "Modal",
    slug: "utils-modal",
    category: "Utils",
    role: "Scrim + portal structural primitive.",
  },
  {
    name: "No SSR",
    slug: "utils-no-ssr",
    category: "Utils",
    role: "Client-only render gate.",
  },
  {
    name: "Paper",
    slug: "surfaces-paper",
    category: "Surfaces",
    role: "Token-driven elevated surface.",
  },
  {
    name: "Popover",
    slug: "utils-popover",
    category: "Utils",
    role: "Anchor-positioned surface primitive.",
  },
  {
    name: "Popper",
    slug: "utils-popper",
    category: "Utils",
    role: "Floating-positioner primitive.",
  },
  {
    name: "Portal",
    slug: "utils-portal",
    category: "Utils",
    role: "Teleports children into a target node.",
  },
  {
    name: "Skeleton",
    slug: "feedback-skeleton",
    category: "Feedback",
    role: "Shimmering placeholder atom.",
  },
  {
    name: "Stack",
    slug: "layout-stack",
    category: "Layout",
    role: "Single-axis flex layout primitive.",
  },
  {
    name: "Switch",
    slug: "inputs-switch",
    category: "Inputs",
    role: "Two-state toggle primitive.",
  },
  {
    name: "Textarea Autosize",
    slug: "utils-textarea-autosize",
    category: "Utils",
    role: "Auto-growing <textarea> primitive.",
  },
  {
    name: "Tooltip",
    slug: "data-display-tooltip",
    category: "Data Display",
    role: "Anchored micro-overlay atom.",
  },
  {
    name: "Transitions",
    slug: "utils-transitions",
    category: "Utils",
    role: "Token-driven enter/exit animation atom.",
  },
  {
    name: "Typography",
    slug: "data-display-typography",
    category: "Data Display",
    role: "M3 type-role text primitive.",
  },
  {
    name: "useMediaQuery",
    slug: "utils-usemediaquery",
    category: "Utils",
    role: "Concurrent-safe media query hook.",
  },
];

const molecules: IndexEntry[] = [
  {
    name: "Alert",
    slug: "feedback-alert",
    category: "Feedback",
    role: "Icon + title + body + close composition.",
  },
  {
    name: "Autocomplete",
    slug: "inputs-autocomplete",
    category: "Inputs",
    role: "TextField + listbox combo.",
  },
  {
    name: "Breadcrumbs",
    slug: "navigation-breadcrumbs",
    category: "Navigation",
    role: "Trail of links + separators.",
  },
  {
    name: "Button Group",
    slug: "buttons-button-group",
    category: "Buttons",
    role: "Bundled buttons sharing edges.",
  },
  {
    name: "Checkbox",
    slug: "inputs-checkbox",
    category: "Inputs",
    role: "Box + label + helper composition.",
  },
  {
    name: "Chip",
    slug: "data-display-chip",
    category: "Data Display",
    role: "Leading icon + label + delete trio.",
  },
  {
    name: "Grid",
    slug: "layout-grid",
    category: "Layout",
    role: "12-column responsive grid molecule.",
  },
  {
    name: "ImageList",
    slug: "layout-imagelist",
    category: "Layout",
    role: "Tiled image grid with caption bars.",
  },
  {
    name: "List",
    slug: "data-display-list",
    category: "Data Display",
    role: "Header + list of avatar/text/trailing rows.",
  },
  {
    name: "Menu",
    slug: "navigation-menu",
    category: "Navigation",
    role: "Anchored menu of items.",
  },
  {
    name: "Pagination",
    slug: "navigation-pagination",
    category: "Navigation",
    role: "Page buttons + first/prev/next/last.",
  },
  {
    name: "Progress",
    slug: "feedback-progress",
    category: "Feedback",
    role: "Linear / circular progress molecule.",
  },
  {
    name: "Radio Group",
    slug: "inputs-radio-group",
    category: "Inputs",
    role: "Roving radio set with shared label.",
  },
  {
    name: "Rating",
    slug: "inputs-rating",
    category: "Inputs",
    role: "Row of icon-button stars.",
  },
  {
    name: "Select",
    slug: "inputs-select",
    category: "Inputs",
    role: "TextField + dropdown menu molecule.",
  },
  {
    name: "Slider",
    slug: "inputs-slider",
    category: "Inputs",
    role: "Track + thumb + value label molecule.",
  },
  {
    name: "Snackbar",
    slug: "feedback-snackbar",
    category: "Feedback",
    role: "Surface + label + action + close molecule.",
  },
  {
    name: "Text Field",
    slug: "inputs-text-field",
    category: "Inputs",
    role: "Label + input + helper composition.",
  },
  {
    name: "Toggle Button",
    slug: "buttons-toggle-button",
    category: "Buttons",
    role: "Group of mutually-exclusive buttons.",
  },
];

const organisms: IndexEntry[] = [
  {
    name: "Accordion",
    slug: "surfaces-accordion",
    category: "Surfaces",
    role: "Stack of expandable header + body panels.",
  },
  {
    name: "App Bar",
    slug: "surfaces-appbar",
    category: "Surfaces",
    role: "Top app bar with leading + title + actions.",
  },
  {
    name: "Bottom Navigation",
    slug: "navigation-bottomnavigation",
    category: "Navigation",
    role: "Bar of icon + label nav destinations.",
  },
  {
    name: "Card",
    slug: "surfaces-card",
    category: "Surfaces",
    role: "Media + header + body + actions container.",
  },
  {
    name: "Charts",
    slug: "advanced-charts",
    category: "Advanced",
    role: "MUI X charts re-skinned on M3 tokens.",
  },
  {
    name: "Data Grid",
    slug: "advanced-data-grid",
    category: "Advanced",
    role: "Header + sortable rows + selection cursor.",
  },
  {
    name: "Date Picker",
    slug: "advanced-date-picker",
    category: "Advanced",
    role: "Calendar + field + day grid organism.",
  },
  {
    name: "Date Range Picker",
    slug: "advanced-date-range-picker",
    category: "Advanced",
    role: "Two-month range calendar organism.",
  },
  {
    name: "Dialog",
    slug: "feedback-dialog",
    category: "Feedback",
    role: "Headline + body + actions modal organism.",
  },
  {
    name: "Drawer",
    slug: "navigation-drawer",
    category: "Navigation",
    role: "Off-canvas navigation surface.",
  },
  {
    name: "Masonry",
    slug: "advanced-masonry",
    category: "Advanced",
    role: "Pinterest-style multi-column layout.",
  },
  {
    name: "Speed Dial",
    slug: "navigation-speed-dial",
    category: "Navigation",
    role: "FAB + radial action set.",
  },
  {
    name: "Stepper",
    slug: "navigation-stepper",
    category: "Navigation",
    role: "Connected step indicator + content panes.",
  },
  {
    name: "Table",
    slug: "data-display-table",
    category: "Data Display",
    role: "Header + rows + footer table organism.",
  },
  {
    name: "Tabs",
    slug: "navigation-tabs",
    category: "Navigation",
    role: "Tab list + indicator + panel container.",
  },
  {
    name: "Timeline",
    slug: "advanced-timeline",
    category: "Advanced",
    role: "Connector + dot + content rows.",
  },
  {
    name: "Time Picker",
    slug: "advanced-time-picker",
    category: "Advanced",
    role: "Hour/minute clock dial organism.",
  },
  {
    name: "Transfer List",
    slug: "inputs-transfer-list",
    category: "Inputs",
    role: "Source + actions + target list trio.",
  },
  {
    name: "Tree View",
    slug: "advanced-tree-view",
    category: "Advanced",
    role: "Recursive tree with selection cursor.",
  },
];

const sections: { level: AtomicLevel; title: string; blurb: string; entries: IndexEntry[] }[] = [
  {
    level: "atom",
    title: "Atoms",
    blurb:
      "Single semantic UI primitives. One atom wraps roughly one native HTML element, styled with M3 tokens and state-layer behavior, and never composes another component from this library.",
    entries: atoms,
  },
  {
    level: "molecule",
    title: "Molecules",
    blurb:
      "Mid-complexity generics built from atoms. A molecule never reimplements an atom's logic inline — it composes the atom layer into a small, reusable unit (form field, chip, list row, search bar).",
    entries: molecules,
  },
  {
    level: "organism",
    title: "Organisms",
    blurb:
      "Most complex generic components — meaningful, mostly self-contained UI regions that compose molecules + atoms + native elements. Examples: AppBar, Dialog, Stepper, Tabs container, Data Grid.",
    entries: organisms,
  },
];

const docsHref = (slug: string) => `?path=/docs/${slug}--docs`;

const cardClass =
  "block rounded-shape-md border border-outline-variant bg-surface-container-low p-4 no-underline shadow-elevation-1 transition-[box-shadow,background-color] duration-medium2 ease-emphasized hover:bg-surface-container hover:shadow-elevation-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";

export function AtomicDesignIndex() {
  return (
    <div data-component="atomic-design-index" className="space-y-12">
      <header className="space-y-3">
        <p className="text-label-l uppercase tracking-wider text-on-surface-variant">
          Foundation
        </p>
        <h1 className="text-display-s text-on-surface">Atomic design</h1>
        <p className="max-w-3xl text-body-l text-on-surface-variant">
          Every component in this library is classified as an{" "}
          <strong className="text-on-surface">atom</strong>,{" "}
          <strong className="text-on-surface">molecule</strong>, or{" "}
          <strong className="text-on-surface">organism</strong>. Atoms are
          single primitives, molecules compose atoms, and organisms compose
          molecules + atoms into a meaningful UI region. The slice ordering
          inside each component file mirrors this taxonomy: anatomy → base →
          variants → sizes → states → slots → motion → a11y → stories →
          interaction test → playwright visual → playwright spec.
        </p>
      </header>

      {sections.map((section) => (
        <section
          key={section.level}
          data-section={section.level}
          aria-labelledby={`atomic-${section.level}-heading`}
          className="space-y-4"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2
              id={`atomic-${section.level}-heading`}
              className="text-headline-m text-on-surface"
            >
              {section.title}
            </h2>
            <span
              data-slot="count"
              className="text-label-l text-on-surface-variant"
            >
              {section.entries.length} components
            </span>
          </div>
          <p className="max-w-3xl text-body-m text-on-surface-variant">
            {section.blurb}
          </p>
          <ul
            data-slot="entries"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {section.entries.map((entry) => (
              <li key={entry.slug}>
                <a
                  href={docsHref(entry.slug)}
                  data-slot="entry"
                  data-slug={entry.slug}
                  data-atomic-level={section.level}
                  className={cardClass}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-title-m text-on-surface">
                      {entry.name}
                    </span>
                    <span className="text-label-s uppercase tracking-wider text-on-surface-variant">
                      {entry.category}
                    </span>
                  </div>
                  <p className="mt-2 text-body-m text-on-surface-variant">
                    {entry.role}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
