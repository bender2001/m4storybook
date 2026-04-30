#!/usr/bin/env node
// Append 10 M3 Expressive polish tasks to feature_list.json.
// Each task is cross-cutting — it touches every existing component to
// raise the bar from "M3" to "M3 Expressive" per https://m3.material.io/.
import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("../feature_list.json", import.meta.url);
const features = JSON.parse(readFileSync(file, "utf8"));

const PROMPT_ADDITIONS = [
  "Read app_spec.txt, feature_list.json, claude-progress.txt, CLAUDE.md and claude.md before editing.",
  "This is an M3 EXPRESSIVE polish pass — the components already exist and pass. The work is to raise them from M3 to M3 Expressive (https://m3.material.io/styles/motion/easing-and-duration/tokens-specs and the per-component spec pages).",
  "Tokens are the source of truth. Use the existing easing/duration/shape/color tokens; add new ones to src/tokens/* if a spec value is missing.",
  "Use motion/react for all animation. Replace any linear/CSS-only tweens with motion/react springs/transitions.",
  "Honor prefers-reduced-motion: every animation must collapse to duration 0 when the Storybook reduced-motion toolbar toggle or system preference is on.",
  "After editing, run `pnpm typecheck`, `pnpm lint`, `pnpm test --run`, and the affected `pnpm test:e2e` specs. If any baseline screenshots need re-baselining because the spec change is intentional, commit the new PNGs.",
];

const profile = {
  id: "m3-expressive-polish-agent",
  agent: "M3 Expressive polish agent",
  skill: "Material Design 3 Expressive (motion, shape, color), motion/react springs and layout, Material Symbols variable axes, Playwright visual regression",
  system_prompt: "Polish existing M3 components to match M3 Expressive specs across all 66 components. Springy motion, shape morphing, variable type, layout transitions. Match the official docs.",
  preferred_stack: ["React 18", "TypeScript strict", "Tailwind CSS v3", "Storybook 8", "motion/react", "Playwright"],
};

const tasks = [
  {
    id: "expressive-001-springs",
    title: "Spring-based motion audit: replace ease tweens with motion/react emphasized springs across all 66 components",
    criteria: [
      "Sweep src/components/** for `transition: { duration: ... }` and CSS `transition-duration` on interactive states; replace with motion/react spring presets exported from src/motion/presets.ts (springy / emphasized / standard).",
      "M3 Expressive uses spring physics, not linear easing, for entrance/exit and state changes. Reference: https://m3.material.io/styles/motion/overview/expressive-design",
      "Add at least three named spring presets to src/motion/presets.ts: `expressive-spatial` (entrance/exit), `expressive-effects` (color/opacity), `expressive-default` (most state changes), with stiffness/damping derived from M3 emphasized tokens.",
      "Each component imports its spring from presets — no inline magic numbers.",
    ],
  },
  {
    id: "expressive-002-shape-morph",
    title: "Shape morphing on press: corner radius animates between states for every interactive surface",
    criteria: [
      "Per M3 Expressive (https://m3.material.io/styles/shape/overview), interactive components morph corner radius on hover → press → selected: e.g. Button rounds further on press, IconButton container morphs from circle → squircle on toggle, Switch handle morphs 16dp → 24dp pill.",
      "Wire shape morphing on Button, IconButton, FAB, Chip, ToggleButton, Card (hover lift + radius pulse), and Switch handle. Use motion/react `animate` with the shape token CSS variables.",
      "Update existing Playwright visual baselines that change as a result; commit new PNGs.",
    ],
  },
  {
    id: "expressive-003-bouncy-press",
    title: "Bouncy press scale with overshoot for Button, IconButton, FAB, Chip, ToggleButton, Switch",
    criteria: [
      "Replace `whileTap={{ scale: 0.97 }}` (or similar linear scale) with motion/react spring that has slight overshoot on release per M3 Expressive press feedback.",
      "Spring should look snappy, not floppy: stiffness ~600, damping ~25 as a starting point — tune by spec.",
      "Reduced-motion mode disables the scale entirely.",
    ],
  },
  {
    id: "expressive-004-indicator-layout",
    title: "Pill/indicator layout morphing for Bottom Navigation, Tabs, Toggle Button group, Stepper, Segmented Button",
    criteria: [
      "Active-item indicator morphs between siblings using motion/react `layout` prop with `transition={presets.expressiveSpatial}`. The pill slides AND morphs shape, matching M3 Expressive Bottom Navigation and Tabs specs.",
      "Implementation: a single absolutely-positioned `<motion.div layoutId='indicator' />` per group instead of independently rendered indicators.",
      "Verify in Playwright interaction test that clicking a non-active item produces a layout-animation (use `await expect(...).toHaveScreenshot()` after a settled timeout).",
    ],
  },
  {
    id: "expressive-005-stagger-entry",
    title: "Stagger entrance animations for List items, Menu items, Speed Dial radial actions, Snackbar queue",
    criteria: [
      "Use motion/react `<motion.ul variants={staggerParent}>` + `<motion.li variants={staggerChild}>` so children fade/slide in with a small stagger delay (M3 Expressive: 30ms per child, emphasized-decelerate easing).",
      "Apply to List, Menu, Speed Dial, Snackbar (when multiple queued), and Drawer items.",
      "Reduced-motion mode collapses to instant.",
    ],
  },
  {
    id: "expressive-006-variable-icons",
    title: "Material Symbols variable-font axes (fill / weight / grade / opticalSize) wired on hover, focus, selected",
    criteria: [
      "The Icon component already exposes axis props. Wire them so interactive parents (Button, IconButton, BottomNavigation item, Tab, Chip leading icon) drive the icon's `fill` axis 0→1 on hover and `weight` 400→700 on selected/active per M3 Expressive icon system (https://m3.material.io/styles/icons/overview).",
      "Animation: motion/react number tween, not CSS transition (variable font axes are not animatable by CSS in all engines).",
      "Add a Storybook story that demonstrates the axis transitions on hover.",
    ],
  },
  {
    id: "expressive-007-squircle-shapes",
    title: "Squircle (superellipse) shapes for FAB, IconButton large, Card, Selected Chip per M3 Expressive shape system",
    criteria: [
      "Implement squircle corners via CSS `clip-path: path(...)` or SVG mask where the M3 Expressive shape spec calls for superellipse rather than rounded-rect (FAB Large, IconButton Large, certain Card variants, selected Filter Chip).",
      "Add a `shape-squircle-{sm,md,lg}` Tailwind utility that applies the clip-path. Document in src/tokens/shape.ts.",
      "Verify visually in Playwright that the corner profile matches a superellipse, not a rounded rectangle.",
    ],
  },
  {
    id: "expressive-008-container-size-morph",
    title: "Container size morph between states: Switch handle, Slider thumb, FAB extended, Chip selected",
    criteria: [
      "Switch handle: 16dp (off) → 24dp (on) → 28dp (pressed), with motion/react spring on `width`/`height`.",
      "Slider thumb: notch grows on press (height +2dp), value label appears above with spring.",
      "FAB Extended: label slides in/out from the right when toggling extended ↔ collapsed; container width animates with motion/react.",
      "Chip selected: leading slot morphs from icon → checkmark on selection; container width animates.",
    ],
  },
  {
    id: "expressive-009-color-expressive",
    title: "Color-expressive role audit: use tertiary / error-container roles for accent moments per M3 Expressive",
    criteria: [
      "M3 Expressive emphasizes color contrast for emphasis. Audit Snackbar action, Alert/Banner, FAB (tertiary surface variant), Selected Chip, and inverse-surface Tooltip; switch them to the M3 Expressive recommended role (often tertiary or inverse-* roles) where they currently use primary.",
      "Reference: https://m3.material.io/styles/color/system/how-the-system-works",
      "Re-baseline Playwright screenshots that change.",
    ],
  },
  {
    id: "expressive-010-reduced-motion-gate",
    title: "Cross-cutting reduced-motion verification: Playwright spec asserts every animated component honors prefers-reduced-motion",
    criteria: [
      "Add tests/visual/reduced-motion.spec.ts that, for every component story, loads `?globals=reducedMotion:reduce` and asserts that the computed `transition-duration` and `animation-duration` of the root element AND every motion/react-managed child resolve to 0ms (or are short enough to be visually instant).",
      "Test runs against at least Button, Switch, Tabs, Bottom Navigation, Snackbar, Dialog, Menu, Slider, FAB, Chip, Accordion, List, Speed Dial, Tooltip, Drawer.",
      "If any component fails this check, fix it (collapse the motion/react `transition` to `{ duration: 0 }` when `useReducedMotion()` returns true).",
    ],
  },
];

let added = 0;
for (const t of tasks) {
  if (features.some((f) => f.id === t.id)) continue; // idempotent
  features.push({
    id: t.id,
    component: "M3 Expressive Polish",
    title: t.title,
    service: "frontend",
    layer: "web",
    atomic_level: "cross-cutting",
    depends_on: ["review-001"],
    passes: false,
    agent_profile: profile,
    recommended_skills: ["Material Design 3 Expressive", "motion/react springs and layout", "Material Symbols variable axes", "Playwright visual regression"],
    system_prompt_additions: PROMPT_ADDITIONS,
    acceptance_criteria: t.criteria,
    ui_states: [],
  });
  added++;
}

writeFileSync(file, JSON.stringify(features, null, 2) + "\n");
console.log(`Added ${added} M3 Expressive polish tasks (total now ${features.length}).`);
