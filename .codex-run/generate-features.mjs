#!/usr/bin/env node
import { writeFileSync } from "node:fs";

// Atomic-design slice template for each component.
// Each slice becomes its own feature in feature_list.json so the autonomous
// agent makes small, verifiable forward steps.
const SLICES = [
  { key: "atom-anatomy",       title: "atom: anatomy + types + token bindings",      atomic: "atom" },
  { key: "atom-base",          title: "atom: base render + default variant",         atomic: "atom" },
  { key: "atom-variants",      title: "molecule: variants (filled/tonal/outlined/text/elevated as applicable)", atomic: "molecule" },
  { key: "atom-sizes",         title: "atom: sizes (sm/md/lg) + density",            atomic: "atom" },
  { key: "atom-states",        title: "atom: states (hover/focus/pressed/disabled/error/selected)", atomic: "atom" },
  { key: "molecule-slots",     title: "molecule: leading/trailing icon + label slots", atomic: "molecule" },
  { key: "molecule-motion",    title: "molecule: M3 Expressive motion (springs, shape morph, layout)", atomic: "molecule" },
  { key: "molecule-a11y",      title: "molecule: keyboard + ARIA + focus ring + reduced-motion", atomic: "molecule" },
  { key: "story-default",      title: "story: Default + Playground (controls)",      atomic: "molecule" },
  { key: "story-variants",     title: "story: Variants + Sizes + States grid",       atomic: "organism" },
  { key: "story-interaction",  title: "story: @storybook/test interaction spec",     atomic: "organism" },
  { key: "playwright-visual",  title: "playwright: visual baseline (light + dark)",  atomic: "organism" },
  { key: "playwright-spec",    title: "playwright: spec asserts radius/color/elevation/type/motion vs M3 docs", atomic: "organism" },
];

// 65 components mirroring the MUI navigation, grouped per the requested
// priority (M3 Expressive > M3 > MUI fallback re-skinned with M3 tokens).
const COMPONENTS = [
  // Inputs (14)
  { id: "autocomplete",     name: "Autocomplete",          group: "Inputs",        m3: "fallback" },
  { id: "button",           name: "Button",                group: "Inputs",        m3: "expressive" },
  { id: "button-group",     name: "Button Group",          group: "Inputs",        m3: "m3" },
  { id: "checkbox",         name: "Checkbox",              group: "Inputs",        m3: "expressive" },
  { id: "fab",              name: "Floating Action Button",group: "Inputs",        m3: "expressive" },
  { id: "icon-button",      name: "Icon Button",           group: "Inputs",        m3: "expressive" },
  { id: "radio-group",      name: "Radio Group",           group: "Inputs",        m3: "expressive" },
  { id: "rating",           name: "Rating",                group: "Inputs",        m3: "fallback" },
  { id: "select",           name: "Select",                group: "Inputs",        m3: "m3" },
  { id: "slider",           name: "Slider",                group: "Inputs",        m3: "expressive" },
  { id: "switch",           name: "Switch",                group: "Inputs",        m3: "expressive" },
  { id: "text-field",       name: "Text Field",            group: "Inputs",        m3: "expressive" },
  { id: "transfer-list",    name: "Transfer List",         group: "Inputs",        m3: "fallback" },
  { id: "toggle-button",    name: "Toggle Button",         group: "Inputs",        m3: "m3" },

  // Data display (10)
  { id: "avatar",           name: "Avatar",                group: "Data display",  m3: "m3" },
  { id: "badge",            name: "Badge",                 group: "Data display",  m3: "m3" },
  { id: "chip",             name: "Chip",                  group: "Data display",  m3: "expressive" },
  { id: "divider",          name: "Divider",               group: "Data display",  m3: "m3" },
  { id: "icons",            name: "Icons",                 group: "Data display",  m3: "m3" },
  { id: "material-icons",   name: "Material Symbols",      group: "Data display",  m3: "expressive" },
  { id: "list",             name: "List",                  group: "Data display",  m3: "m3" },
  { id: "table",            name: "Table",                 group: "Data display",  m3: "fallback" },
  { id: "tooltip",          name: "Tooltip",               group: "Data display",  m3: "expressive" },
  { id: "typography",       name: "Typography",            group: "Data display",  m3: "expressive" },

  // Feedback (6)
  { id: "alert",            name: "Alert",                 group: "Feedback",      m3: "m3" },
  { id: "backdrop",         name: "Backdrop",              group: "Feedback",      m3: "m3" },
  { id: "dialog",           name: "Dialog",                group: "Feedback",      m3: "expressive" },
  { id: "progress",         name: "Progress",              group: "Feedback",      m3: "expressive" },
  { id: "skeleton",         name: "Skeleton",              group: "Feedback",      m3: "m3" },
  { id: "snackbar",         name: "Snackbar",              group: "Feedback",      m3: "expressive" },

  // Surfaces (4)
  { id: "accordion",        name: "Accordion",             group: "Surfaces",      m3: "expressive" },
  { id: "app-bar",          name: "App Bar",               group: "Surfaces",      m3: "expressive" },
  { id: "card",             name: "Card",                  group: "Surfaces",      m3: "expressive" },
  { id: "paper",            name: "Paper",                 group: "Surfaces",      m3: "m3" },

  // Navigation (9)
  { id: "bottom-navigation",name: "Bottom Navigation",     group: "Navigation",    m3: "expressive" },
  { id: "breadcrumbs",      name: "Breadcrumbs",           group: "Navigation",    m3: "m3" },
  { id: "drawer",           name: "Drawer",                group: "Navigation",    m3: "expressive" },
  { id: "link",             name: "Link",                  group: "Navigation",    m3: "m3" },
  { id: "menu",             name: "Menu",                  group: "Navigation",    m3: "expressive" },
  { id: "pagination",       name: "Pagination",            group: "Navigation",    m3: "m3" },
  { id: "speed-dial",       name: "Speed Dial",            group: "Navigation",    m3: "expressive" },
  { id: "stepper",          name: "Stepper",               group: "Navigation",    m3: "m3" },
  { id: "tabs",             name: "Tabs",                  group: "Navigation",    m3: "expressive" },

  // Layout (5)
  { id: "box",              name: "Box",                   group: "Layout",        m3: "m3" },
  { id: "container",        name: "Container",             group: "Layout",        m3: "m3" },
  { id: "grid",             name: "Grid",                  group: "Layout",        m3: "m3" },
  { id: "stack",            name: "Stack",                 group: "Layout",        m3: "m3" },
  { id: "image-list",       name: "Image List",            group: "Layout",        m3: "m3" },

  // Utils (10)
  { id: "click-away",       name: "Click-Away Listener",   group: "Utils",         m3: "fallback" },
  { id: "css-baseline",     name: "CSS Baseline",          group: "Utils",         m3: "m3" },
  { id: "modal",            name: "Modal",                 group: "Utils",         m3: "m3" },
  { id: "no-ssr",           name: "No SSR",                group: "Utils",         m3: "fallback" },
  { id: "popover",          name: "Popover",               group: "Utils",         m3: "m3" },
  { id: "popper",           name: "Popper",                group: "Utils",         m3: "fallback" },
  { id: "portal",           name: "Portal",                group: "Utils",         m3: "fallback" },
  { id: "textarea-autosize",name: "Textarea Autosize",     group: "Utils",         m3: "fallback" },
  { id: "transitions",      name: "Transitions",           group: "Utils",         m3: "expressive" },
  { id: "use-media-query",  name: "useMediaQuery",         group: "Utils",         m3: "fallback" },

  // Advanced (8)
  { id: "date-picker",      name: "Date Picker",           group: "Advanced",      m3: "fallback" },
  { id: "time-picker",      name: "Time Picker",           group: "Advanced",      m3: "fallback" },
  { id: "date-range-picker",name: "Date Range Picker",     group: "Advanced",      m3: "fallback" },
  { id: "tree-view",        name: "Tree View",             group: "Advanced",      m3: "fallback" },
  { id: "data-grid",        name: "Data Grid",             group: "Advanced",      m3: "fallback" },
  { id: "charts",           name: "Charts",                group: "Advanced",      m3: "fallback" },
  { id: "masonry",          name: "Masonry",               group: "Advanced",      m3: "fallback" },
  { id: "timeline",         name: "Timeline",              group: "Advanced",      m3: "fallback" },
];

const FOUNDATION = [
  { id: "foundation-001", title: "Project scaffold: Vite + React 18 + TS strict + pnpm",
    crit: [
      "package.json declares pnpm scripts: dev, build, storybook, build-storybook, test, test:storybook, test:e2e, test:e2e:update, typecheck, lint.",
      "tsconfig.json + tsconfig.build.json with strict mode.",
      "src/main.tsx renders an empty <App />.",
      "`pnpm typecheck`, `pnpm lint`, `pnpm build` pass on the empty scaffold.",
    ] },
  { id: "foundation-002", title: "Tailwind CSS v3 wired with M3 token theme stub",
    crit: [
      "tailwind.config.ts extends theme with color/typography/shape/elevation/motion stubs that point at CSS variables.",
      "src/index.css imports tailwind base/components/utilities and declares :root + [data-theme=dark] CSS variable blocks.",
    ] },
  { id: "foundation-003", title: "Storybook 8 (React + Vite) with autodocs and ordered sidebar",
    crit: [
      "Storybook 8 installed with @storybook/react-vite framework.",
      "Sidebar order: Foundations > Inputs > Data display > Feedback > Surfaces > Navigation > Layout > Utils > Advanced.",
      "`pnpm storybook` starts on port 6006.",
      "`pnpm build-storybook` succeeds.",
    ] },
  { id: "foundation-004", title: "motion/react installed and verified",
    crit: [
      "motion/react in dependencies.",
      "src/motion/index.ts exports M3 Expressive easing + duration presets.",
      "A sample story imports motion/react and animates without errors.",
    ] },
  { id: "foundation-005", title: "Playwright installed with Storybook webServer",
    crit: [
      "Playwright + @playwright/test in devDependencies.",
      "playwright.config.ts boots `pnpm storybook --ci` on port 6006 with reuseExistingServer:!process.env.CI.",
      "`pnpm test:e2e` runs zero specs successfully.",
    ] },
  { id: "tokens-001", title: "M3 color roles + dark theme as CSS variables",
    crit: [
      "All M3 color roles emitted as CSS vars on :root and [data-theme=dark]: primary, on-primary, primary-container, on-primary-container, secondary*, tertiary*, error*, surface, surface-container-{lowest,low,base,high,highest}, on-surface, on-surface-variant, outline, outline-variant, inverse-*.",
      "Tailwind theme.extend.colors maps these via var(--md-sys-color-*).",
      "Storybook 'Foundations / Color' MDX page renders the swatch grid.",
    ] },
  { id: "tokens-002", title: "M3 typography scale (display/headline/title/body/label L/M/S)",
    crit: [
      "src/tokens/typography.ts exports the 15 type roles.",
      "Tailwind theme.extend.fontSize maps each role.",
      "Storybook 'Foundations / Type' MDX page renders the type ramp.",
    ] },
  { id: "tokens-003", title: "M3 shape scale (none, xs, sm, md, lg, xl, full)",
    crit: [
      "src/tokens/shape.ts exports the scale.",
      "Tailwind theme.extend.borderRadius maps each step.",
      "Storybook 'Foundations / Shape' MDX page renders the shape ramp.",
    ] },
  { id: "tokens-004", title: "M3 elevation 0..5 as Tailwind shadow tokens",
    crit: [
      "src/tokens/elevation.ts exports the levels.",
      "Tailwind theme.extend.boxShadow maps each level.",
      "Storybook 'Foundations / Elevation' MDX page renders the ladder.",
    ] },
  { id: "tokens-005", title: "M3 motion easing + durations as Tailwind transitions and motion/react presets",
    crit: [
      "src/tokens/motion.ts + src/motion/index.ts export emphasized*, standard* easings and short1..long4 durations.",
      "Tailwind theme.extend.transitionTimingFunction + transitionDuration map each token.",
      "Storybook 'Foundations / Motion' MDX page demonstrates each easing.",
    ] },
  { id: "theme-001", title: "ThemeProvider + useTheme hook (light/dark)",
    crit: [
      "src/theme/ThemeProvider.tsx applies data-theme on document.documentElement.",
      "useTheme returns { theme, setTheme }.",
    ] },
  { id: "theme-002", title: "Storybook decorator: theme + reduced-motion toolbar toggles",
    crit: [
      ".storybook/preview.tsx wraps every story in ThemeProvider.",
      "globalTypes expose theme (light/dark) and motionPreference (full/reduced) toolbar items.",
      "Reduced-motion mode collapses motion/react transitions to duration 0.",
    ] },
];

const REVIEW = [
  { id: "review-001", title: "Quality gate: typecheck + lint + unit + storybook build + playwright all green",
    crit: [
      "`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm build-storybook`, `pnpm test:e2e` all pass.",
      "Every component has at least one Playwright visual baseline checked into tests/visual/__screenshots__/.",
      "README documents how to run Storybook and Playwright.",
    ] },
  { id: "review-002", title: "Atomic-design index page in Storybook",
    crit: [
      "Storybook 'Foundations / Atomic Design' MDX page lists every atom/molecule/organism with links.",
    ] },
];

function basePromptAdditions() {
  return [
    "Read app_spec.txt, feature_list.json, claude-progress.txt (or codex-progress.md), CLAUDE.md and claude.md before editing.",
    "This project has NO backend, NO database, NO API server, NO devops, NO authentication. The only deliverable is a Storybook + Playwright design-parity tests against M3 Expressive docs.",
    "Engine is Claude Opus 4.7 single-agent. Do not spawn parallel work.",
    "Use motion/react for all animation; never add framer-motion, react-spring, or react-transition-group.",
    "Tokens are the source of truth. Never hardcode colors, radii, type sizes, or durations - always reference Tailwind classes that map to M3 tokens.",
    "Match M3 Expressive specs at https://m3.material.io/components/<component>/specs. Where M3 Expressive is undefined, fall back to M3, then to MUI re-skinned with M3 tokens.",
    "After implementing a feature, run the corresponding Playwright spec locally before flipping passes:true.",
  ];
}

function makeFeature({ id, component, title, depends_on, criteria, atomic }) {
  return {
    id,
    component,
    title,
    service: "frontend",
    layer: "web",
    atomic_level: atomic,
    depends_on,
    passes: false,
    agent_profile: {
      id: "m3-storybook-frontend-agent",
      agent: "M3 Expressive Storybook frontend agent",
      skill: "React 18, TypeScript strict, Tailwind CSS, Storybook 8, motion/react, Playwright, Material Design 3 Expressive",
      system_prompt: "Build M3 Expressive React components in a Storybook + Playwright workspace. Tokens drive everything; motion/react drives all animation. Match M3 docs pixel-for-pixel.",
      preferred_stack: ["React 18", "TypeScript strict", "Vite", "Tailwind CSS v3", "Storybook 8", "motion/react", "Playwright"],
    },
    recommended_skills: ["React 18", "TypeScript strict", "Tailwind CSS", "Storybook 8", "motion/react", "Playwright visual regression", "Material Design 3 Expressive"],
    system_prompt_additions: basePromptAdditions(),
    acceptance_criteria: criteria,
    ui_states: [],
  };
}

const features = [];

for (const f of FOUNDATION) {
  // Foundation entries depend linearly so the agent builds bottom-up.
  const idx = FOUNDATION.indexOf(f);
  const depends = idx === 0 ? [] : [FOUNDATION[idx - 1].id];
  features.push(makeFeature({
    id: f.id, component: "Foundation", title: f.title, depends_on: depends,
    criteria: f.crit, atomic: "atom",
  }));
}

const lastFoundation = FOUNDATION[FOUNDATION.length - 1].id; // theme-002

for (const c of COMPONENTS) {
  const sliceIds = SLICES.map((s) => `${c.id}--${s.key}`);
  SLICES.forEach((slice, sIdx) => {
    const id = `${c.id}--${slice.key}`;
    const depends = sIdx === 0 ? [lastFoundation] : [sliceIds[sIdx - 1]];
    const variantHint = c.m3 === "expressive"
      ? "Implement the M3 Expressive variant with springy motion, shape morphing, and expressive color/typography."
      : c.m3 === "m3"
      ? "Implement the standard Material 3 variant (M3 Expressive does not specify this component)."
      : "MUI fallback re-skinned with M3 tokens (no native M3 spec exists). Reuse MUI's behavior model but restyle with M3 tokens, motion, and shape.";
    const baseCriteria = [
      variantHint,
      `Atomic-design level: ${slice.atomic}.`,
      `Component family: ${c.group} / ${c.name}.`,
    ];
    let extra = [];
    switch (slice.key) {
      case "atom-anatomy":
        extra = [
          `src/components/${c.name.replace(/[^A-Za-z0-9]/g, "")}/types.ts exports the prop types.`,
          `src/components/${c.name.replace(/[^A-Za-z0-9]/g, "")}/anatomy.ts maps each anatomy slot to a Tailwind class string built from M3 tokens.`,
        ];
        break;
      case "atom-base":
        extra = [
          `src/components/${c.name.replace(/[^A-Za-z0-9]/g, "")}/${c.name.replace(/[^A-Za-z0-9]/g, "")}.tsx renders the default variant via the anatomy.`,
          `Component compiles with strict TypeScript and passes pnpm typecheck.`,
        ];
        break;
      case "atom-variants":
        extra = [
          `All variants documented for this component on m3.material.io are implemented (or MUI fallback variants if no M3 variant exists).`,
          `Variant choice is driven by a typed 'variant' prop with sensible default.`,
        ];
        break;
      case "atom-sizes":
        extra = [
          `Sizes (sm/md/lg) and density follow M3 specs.`,
          `Each size uses the M3 type role + container height the spec requires.`,
        ];
        break;
      case "atom-states":
        extra = [
          `State layers implemented at hover 0.08, focus 0.10, pressed 0.10, dragged 0.16 opacities of the on-color role.`,
          `Disabled, error, and selected states match the M3 spec.`,
        ];
        break;
      case "molecule-slots":
        extra = [
          `Leading/trailing icon slots (or content-equivalent slots) render and respect spacing tokens.`,
          `Label slot uses the correct M3 type role.`,
        ];
        break;
      case "molecule-motion":
        extra = [
          `All motion routed through motion/react using presets exported from src/motion/index.ts.`,
          `Shape morph / layout transitions use M3 emphasized easing.`,
          `prefers-reduced-motion (and Storybook reduced-motion toggle) collapses durations to 0.`,
        ];
        break;
      case "molecule-a11y":
        extra = [
          `Keyboard interactions match WAI-ARIA APG patterns (Tab, Enter/Space, Arrow keys, Esc as applicable).`,
          `ARIA roles, labels, and states applied; focus ring visible and uses outline token.`,
        ];
        break;
      case "story-default":
        extra = [
          `src/components/${c.name.replace(/[^A-Za-z0-9]/g, "")}/${c.name.replace(/[^A-Za-z0-9]/g, "")}.stories.tsx exports a Default story and a Playground with full controls.`,
          `Story renders cleanly in light + dark themes via the global decorator.`,
        ];
        break;
      case "story-variants":
        extra = [
          `Variants, Sizes, and States grids each ship as their own story.`,
          `Stories use Storybook autodocs and include an MDX docs panel referencing the M3 spec link.`,
        ];
        break;
      case "story-interaction":
        extra = [
          `Add a play() function using @storybook/test that drives the primary interaction (click/hover/focus/keyboard) and asserts the resulting state.`,
          `Story runs green under pnpm test:storybook.`,
        ];
        break;
      case "playwright-visual":
        extra = [
          `tests/visual/${c.id}.spec.ts loads each variant story via http://localhost:6006/iframe.html?id=...`,
          `Each variant has a deterministic screenshot for both light and dark theme committed to tests/visual/__screenshots__/.`,
          `Test passes locally under pnpm test:e2e.`,
        ];
        break;
      case "playwright-spec":
        extra = [
          `Playwright spec asserts the rendered component's computed styles match the M3 Expressive spec: shape radius, container color role, container height/width per density, label type role, state-layer opacities, elevation level, and motion duration/easing tokens.`,
          `For interactive components, drive hover/focus/press/toggle/open/dismiss and assert the resulting state-layer + motion + focus-ring match the M3 spec.`,
          `Test passes locally under pnpm test:e2e.`,
        ];
        break;
    }
    features.push(makeFeature({
      id, component: c.group, title: `${c.name} - ${slice.title}`,
      depends_on: depends, criteria: [...baseCriteria, ...extra], atomic: slice.atomic,
    }));
  });
}

// Review tasks depend on every component's playwright-spec slice being complete.
const allPwSpecs = COMPONENTS.map((c) => `${c.id}--playwright-spec`);
features.push(makeFeature({
  id: REVIEW[0].id, component: "Quality", title: REVIEW[0].title,
  depends_on: allPwSpecs, criteria: REVIEW[0].crit, atomic: "page",
}));
features.push(makeFeature({
  id: REVIEW[1].id, component: "Quality", title: REVIEW[1].title,
  depends_on: [REVIEW[0].id], criteria: REVIEW[1].crit, atomic: "template",
}));

console.error(`Generated ${features.length} features across ${COMPONENTS.length} components.`);
writeFileSync(new URL("../feature_list.json", import.meta.url), JSON.stringify(features, null, 2) + "\n");
