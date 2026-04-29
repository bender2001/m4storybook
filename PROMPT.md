# M3 Expressive Component Storybook

Build a comprehensive Storybook showcase of Material Design 3 (M3) Expressive
components, implemented in React + TypeScript, styled with Tailwind CSS, and
animated with motion (formerly Framer Motion: `motion/react`).

## Tech stack (mandatory)

- React 18 + TypeScript (strict)
- Vite as the build tool
- Storybook 8 (React + Vite framework, autodocs enabled)
- Tailwind CSS v3+ with a custom M3 token theme (M3 color roles, type scale,
  shape scale, elevation, motion easings/durations) wired into `tailwind.config.ts`
- `motion/react` (the package previously known as Framer Motion) for all
  animations, springs, gestures, and shared-layout transitions
- `pnpm` as the package manager

## Component selection rule

For every component listed in the MUI Material UI navigation
(https://mui.com/material-ui/), implement an equivalent component in the
following priority order:

1. If the component exists in **Material 3 Expressive** (https://m3.material.io/),
   build the M3 Expressive variant (springy motion, shape morphing, expressive
   color/typography).
2. Otherwise, build the **standard Material 3** variant.
3. Otherwise (MUI-only components like Data Grid, Tree View, Date Picker that
   have no direct M3 spec), build the MUI component re-skinned with M3
   Expressive tokens (colors, shapes, type, motion).

## Required components (match MUI nav 1:1)

Inputs: Autocomplete, Button, Button Group, Checkbox, Floating Action Button,
Radio Group, Rating, Select, Slider, Switch, Text Field, Transfer List,
Toggle Button.

Data display: Avatar, Badge, Chip, Divider, Icons, Material Icons, List, Table,
Tooltip, Typography.

Feedback: Alert, Backdrop, Dialog, Progress, Skeleton, Snackbar.

Surfaces: Accordion, App Bar, Card, Paper.

Navigation: Bottom Navigation, Breadcrumbs, Drawer, Link, Menu, Pagination,
Speed Dial, Stepper, Tabs.

Layout: Box, Container, Grid, Stack, Image List.

Utils: Click-Away Listener, CSS Baseline, Modal, No SSR, Popover, Popper,
Portal, Textarea Autosize, Transitions, useMediaQuery.

Lab / advanced (re-skinned MUI fallback): Date Picker, Time Picker, Date Range
Picker, Tree View, Data Grid, Charts, Masonry, Timeline.

## Storybook requirements

- One `.stories.tsx` per component, with `Default`, `States` (hover/focus/
  disabled/error), `Variants` (filled/tonal/outlined/text/elevated where
  applicable), `Sizes`, `WithIcons`, and `Playground` (controls).
- Autodocs page per component with a short description, anatomy, M3 token
  references, and motion notes.
- Global Storybook decorator that injects the M3 light/dark theme toggle and
  the motion-reduced-preference toggle.
- Story sort: Inputs > Data display > Feedback > Surfaces > Navigation >
  Layout > Utils > Advanced.

## Design tokens

Implement a complete M3 token layer in `src/tokens/` and expose it both as a
Tailwind theme extension and as CSS variables on `:root` / `[data-theme=dark]`:

- Color roles: primary, on-primary, primary-container, on-primary-container,
  secondary, tertiary, error, surface, surface-container (lowest..highest),
  on-surface, on-surface-variant, outline, outline-variant, inverse-* etc.
- Typography scale: display L/M/S, headline L/M/S, title L/M/S, body L/M/S,
  label L/M/S with M3 Expressive font weights.
- Shape scale: none, xs, sm, md, lg, xl, full + per-corner morphing utilities.
- Elevation: levels 0..5 as token-driven box-shadows.
- Motion: M3 Expressive easings (`emphasized`, `emphasized-decelerate`,
  `emphasized-accelerate`, `standard`, `standard-decelerate`, `standard-accelerate`)
  and durations (short1..long4) as Tailwind transition tokens AND as exported
  `motion` spring/transition presets in `src/motion/`.

## Quality gates

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and
  `pnpm build-storybook` must all pass.
- `pnpm storybook` must start cleanly on port 6006.
- Add `@storybook/test` interaction tests for at least Button, Switch, Tabs,
  Snackbar, Dialog, Menu, Slider, and TextField.
- Include a `test:storybook` script using `@storybook/test-runner`.

## Scripts (package.json)

- `dev`: vite
- `build`: tsc -b && vite build
- `storybook`: storybook dev -p 6006
- `build-storybook`: storybook build
- `test`: vitest run
- `test:storybook`: test-storybook
- `typecheck`: tsc -b --noEmit
- `lint`: eslint .

## Out of scope

- No backend, no database, no auth. This is a pure component library /
  Storybook deliverable.
