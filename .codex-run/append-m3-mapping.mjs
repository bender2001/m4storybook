#!/usr/bin/env node
// Append 50 M3 spec-alignment tasks to feature_list.json:
//   * 30 audits of existing components against the four M3 doc pages
//     (overview / specs / guidelines / accessibility).
//   * 11 components we don't have yet — create them per M3.
//   *  9 cross-cutting docs / tooling / showcase tasks.
// For every component, the M3 base URL is https://m3.material.io/components/<slug>/
// with sub-pages overview, specs, guidelines, accessibility.
import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("../feature_list.json", import.meta.url);
const features = JSON.parse(readFileSync(file, "utf8"));

const PROMPT_ADDITIONS = [
  "Read app_spec.txt, feature_list.json, claude-progress.txt, CLAUDE.md and claude.md before editing.",
  "This is an M3 spec-alignment task. The single source of truth is https://m3.material.io/components/<slug>/. Read all four sub-pages (overview, specs, guidelines, accessibility) before changing code.",
  "Tokens drive everything. If a spec value is missing from src/tokens/* add it; never hardcode a color/radius/duration/dp value.",
  "Use motion/react for animation. Honor prefers-reduced-motion via the existing decorator.",
  "Every change ships with: (a) the component change, (b) the Playwright spec asserting the M3 spec value with toHaveCSS where applicable, (c) re-baselined snapshots for any visual change, (d) an updated MDX docs page with anatomy + spec table + do/don't + a11y checklist sourced from the four M3 doc pages.",
  "Run pnpm typecheck, pnpm lint, pnpm test --run, and the affected pnpm test:e2e specs before flipping passes:true.",
];

const profile = {
  id: "m3-spec-alignment-agent",
  agent: "M3 spec alignment agent",
  skill: "Material Design 3 (m3.material.io) component specs, motion/react, Playwright visual + computed-style assertions, MDX docs",
  system_prompt: "Audit components against the four M3 doc pages and align them exactly. Fix anatomy, dp specs, color roles, motion, and accessibility. Update docs to mirror the M3 page structure.",
  preferred_stack: ["React 18", "TypeScript strict", "Tailwind CSS v3", "Storybook 8", "motion/react", "Playwright", "@storybook/addon-a11y"],
};

function makeAuditCriteria(slug, name) {
  const base = `https://m3.material.io/components/${slug}`;
  return [
    `Read ${base}/overview, ${base}/specs, ${base}/guidelines, ${base}/accessibility before editing.`,
    `${name}: audit the existing src/components/<X>/ implementation against /specs — verify container height/width per density, corner radius (M3 shape token), label type role, leading/trailing slot dimensions, state-layer opacities (hover 0.08 / focus 0.10 / pressed 0.10 / dragged 0.16), and elevation level. Fix any deviation.`,
    `${name}: align color roles per /specs and /guidelines — e.g. primary vs primary-container, on-primary vs on-primary-container, the recommended container for each variant. Update src/components/<X>/anatomy.ts to use the spec roles.`,
    `${name}: implement the motion spec from /overview — entrance/exit duration and easing tokens, state-change springs. Reuse src/motion/presets.ts; add presets if a spec curve is missing.`,
    `${name}: implement /accessibility — minimum target size (M3 says 48dp for interactive), keyboard model per the WAI-ARIA APG pattern the page links to, screen-reader name/role/state, focus ring visible.`,
    `${name}: extend the Playwright spec to assert the M3 values via toHaveCSS (border-radius, height, padding, background-color resolved from the token, transition-duration). Re-baseline screenshots only if the spec change is intentional.`,
    `${name}: update the MDX docs page (src/components/<X>/<X>.mdx — create if missing) with sections that mirror the M3 doc structure: 'Overview', 'Anatomy' (numbered diagram), 'Specs' (table from /specs), 'Guidelines' (do/don't from /guidelines), 'Accessibility' (checklist from /accessibility), 'M3 docs' (links to all four pages).`,
  ];
}

function makeNewCriteria(slug, name) {
  const base = `https://m3.material.io/components/${slug}`;
  return [
    `Read ${base}/overview, ${base}/specs, ${base}/guidelines, ${base}/accessibility before writing the component.`,
    `Create src/components/<X>/ with types.ts, anatomy.ts, <X>.tsx, <X>.stories.tsx, index.ts following the existing atomic-design layout.`,
    `Implement every variant called out in /specs (sizes, density, modes). Tokens drive everything — no hex literals, no raw px.`,
    `Honor /accessibility: 48dp targets, WAI-ARIA APG keyboard pattern, focus management, screen-reader semantics.`,
    `Storybook stories: Default + Variants + Sizes + States + WithIcons (where applicable) + Playground. Story title placed in the correct sidebar bucket.`,
    `Playwright visual spec under tests/visual/<x>.visual.spec.ts with light + dark baselines AND tests/visual/<x>.spec.ts asserting the M3 values via toHaveCSS.`,
    `MDX docs page mirroring the M3 doc structure: Overview / Anatomy / Specs / Guidelines / Accessibility / M3 docs links.`,
  ];
}

const audits = [
  ["badges", "Badges"],
  ["common-buttons", "Common buttons"],
  ["button-groups", "Button groups"],
  ["cards", "Cards"],
  ["checkbox", "Checkbox"],
  ["chips", "Chips"],
  ["date-pickers", "Date pickers"],
  ["dialogs", "Dialogs"],
  ["divider", "Divider"],
  ["extended-fab", "Extended FAB"],
  ["fab", "FAB"],
  ["icon-buttons", "Icon buttons"],
  ["lists", "Lists"],
  ["menus", "Menus"],
  ["navigation-bar", "Navigation bar (Bottom Navigation)"],
  ["navigation-drawer", "Navigation drawer"],
  ["progress-indicators", "Progress indicators"],
  ["radio-button", "Radio button"],
  ["sliders", "Sliders"],
  ["snackbar", "Snackbar"],
  ["switch", "Switch"],
  ["tabs", "Tabs"],
  ["text-fields", "Text fields"],
  ["time-pickers", "Time pickers"],
  ["toggle-button", "Toggle button"],
  ["tooltips", "Tooltips"],
  ["top-app-bar", "Top app bar"],
  ["icons", "Icons (Material Symbols variable axes)"],
  ["color/system/overview", "Color system"],
  ["styles/motion/easing-and-duration/tokens-specs", "Motion easing & duration"],
];

const news = [
  ["bottom-app-bar", "Bottom app bar"],
  ["bottom-sheets", "Bottom sheets"],
  ["carousel", "Carousel"],
  ["fab-menu", "FAB menu (M3 Expressive — distinct from Speed Dial)"],
  ["floating-toolbar", "Floating toolbar (M3 Expressive)"],
  ["loading-indicator", "Loading indicator (M3 Expressive — distinct from Progress)"],
  ["navigation-rail", "Navigation rail (distinct from Navigation drawer)"],
  ["search", "Search (search bar + search view per M3 spec)"],
  ["side-sheets", "Side sheets (modal + standard)"],
  ["split-button", "Split button (M3 Expressive)"],
  ["segmented-buttons", "Segmented buttons (single + multi select per M3)"],
];

const docs = [
  {
    id: "m3-docs-anatomy-diagrams",
    title: "Anatomy diagrams: every component's MDX gets a numbered anatomy diagram",
    criteria: [
      "For every component under src/components/**, add or extend the MDX docs page with an Anatomy section that includes a numbered SVG/JSX diagram (component skeleton with callout numbers) and a parts list keyed to the numbers — mirroring the M3 docs Anatomy format.",
    ],
  },
  {
    id: "m3-docs-spec-tables",
    title: "Spec tables: every component's MDX has the M3 specs table verbatim",
    criteria: [
      "For each component, copy the M3 /specs table (container height, radius, type role, color role, state-layer opacity, elevation, motion duration & easing) into the MDX as a Markdown table. Cite the M3 page URL in a caption.",
    ],
  },
  {
    id: "m3-docs-guidelines-cards",
    title: "Guidelines: every component's MDX has do/don't cards from M3 /guidelines",
    criteria: [
      "Pull the do/don't list from M3 /guidelines into a `<DoDontGrid>` component (build it under src/foundations/) used by every component MDX page. Each card has an icon, a one-line guideline, and a green ✓ or red ✗ tag.",
    ],
  },
  {
    id: "m3-docs-a11y-matrix",
    title: "Accessibility checklist per component, mirroring M3 /accessibility",
    criteria: [
      "Add an Accessibility section to every component MDX with a checklist sourced from M3 /accessibility: target size, contrast, screen-reader name/role/state, keyboard map (WAI-ARIA APG pattern), reduced-motion, RTL support. Each item has a Storybook story or Playwright spec link as evidence.",
    ],
  },
  {
    id: "m3-docs-composition-showcases",
    title: "Storybook composition showcases: 5 real-world compositions of components",
    criteria: [
      "Add at least 5 composition stories under src/showcases/: 'Login form' (TextField + Button + Checkbox + Link), 'App shell' (TopAppBar + NavigationRail + Card grid + FAB), 'Settings page' (List + Switch + Slider + RadioGroup), 'Search results' (Search + List + Pagination + Chip filters), 'Empty state' (Card + Button + Typography). Each composition story has a Playwright visual baseline (light + dark).",
    ],
  },
  {
    id: "m3-tooling-addon-a11y",
    title: "@storybook/addon-a11y wired with axe checks per story",
    criteria: [
      "Install @storybook/addon-a11y; register in .storybook/main.ts; add a default a11y parameter that runs axe on every story; fail CI on serious/critical violations.",
    ],
  },
  {
    id: "m3-tooling-addon-viewport-themes",
    title: "@storybook/addon-viewport + @storybook/addon-themes installed and wired",
    criteria: [
      "Install both addons. Wire viewport with M3-recommended breakpoints (compact / medium / expanded / large / extra-large). Wire addon-themes to drive the same theme + reduced-motion globals our existing decorator uses, so the toolbar UI is the standard one.",
    ],
  },
  {
    id: "m3-tooling-token-playground",
    title: "Live token playground page in Storybook (drag sliders, see component morph)",
    criteria: [
      "Add src/foundations/TokenPlayground.tsx + src/foundations/TokenPlayground.mdx — sliders for shape (corner radius), elevation, motion duration, motion stiffness/damping; renders Button + Card + Chip + Switch live as the user drags. Backed by CSS variable writes so the change propagates.",
    ],
  },
  {
    id: "m3-docs-mdx-template-shared",
    title: "Shared MDX template + helper components for the M3 doc structure",
    criteria: [
      "Add src/foundations/M3DocBlocks.tsx exporting <Anatomy/>, <SpecTable/>, <DoDontGrid/>, <A11yChecklist/>, <M3DocsLinks/> components used by every component MDX so the structure is consistent. Document the template in src/foundations/MdxTemplate.mdx so future components copy from it.",
    ],
  },
];

const PROMPT_ADDITIONS_NEW = [
  ...PROMPT_ADDITIONS,
  "This component does not exist yet — create it from scratch per the M3 spec. Place under src/components/<PascalCaseName>/.",
];

let added = 0;

for (const [slug, name] of audits) {
  const id = `m3-audit-${slug.replace(/\//g, "-")}`;
  if (features.some((f) => f.id === id)) continue;
  features.push({
    id,
    component: "M3 Audit",
    title: `${name}: align with https://m3.material.io/components/${slug}/`,
    service: "frontend",
    layer: "web",
    atomic_level: "cross-cutting",
    depends_on: ["review-001"],
    passes: false,
    agent_profile: profile,
    recommended_skills: ["Material Design 3", "motion/react", "Playwright", "MDX"],
    system_prompt_additions: PROMPT_ADDITIONS,
    acceptance_criteria: makeAuditCriteria(slug, name),
    ui_states: [],
  });
  added++;
}

for (const [slug, name] of news) {
  const id = `m3-new-${slug}`;
  if (features.some((f) => f.id === id)) continue;
  features.push({
    id,
    component: "M3 New Component",
    title: `Create ${name} per https://m3.material.io/components/${slug}/`,
    service: "frontend",
    layer: "web",
    atomic_level: "organism",
    depends_on: ["review-001"],
    passes: false,
    agent_profile: profile,
    recommended_skills: ["Material Design 3", "motion/react", "Playwright", "MDX"],
    system_prompt_additions: PROMPT_ADDITIONS_NEW,
    acceptance_criteria: makeNewCriteria(slug, name),
    ui_states: [],
  });
  added++;
}

for (const t of docs) {
  if (features.some((f) => f.id === t.id)) continue;
  features.push({
    id: t.id,
    component: "M3 Docs / Tooling",
    title: t.title,
    service: "frontend",
    layer: "web",
    atomic_level: "cross-cutting",
    depends_on: ["review-001"],
    passes: false,
    agent_profile: profile,
    recommended_skills: ["MDX", "Storybook 8 addons", "Material Design 3"],
    system_prompt_additions: PROMPT_ADDITIONS,
    acceptance_criteria: t.criteria,
    ui_states: [],
  });
  added++;
}

writeFileSync(file, JSON.stringify(features, null, 2) + "\n");
console.log(`Added ${added} M3 mapping tasks (total now ${features.length}).`);
