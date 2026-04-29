import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { Avatar } from "../Avatar/Avatar";
import { Badge } from "./Badge";

/**
 * Inline notification glyph used as the wrapped target for several
 * stories — keeps everything network-free for visual regression.
 */
const Bell = () => (
  <svg aria-hidden viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 10-3 0v.68C7.64 5.36 6 7.93 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);

const StarGlyph = () => (
  <svg aria-hidden viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M12 2.6l2.92 6.55 7.13.62-5.4 4.7 1.62 6.96L12 17.77l-6.27 3.66 1.62-6.96-5.4-4.7 7.13-.62z" />
  </svg>
);

const meta: Meta<typeof Badge> = {
  title: "Data Display/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "MUI-fallback Badge re-skinned with M3 Expressive tokens. Wraps a target element with an anchored count or dot, or renders standalone as an inline pill. Supports four color variants, three sizes (8dp dot / 16dp pill / 24dp pill), leading + trailing icon slots, an interactive (button) mode with state layer, and an entrance/exit transition driven by motion/react.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["filled", "tonal", "outlined", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    anchorOrigin: {
      control: "select",
      options: ["top-right", "top-left", "bottom-right", "bottom-left"],
    },
    overlap: { control: "inline-radio", options: ["rectangular", "circular"] },
    invisible: { control: "boolean" },
    showZero: { control: "boolean" },
    interactive: { control: "boolean" },
    disabled: { control: "boolean" },
    selected: { control: "boolean" },
    standalone: { control: "boolean" },
  },
  args: {
    variant: "filled",
    size: "md",
    content: 4,
    max: 99,
    anchorOrigin: "top-right",
    overlap: "rectangular",
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    "aria-label": "Notifications",
    children: (
      <span aria-label="Notifications target" className="text-on-surface">
        <Bell />
      </span>
    ),
  },
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-8">
      <Badge variant="filled" content={3} aria-label="Filled badge with 3">
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
      <Badge variant="tonal" content={5} aria-label="Tonal badge with 5">
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
      <Badge variant="outlined" content={7} aria-label="Outlined badge with 7">
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
      <Badge variant="elevated" content={9} aria-label="Elevated badge with 9">
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-8">
      <Badge size="sm" aria-label="Small dot badge">
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
      <Badge size="md" content={6} aria-label="Medium count badge">
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
      <Badge size="lg" content="42" aria-label="Large count badge">
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-8">
      <Badge content={1} aria-label="Rest state">
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
      <Badge content={1} interactive aria-label="Interactive">
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
      <Badge content={1} interactive disabled aria-label="Disabled">
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
      <Badge variant="tonal" content={1} selected aria-label="Selected">
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
      <Badge content={1} invisible aria-label="Invisible">
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-8">
      <Badge
        size="lg"
        content="3"
        leadingIcon={<StarGlyph />}
        aria-label="Three starred"
      >
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
      <Badge
        size="lg"
        content="New"
        trailingIcon={<StarGlyph />}
        aria-label="New trailing"
      >
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
      <Badge size="lg" standalone content="Beta" aria-label="Standalone Beta" />
    </div>
  ),
};

export const Counts: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-8">
      <Badge content={9} aria-label="Nine">
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
      <Badge content={42} aria-label="Forty-two">
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
      <Badge content={150} max={99} aria-label="Over ninety-nine">
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
      <Badge content={0} showZero aria-label="Zero shown">
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
    </div>
  ),
};

export const Anchored: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-8">
      <Badge
        size="sm"
        overlap="circular"
        anchorOrigin="bottom-right"
        aria-label="Online avatar"
      >
        <Avatar alt="Ada Lovelace">AL</Avatar>
      </Badge>
      <Badge
        content={12}
        overlap="rectangular"
        anchorOrigin="top-right"
        aria-label="Twelve unread"
      >
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
      <Badge
        content="•"
        anchorOrigin="top-left"
        variant="tonal"
        aria-label="Tonal top-left"
      >
        <span className="text-on-surface">
          <Bell />
        </span>
      </Badge>
    </div>
  ),
};

export const Standalone: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge standalone content="New" />
      <Badge standalone variant="tonal" content="Beta" />
      <Badge standalone variant="outlined" content="Draft" />
      <Badge standalone variant="elevated" content="Pinned" />
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    interactive: true,
    onClick: fn(),
    content: 5,
    "aria-label": "Five unread",
    children: (
      <span className="text-on-surface">
        <Bell />
      </span>
    ),
  },
};

export const Playground: Story = {
  args: {
    content: 4,
    "aria-label": "Playground",
    children: (
      <span className="text-on-surface">
        <Bell />
      </span>
    ),
  },
};

/**
 * Storybook interaction test: focuses the interactive badge, fires
 * Enter, asserts onClick fired.
 */
export const InteractionSpec: Story = {
  args: {
    interactive: true,
    onClick: fn(),
    content: 5,
    "aria-label": "Five unread",
    children: (
      <span className="text-on-surface">
        <Bell />
      </span>
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByRole("button", { name: "Five unread" });
    await userEvent.click(badge);
    await waitFor(() => {
      expect(args.onClick).toHaveBeenCalledTimes(1);
    });
    badge.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(args.onClick).toHaveBeenCalledTimes(2);
    });
  },
};
