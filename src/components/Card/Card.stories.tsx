import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { Card } from "./Card";

/** Inline 24dp icons. Keeps the stories network-free + deterministic. */
const MoreVertGlyph = () => (
  <svg aria-hidden viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

const FavoriteGlyph = () => (
  <svg aria-hidden viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

/** SVG cover graphic used as the media slot — fully self-contained. */
const CoverArt = () => (
  <svg
    aria-hidden
    viewBox="0 0 320 160"
    width="100%"
    height="160"
    preserveAspectRatio="none"
    style={{ display: "block" }}
  >
    <defs>
      <linearGradient id="card-cover" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#A78BFA" />
        <stop offset="100%" stopColor="#6750A4" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="320" height="160" fill="url(#card-cover)" />
    <circle cx="80" cy="80" r="36" fill="rgba(255,255,255,0.16)" />
    <circle cx="240" cy="64" r="20" fill="rgba(255,255,255,0.20)" />
    <circle cx="200" cy="120" r="48" fill="rgba(255,255,255,0.10)" />
  </svg>
);

const meta: Meta<typeof Card> = {
  title: "Surfaces/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Expressive Card. Three M3 variants (elevated / filled / outlined), six elevation levels, seven shape steps, three density sizes, and a complete media / header / body / actions slot matrix. Interactive cards expose a state layer + Expressive shape morph + elevation lift on hover/focus per the M3 spec.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["elevated", "filled", "outlined"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    elevation: {
      control: { type: "number", min: 0, max: 5, step: 1 },
    },
    interactive: { control: "boolean" },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
  },
  args: {
    variant: "elevated",
    size: "md",
    shape: "md",
    elevation: 1,
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-80">
      <Card title="Elevated card" subhead="Default M3 surface">
        Resting elevated card — surface-container-low + elevation-1.
      </Card>
    </div>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[720px] grid-cols-3 gap-4">
      <Card variant="elevated" title="Elevated" subhead="elevation-1">
        surface-container-low
      </Card>
      <Card variant="filled" title="Filled" subhead="no shadow">
        surface-container-highest
      </Card>
      <Card variant="outlined" title="Outlined" subhead="1dp border">
        surface + outline-variant
      </Card>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[480px] flex-col gap-4">
      <Card size="sm" title="Small" subhead="12dp padding">
        Compact card — title-l + body-m supporting text.
      </Card>
      <Card size="md" title="Medium" subhead="16dp padding">
        Default density card. Most common surface.
      </Card>
      <Card size="lg" title="Large" subhead="24dp padding">
        Spacious card — used for hero / feature surfaces.
      </Card>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[720px] grid-cols-2 gap-4">
      <Card
        interactive
        aria-label="Interactive card"
        title="Interactive"
        subhead="Hover, focus, or press"
      >
        State layer + Expressive shape morph on hover.
      </Card>
      <Card
        interactive
        selected
        aria-label="Selected card"
        title="Selected"
        subhead="aria-selected=true"
      >
        Selected card paints the secondary-container fill.
      </Card>
      <Card
        interactive
        disabled
        aria-label="Disabled card"
        title="Disabled"
        subhead="opacity 0.38"
      >
        Disabled card blocks pointer + keyboard input.
      </Card>
      <Card
        error
        title="Error"
        subhead="Communicates a destructive state"
      >
        Error fills error-container + on-error-container text.
      </Card>
    </div>
  ),
};

export const Elevation: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[720px] grid-cols-3 gap-6 p-4">
      {[0, 1, 2, 3, 4, 5].map((level) => (
        <Card
          key={level}
          variant="elevated"
          elevation={level as 0 | 1 | 2 | 3 | 4 | 5}
          title={`Level ${level}`}
          subhead={`shadow-elevation-${level}`}
        >
          Elevation token level {level}.
        </Card>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[720px] grid-cols-3 gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl"] as const).map((shape) => (
        <Card key={shape} variant="filled" shape={shape} title={`shape-${shape}`}>
          Corner radius token: shape-{shape}.
        </Card>
      ))}
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[720px] grid-cols-2 gap-4">
      <Card
        variant="elevated"
        media={<CoverArt />}
        avatar="AB"
        title="Article title"
        subhead="By author · 5 min read"
        headerTrailing={
          <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center text-on-surface-variant">
            <MoreVertGlyph />
          </span>
        }
        actions={
          <>
            <button
              type="button"
              className="text-label-l text-primary px-3 py-2 rounded-shape-full hover:bg-primary/10"
            >
              Share
            </button>
            <button
              type="button"
              className="text-label-l text-on-primary bg-primary px-4 py-2 rounded-shape-full"
            >
              Read more
            </button>
          </>
        }
      >
        Supporting text appears beneath the title and subhead. It uses
        the body-m token bound to on-surface-variant.
      </Card>
      <Card
        variant="outlined"
        title="Header only"
        subhead="No media, no body, no actions"
        headerTrailing={
          <span aria-hidden className="inline-flex h-6 w-6 items-center justify-center text-error">
            <FavoriteGlyph />
          </span>
        }
      />
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-80">
      <Card
        interactive
        aria-label="Hover or focus me"
        title="Hover me"
        subhead="Expressive motion"
      >
        On hover the shape morphs md → lg, the surface lifts (-1dp y),
        and the elevation rises to level 2.
      </Card>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Card
        interactive
        aria-label="Article: M3 Expressive cards"
        title="Article title"
        subhead="Keyboard support"
      >
        Interactive card reads as a button with aria-label, tabindex 0,
        and a 2dp focus ring on Tab focus.
      </Card>
      <Card
        interactive
        selected
        aria-label="Selected article"
        title="Selected"
        subhead="aria-selected=true"
      >
        Selected interactive cards expose aria-selected.
      </Card>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    title: "Playground card",
    subhead: "Tweak controls to see the bindings change",
    children: "Body text uses the body-m token.",
  },
  render: (args) => (
    <div className="w-96">
      <Card {...args} />
    </div>
  ),
};

/**
 * Storybook interaction test: mounts an interactive card, asserts
 * the role + data attributes, simulates a click + keyboard activate,
 * and verifies the onClick handler fires.
 */
export const InteractionSpec: Story = {
  args: {
    interactive: true,
    title: "Interactive card",
    subhead: "Click or press Enter",
    "aria-label": "Click me",
    onClick: fn(),
    children: "Mock click handler — see actions panel.",
  },
  render: (args) => (
    <div className="w-80">
      <Card {...args} />
    </div>
  ),
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Click me" });

    await step("Renders interactive card with the resolved data attrs", async () => {
      expect(button).toHaveAttribute("data-interactive", "true");
      expect(button).toHaveAttribute("data-variant", "elevated");
      expect(button).toHaveAttribute("data-shape", "md");
      expect(button).toHaveAttribute("tabindex", "0");
    });

    await step("Click fires the onClick prop", async () => {
      await userEvent.click(button);
      expect(args.onClick).toHaveBeenCalledTimes(1);
    });

    await step("Tab + Enter activates the card via keyboard", async () => {
      button.focus();
      await userEvent.keyboard("{Enter}");
      expect(args.onClick).toHaveBeenCalledTimes(2);
    });
  },
};
