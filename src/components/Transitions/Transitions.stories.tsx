import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { useState, type ReactElement } from "react";
import { Transitions } from "./Transitions";

const StarGlyph = (): ReactElement => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const ChevronGlyph = (): ReactElement => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M9 6l6 6-6 6 1.4 1.4L17.8 12 10.4 4.6z" />
  </svg>
);

const meta: Meta<typeof Transitions> = {
  title: "Utils/Transitions",
  component: Transitions,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "M3-tokenized Transitions wrapper. Re-skins the MUI transition primitives (Fade / Grow / Slide / Zoom / Collapse — https://mui.com/material-ui/transitions/) onto a single motion/react surface that drives the animation through the M3 motion tokens (https://m3.material.io/styles/motion/easing-and-duration/tokens-specs). Five variants × three densities (short4 / medium2 / long1) × the full M3 corner scale × four slide directions, with reduced-motion-safe fallbacks and aria-busy/aria-hidden parity for the AnimatePresence lifecycle.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["fade", "grow", "slide", "zoom", "collapse"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    direction: {
      control: "inline-radio",
      options: ["up", "down", "left", "right", "vertical", "horizontal"],
    },
    in: { control: "boolean" },
    appear: { control: "boolean" },
    unmountOnExit: { control: "boolean" },
    mountOnEnter: { control: "boolean" },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
  },
  args: {
    variant: "fade",
    size: "md",
    shape: "md",
    in: true,
    appear: true,
    unmountOnExit: true,
    mountOnEnter: false,
    selected: false,
    disabled: false,
    error: false,
    children: "Children animate via the M3 motion-token surface.",
  },
};

export default meta;
type Story = StoryObj<typeof Transitions>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <Transitions variant="fade" size="sm" shape="md" label="fade">
        Opacity 0 → 1 on the M3 standard easing
      </Transitions>
      <Transitions variant="grow" size="sm" shape="md" label="grow">
        Scale 0 → 1 + opacity on the emphasized easing
      </Transitions>
      <Transitions variant="slide" size="sm" shape="md" label="slide" direction="up">
        Translate from below on the emphasized easing
      </Transitions>
      <Transitions variant="zoom" size="sm" shape="md" label="zoom">
        Scale 0.6 → 1 + opacity on the emphasized easing
      </Transitions>
      <Transitions variant="collapse" size="sm" shape="md" label="collapse">
        Height 0 → auto on the emphasized-decelerate easing
      </Transitions>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <Transitions variant="fade" size="sm" shape="md" label="sm">
        Small density (12dp pad / body-s / 200ms short4)
      </Transitions>
      <Transitions variant="fade" size="md" shape="md" label="md">
        Medium density (24dp pad / body-m / 300ms medium2)
      </Transitions>
      <Transitions variant="fade" size="lg" shape="md" label="lg">
        Large density (40dp pad / body-l / 450ms long1)
      </Transitions>
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <Transitions
            key={shape}
            variant="fade"
            size="sm"
            shape={shape}
            label={`shape-${shape}`}
          >
            shape token: {shape}
          </Transitions>
        ),
      )}
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <Transitions variant="grow" size="sm" shape="md" label="resting">
        Resting (default fill)
      </Transitions>
      <Transitions variant="grow" size="sm" shape="md" label="selected" selected>
        Selected (secondary-container)
      </Transitions>
      <Transitions variant="grow" size="sm" shape="md" label="disabled" disabled>
        Disabled (opacity 0.38 + aria-disabled)
      </Transitions>
      <Transitions variant="grow" size="sm" shape="md" label="error" error>
        Error (error-container + aria-invalid)
      </Transitions>
    </div>
  ),
};

export const Directions: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-4">
      <Transitions
        variant="slide"
        size="sm"
        shape="md"
        direction="up"
        label="slide up"
      >
        Up
      </Transitions>
      <Transitions
        variant="slide"
        size="sm"
        shape="md"
        direction="down"
        label="slide down"
      >
        Down
      </Transitions>
      <Transitions
        variant="slide"
        size="sm"
        shape="md"
        direction="left"
        label="slide left"
      >
        Left
      </Transitions>
      <Transitions
        variant="slide"
        size="sm"
        shape="md"
        direction="right"
        label="slide right"
      >
        Right
      </Transitions>
      <Transitions
        variant="collapse"
        size="sm"
        shape="md"
        direction="vertical"
        label="collapse vertical"
      >
        Vertical
      </Transitions>
      <Transitions
        variant="collapse"
        size="sm"
        shape="md"
        direction="horizontal"
        label="collapse horizontal"
      >
        Horizontal
      </Transitions>
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <Transitions
        variant="grow"
        size="sm"
        shape="md"
        label="With leading icon"
        leadingIcon={<StarGlyph />}
      />
      <Transitions
        variant="grow"
        size="sm"
        shape="md"
        label="With trailing icon"
        trailingIcon={<ChevronGlyph />}
      />
      <Transitions
        variant="grow"
        size="sm"
        shape="md"
        label="Header + body"
        leadingIcon={<StarGlyph />}
        trailingIcon={<ChevronGlyph />}
      >
        Body content rides the AnimatePresence variant.
      </Transitions>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const MotionDemo = () => {
      const [open, setOpen] = useState(true);
      return (
        <div className="flex flex-col gap-3 p-4">
          <button
            type="button"
            data-testid="motion-toggle"
            onClick={() => setOpen((o) => !o)}
            className="self-start rounded-shape-full bg-primary px-4 py-2 text-on-primary"
          >
            {open ? "Hide" : "Show"}
          </button>
          <Transitions
            variant="grow"
            size="sm"
            shape="md"
            in={open}
            label="medium2 / emphasized"
            trailingIcon={<ChevronGlyph />}
          >
            Toggle the button to drive the AnimatePresence enter/exit
            cycle on the M3 emphasized easing.
          </Transitions>
        </div>
      );
    };
    return <MotionDemo />;
  },
};

export const Fallback: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <Transitions
        variant="fade"
        size="sm"
        shape="md"
        in={false}
        unmountOnExit
        label="Fallback render"
        fallback={<span>Pending…</span>}
      >
        Children unmount, fallback renders in their place.
      </Transitions>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <Transitions
        variant="fade"
        size="sm"
        shape="md"
        in
        aria-label="Visible transition region"
        label="Visible region"
      >
        aria-busy is removed once children mount.
      </Transitions>
      <Transitions
        variant="fade"
        size="sm"
        shape="md"
        in={false}
        unmountOnExit
        aria-label="Hidden transition region"
        label="Hidden region"
      >
        aria-hidden is set when the body unmounts.
      </Transitions>
      <Transitions
        variant="fade"
        size="sm"
        shape="md"
        error
        aria-label="Error transition region"
        label="Error"
      >
        aria-invalid is set automatically when `error` is true.
      </Transitions>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "grow",
    size: "md",
    shape: "lg",
    label: "Transitions playground",
    children: "Adjust the controls to explore the M3 motion-token matrix.",
  },
};

/**
 * @storybook/test interaction spec. Toggles `in`, asserts the
 * AnimatePresence cycle calls onEntered + onExited and that
 * aria-busy / aria-hidden flip in step with the lifecycle.
 */
export const InteractionSpec: Story = {
  args: {
    onEntered: fn(),
    onExited: fn(),
    "aria-label": "Interaction transition",
    label: "Interaction",
  },
  render: function InteractionRender(args) {
    const [open, setOpen] = useState(true);
    return (
      <div className="flex flex-col gap-3 p-4">
        <button
          type="button"
          data-testid="interaction-toggle"
          onClick={() => setOpen((o) => !o)}
          className="self-start rounded-shape-full bg-primary px-4 py-2 text-on-primary"
        >
          Toggle
        </button>
        <Transitions
          {...args}
          variant="fade"
          size="md"
          shape="md"
          in={open}
          unmountOnExit
        >
          <span data-testid="interaction-body">Animated body</span>
        </Transitions>
      </div>
    );
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const region = canvasElement.querySelector(
      "[data-component='transitions']",
    ) as HTMLElement | null;
    if (!region) throw new Error("transitions root missing");

    await step("Mounts in the entered state with aria-busy clear", async () => {
      await waitFor(() => {
        expect(region.getAttribute("data-in")).toBe("true");
      });
      expect(region.getAttribute("aria-busy")).toBeNull();
      expect(canvas.getByTestId("interaction-body")).toBeInTheDocument();
    });

    await step("Toggling `in` plays the exit animation and unmounts", async () => {
      const toggle = canvas.getByTestId("interaction-toggle");
      await userEvent.click(toggle);
      await waitFor(() => {
        expect(region.getAttribute("data-in")).toBeNull();
      });
      await waitFor(() => {
        expect(args.onExited).toHaveBeenCalled();
      });
    });

    await step("Re-toggling `in` mounts the body and fires onEntered", async () => {
      const toggle = canvas.getByTestId("interaction-toggle");
      await userEvent.click(toggle);
      await waitFor(() => {
        expect(region.getAttribute("data-in")).toBe("true");
      });
      await waitFor(() => {
        expect(args.onEntered).toHaveBeenCalled();
      });
    });
  },
};
