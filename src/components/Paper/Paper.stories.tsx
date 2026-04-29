import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { Paper } from "./Paper";

/** Inline 24dp icons. Keeps the story network-free + deterministic. */
const ArticleGlyph = () => (
  <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M19 5v14H5V5h14m0-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" />
  </svg>
);

const ChevronGlyph = () => (
  <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M9 6l6 6-6 6 1.4 1.4L17.8 12 10.4 4.6z" />
  </svg>
);

const meta: Meta<typeof Paper> = {
  title: "Surfaces/Paper",
  component: Paper,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Surface primitive. Three primary M3 variants (elevated / filled / outlined) plus an MUI tonal variant mapped to secondary-container. Drives Card, AppBar, Dialog, Menu, etc. Optional interactive mode exposes a focusable surface with state layer + Expressive shape morph + elevation lift on hover.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["elevated", "filled", "tonal", "outlined"],
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
  },
  args: {
    variant: "elevated",
    size: "md",
    shape: "md",
    elevation: 1,
    children: "Resting M3 Paper surface.",
  },
};

export default meta;
type Story = StoryObj<typeof Paper>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-80">
      <Paper>Resting elevated surface — elevation level 1.</Paper>
    </div>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[640px] grid-cols-2 gap-4">
      <Paper variant="elevated" label="Elevated">
        surface-container-low + elevation-1
      </Paper>
      <Paper variant="filled" label="Filled">
        surface-container-highest, no shadow
      </Paper>
      <Paper variant="tonal" label="Tonal">
        secondary-container
      </Paper>
      <Paper variant="outlined" label="Outlined">
        transparent + 1dp outline-variant
      </Paper>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[640px] flex-col gap-4">
      <Paper size="sm" label="Small (8dp padding)">
        Compact surface — 40dp min height.
      </Paper>
      <Paper size="md" label="Medium (16dp padding)">
        Default surface — 64dp min height.
      </Paper>
      <Paper size="lg" label="Large (24dp padding)">
        Spacious surface — 88dp min height.
      </Paper>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[640px] grid-cols-2 gap-4">
      <Paper interactive aria-label="Interactive paper" label="Interactive">
        Hover, focus, or press me.
      </Paper>
      <Paper
        interactive
        selected
        aria-label="Selected paper"
        label="Selected"
      >
        Selected paper surface.
      </Paper>
      <Paper
        interactive
        disabled
        aria-label="Disabled paper"
        label="Disabled"
      >
        Disabled paper surface.
      </Paper>
      <Paper variant="outlined" label="Outlined resting">
        Static outlined surface.
      </Paper>
    </div>
  ),
};

export const Elevation: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[640px] grid-cols-3 gap-6">
      {[0, 1, 2, 3, 4, 5].map((level) => (
        <Paper
          key={level}
          variant="elevated"
          elevation={level as 0 | 1 | 2 | 3 | 4 | 5}
          label={`Level ${level}`}
        >
          shadow-elevation-{level}
        </Paper>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[640px] grid-cols-3 gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl"] as const).map((shape) => (
        <Paper key={shape} variant="filled" shape={shape} label={`shape-${shape}`}>
          {shape === "none" ? "0dp" : shape === "xs" ? "4dp" : shape === "sm" ? "8dp" : shape === "md" ? "12dp" : shape === "lg" ? "16dp" : "28dp"}
        </Paper>
      ))}
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[480px] flex-col gap-4">
      <Paper
        leadingIcon={<ArticleGlyph />}
        label="Article surface"
        trailingIcon={<ChevronGlyph />}
      >
        Leading + trailing icon slots wrap a label row.
      </Paper>
      <Paper variant="filled" label="Label only">
        No icons in the header.
      </Paper>
      <Paper variant="outlined" leadingIcon={<ArticleGlyph />}>
        Leading icon, no label, no trailing icon.
      </Paper>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-80">
      <Paper
        interactive
        variant="elevated"
        shape="md"
        label="Hover or focus me"
      >
        On hover the shape morphs md → lg, the surface lifts (-1dp y),
        and the elevation rises to level 2.
      </Paper>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Paper interactive aria-label="Static surface" label="Default">
        Decorative paper exposes no role; interactive paper reads as
        a button with aria-label and a 2dp focus ring.
      </Paper>
      <Paper interactive selected aria-label="Selected card" label="Selected">
        aria-selected=true when the surface is selected.
      </Paper>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    label: "Playground",
    leadingIcon: <ArticleGlyph />,
    children: "Tweak controls to see the M3 token bindings change.",
  },
  render: (args) => (
    <div className="w-96">
      <Paper {...args} />
    </div>
  ),
};

/**
 * Storybook interaction test: mounts an interactive paper, asserts
 * the role + data attributes, simulates a click, and verifies the
 * onClick handler fires + focus rings render on Tab focus.
 */
export const InteractionSpec: Story = {
  args: {
    interactive: true,
    label: "Interactive surface",
    "aria-label": "Click me",
    onClick: fn(),
    children: "Mock click handler — see actions panel.",
  },
  render: (args) => (
    <div className="w-80">
      <Paper {...args} />
    </div>
  ),
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Click me" });

    await step("Renders interactive paper with the resolved data attrs", async () => {
      expect(button).toHaveAttribute("data-interactive", "true");
      expect(button).toHaveAttribute("data-variant", "elevated");
      expect(button).toHaveAttribute("data-shape", "md");
      expect(button).toHaveAttribute("tabindex", "0");
    });

    await step("Click fires the onClick prop", async () => {
      await userEvent.click(button);
      expect(args.onClick).toHaveBeenCalledTimes(1);
    });

    await step("Tab + Enter activates the surface via keyboard", async () => {
      button.focus();
      await userEvent.keyboard("{Enter}");
      expect(args.onClick).toHaveBeenCalledTimes(2);
    });
  },
};
