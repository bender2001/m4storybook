import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { Tooltip } from "./Tooltip";

/** Inline 16dp glyph used by the icon/button stories. */
const InfoGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    fill="currentColor"
    width="100%"
    height="100%"
  >
    <path d="M11 7h2v2h-2zM11 11h2v6h-2zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
  </svg>
);

/** Standardised trigger so every story exercises the same tab stop. */
const TriggerButton = ({
  children = "Hover me",
}: {
  children?: React.ReactNode;
}) => (
  <button
    type="button"
    className="rounded-shape-sm bg-primary text-on-primary px-4 py-2 text-label-l"
  >
    {children}
  </button>
);

const meta: Meta<typeof Tooltip> = {
  title: "Data Display/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "M3 Tooltip. Plain variant paints `inverse-surface` with body-s text for terse descriptors; rich variant paints `surface-container` with optional subhead, supporting body, and trailing action slot. Hover dwell is 500ms (M3 spec); focus opens immediately. Honors `prefers-reduced-motion` by skipping the fade+scale transition. Reference: https://m3.material.io/components/tooltips/specs.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["plain", "rich"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    placement: {
      control: "inline-radio",
      options: ["top", "right", "bottom", "left"],
    },
    showDelayMs: { control: { type: "number", min: 0, max: 2000, step: 50 } },
    hideDelayMs: { control: { type: "number", min: 0, max: 3000, step: 50 } },
    disabled: { control: "boolean" },
    defaultOpen: { control: "boolean" },
  },
  args: {
    variant: "plain",
    size: "md",
    placement: "top",
    label: "Saved",
    showDelayMs: 500,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  args: {
    label: "Saved to library",
    defaultOpen: true,
  },
  render: (args) => (
    <div className="py-10">
      <Tooltip {...args}>
        <TriggerButton>Save</TriggerButton>
      </Tooltip>
    </div>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-12 py-10">
      <Tooltip
        variant="plain"
        label="Plain tooltip"
        defaultOpen
        data-testid="plain-tooltip-host"
      >
        <TriggerButton>Plain</TriggerButton>
      </Tooltip>
      <Tooltip
        variant="rich"
        subhead="Quick guide"
        label="Rich tooltips can wrap to multiple lines."
        supportingText="They also accept supporting text and a trailing action."
        action={
          <button
            type="button"
            className="text-primary text-label-l rounded-shape-full px-3 py-1"
          >
            Learn more
          </button>
        }
        defaultOpen
        data-testid="rich-tooltip-host"
      >
        <TriggerButton>Rich</TriggerButton>
      </Tooltip>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-12 py-10">
      <Tooltip variant="plain" size="sm" label="Small" defaultOpen data-testid="size-sm">
        <TriggerButton>Small</TriggerButton>
      </Tooltip>
      <Tooltip variant="plain" size="md" label="Medium" defaultOpen data-testid="size-md">
        <TriggerButton>Medium</TriggerButton>
      </Tooltip>
      <Tooltip variant="plain" size="lg" label="Large" defaultOpen data-testid="size-lg">
        <TriggerButton>Large</TriggerButton>
      </Tooltip>
    </div>
  ),
};

export const Placements: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 gap-16 px-12 py-16">
      <Tooltip placement="top" label="Top" defaultOpen data-testid="place-top">
        <TriggerButton>Top</TriggerButton>
      </Tooltip>
      <Tooltip placement="right" label="Right" defaultOpen data-testid="place-right">
        <TriggerButton>Right</TriggerButton>
      </Tooltip>
      <Tooltip placement="bottom" label="Bottom" defaultOpen data-testid="place-bottom">
        <TriggerButton>Bottom</TriggerButton>
      </Tooltip>
      <Tooltip placement="left" label="Left" defaultOpen data-testid="place-left">
        <TriggerButton>Left</TriggerButton>
      </Tooltip>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-12 py-10">
      <Tooltip label="Resting (open)" defaultOpen data-testid="state-resting">
        <TriggerButton>Resting</TriggerButton>
      </Tooltip>
      <Tooltip label="Disabled tooltip" disabled data-testid="state-disabled">
        <TriggerButton>Disabled</TriggerButton>
      </Tooltip>
      <Tooltip label="Closed (no defaultOpen)" data-testid="state-closed">
        <TriggerButton>Closed</TriggerButton>
      </Tooltip>
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="py-10">
      <Tooltip
        variant="rich"
        subhead="Filters"
        label="Refine results by tag, date, or author."
        supportingText="Selections are saved to your account so they persist across sessions."
        action={
          <button
            type="button"
            className="text-primary text-label-l rounded-shape-full px-3 py-1"
            data-testid="rich-action"
          >
            Learn more
          </button>
        }
        defaultOpen
        data-testid="rich-slots"
      >
        <TriggerButton>
          <span className="inline-flex h-4 w-4 align-text-bottom">
            <InfoGlyph />
          </span>
          {" "}Filters
        </TriggerButton>
      </Tooltip>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="py-10">
      <Tooltip label="Fade + scale on enter (M3 emphasized-decelerate)" defaultOpen>
        <TriggerButton>Animated</TriggerButton>
      </Tooltip>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-12 py-10">
      <Tooltip
        label="Aria description forwarded to the trigger"
        id="aria-tip"
        defaultOpen
      >
        <TriggerButton>Focusable</TriggerButton>
      </Tooltip>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    label: "Playground tooltip",
    defaultOpen: true,
  },
  render: (args) => (
    <div className="py-10">
      <Tooltip {...args}>
        <TriggerButton>Playground</TriggerButton>
      </Tooltip>
    </div>
  ),
};

/**
 * Storybook interaction test: drives the plain-tooltip lifecycle.
 *  - hover opens after the dwell delay (we use 0ms here for speed)
 *  - the panel carries role=tooltip and the data-* contract
 *  - the trigger receives aria-describedby pointing at the panel id
 *  - blur dismisses the tooltip
 */
export const InteractionSpec: Story = {
  args: {
    label: "Saved",
    showDelayMs: 0,
    hideDelayMs: 0,
    onOpenChange: fn(),
  },
  render: (args) => (
    <div className="py-10">
      <Tooltip {...args}>
        <button type="button" data-testid="trigger" className="rounded-shape-sm bg-primary text-on-primary px-4 py-2 text-label-l">
          Save
        </button>
      </Tooltip>
    </div>
  ),
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId("trigger");

    await step("hover opens the tooltip", async () => {
      await userEvent.hover(trigger);
      await waitFor(() => {
        expect(canvas.getByRole("tooltip")).toBeVisible();
      });
      const panel = canvas.getByRole("tooltip");
      expect(panel).toHaveAttribute("data-variant", "plain");
      expect(panel).toHaveAttribute("data-size", "md");
      const id = panel.getAttribute("id");
      expect(id).toBeTruthy();
      expect(trigger).toHaveAttribute("aria-describedby", id ?? "");
      expect(args.onOpenChange).toHaveBeenCalledWith(true);
    });

    await step("unhover dismisses the tooltip", async () => {
      await userEvent.unhover(trigger);
      await waitFor(() => {
        expect(canvas.queryByRole("tooltip")).toBeNull();
      });
      expect(args.onOpenChange).toHaveBeenCalledWith(false);
    });
  },
};
