# M3 Expressive Component Storybook

A Storybook showcase of every Material UI navigation entry, re-skinned
onto **Material Design 3 Expressive** tokens. Built with React 18 +
TypeScript strict, Vite, Tailwind CSS v3, Storybook 8, `motion/react`,
and Playwright design-parity tests.

## Stack

- React 18 + TypeScript (strict)
- Vite for dev / build
- Storybook 8 (`@storybook/react-vite`, autodocs enabled)
- Tailwind CSS v3 wired to a complete M3 token theme
  (color roles, type scale, shape scale, elevation, motion easings +
  durations) under `src/tokens/`
- `motion/react` for all animation, gestures, and shared-layout transitions
- Playwright for design-parity + visual regression tests
- pnpm

No backend, no API, no database. The deliverable is the Storybook
component library plus the Playwright test suite that asserts each
component matches its M3 spec.

## Install

```bash
pnpm install
```

## Package

Build the publishable React component package:

```bash
pnpm build
```

Install from GitHub Packages in a consuming project:

```bash
pnpm add @bender2001/m4-components
```

Consumers should import the library stylesheet once:

```ts
import "@bender2001/m4-components/style.css";
```

## Storybook

```bash
pnpm storybook         # http://localhost:6006
pnpm build-storybook   # static build → storybook-static/
```

The toolbar carries two globals — **Theme** (light / dark) and
**Motion** (normal / reduced) — wired through a `ThemeProvider`
decorator in `.storybook/preview.tsx`. Story sort follows MUI
navigation order: Foundations → Inputs → Data Display → Feedback →
Surfaces → Navigation → Layout → Utils → Advanced.

## Playwright (design parity + visual regression)

Each component ships a spec under `tests/visual/` that:

1. Loads its Storybook story via the iframe URL
   (e.g. `iframe.html?id=buttons-button--default`).
2. Reads computed styles to assert M3 spec compliance: shape radius,
   container color role, height, type role, state-layer opacities
   (hover 0.08, focus 0.10, pressed 0.10), elevation level, and
   motion easing / duration tokens.
3. Captures deterministic screenshots and compares against committed
   baselines in `tests/visual/__screenshots__/`.

```bash
pnpm test:e2e          # run the full Playwright suite
pnpm test:e2e:update   # re-baseline screenshots (only when the spec demands it)
```

Playwright boots Storybook automatically via `webServer` in
`playwright.config.ts` (`pnpm storybook --ci`, port 6006,
`reuseExistingServer: !process.env.CI`).

## Other scripts

```bash
pnpm dev              # Vite dev server (component sandbox at /)
pnpm build            # build the component package into dist/
pnpm build:app        # tsc -b && vite build
pnpm typecheck        # tsc -b --noEmit
pnpm lint             # eslint .
pnpm test             # vitest run (token unit tests)
pnpm test:storybook   # @storybook/test-runner against a running Storybook
```

## Project layout

```
src/
  tokens/         M3 design tokens (colors, type, shape, elevation, motion)
  theme/          ThemeProvider + dark-mode wiring
  motion/         M3 spring + transition presets for motion/react
  foundations/    MDX foundation pages (Color, Type, Shape, Elevation, Motion, Atomic Design)
  components/     One folder per component (Component.tsx + .stories.tsx + types.ts + anatomy.ts)
tests/
  visual/         Playwright design-parity + visual regression specs
.storybook/       Storybook config + preview decorators
```

The atomic-design taxonomy used to group components is documented in
the **Foundations / Atomic Design** Storybook page.
