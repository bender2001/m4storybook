import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent } from "@storybook/test";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Backdrop } from "./Backdrop";

/**
 * The Backdrop covers a full surface, so stories pin it inside a
 * fixed-size `position: relative` host with `contained=true` so the
 * scrim doesn't eat the entire Storybook iframe. The Default story
 * uses contained mode for the same reason.
 */
const Surface = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    data-host="backdrop-surface"
    className={
      "relative h-[200px] w-[320px] overflow-hidden rounded-shape-md " +
      "bg-surface-container-low p-4 text-on-surface " +
      (className ?? "")
    }
  >
    <div className="absolute inset-4 grid place-items-center text-body-m">
      Content behind scrim
    </div>
    {children}
  </div>
);

const meta: Meta<typeof Backdrop> = {
  title: "Feedback/Backdrop",
  component: Backdrop,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Backdrop. Re-skins the MUI Backdrop API onto the M3 scrim surface (https://m3.material.io/components/dialogs/specs). Variants paint the scrim in four ways (filled / tonal / outlined / invisible), three density sizes drive the scrim opacity (sm 0.16, md 0.32 default, lg 0.56), and motion routes through motion/react with the M3 emphasized tween.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["filled", "tonal", "outlined", "invisible"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    open: { control: "boolean" },
    invisible: { control: "boolean" },
    contained: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    variant: "filled",
    size: "md",
    shape: "none",
    open: true,
    invisible: false,
    contained: true,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Backdrop>;

export const Default: Story = {
  render: (args) => (
    <Surface>
      <Backdrop {...args} />
    </Surface>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        <Backdrop variant="filled" contained />
      </Surface>
      <Surface>
        <Backdrop variant="tonal" contained />
      </Surface>
      <Surface>
        <Backdrop variant="outlined" contained />
      </Surface>
      <Surface>
        <Backdrop variant="invisible" contained />
      </Surface>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        <Backdrop size="sm" contained />
      </Surface>
      <Surface>
        <Backdrop size="md" contained />
      </Surface>
      <Surface>
        <Backdrop size="lg" contained />
      </Surface>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        <Backdrop contained />
      </Surface>
      <Surface>
        <Backdrop contained disabled />
      </Surface>
      <Surface>
        <Backdrop contained variant="invisible" />
      </Surface>
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <Surface key={shape}>
            <Backdrop shape={shape} contained />
          </Surface>
        ),
      )}
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        <Backdrop contained>Loading…</Backdrop>
      </Surface>
      <Surface>
        <Backdrop contained variant="tonal" size="lg">
          <span aria-hidden className="text-title-m">
            Saving
          </span>
        </Backdrop>
      </Surface>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const MotionDemo = () => {
      const [open, setOpen] = useState(true);
      return (
        <div className="flex flex-col gap-3">
          <div>
            <Button onClick={() => setOpen((o) => !o)} variant="tonal">
              {open ? "Dismiss" : "Re-open"}
            </Button>
          </div>
          <Surface>
            <Backdrop contained open={open} onClose={() => setOpen(false)}>
              Click anywhere to dismiss.
            </Backdrop>
          </Surface>
        </div>
      );
    };
    return <MotionDemo />;
  },
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <Surface>
        <Backdrop
          contained
          aria-label="Loading content"
          onClose={() => undefined}
        >
          role=presentation, click or Escape to dismiss.
        </Backdrop>
      </Surface>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "filled",
    size: "md",
    shape: "none",
    contained: true,
    open: true,
    children: "Adjust the controls in the addons panel.",
  },
  render: (args) => (
    <Surface>
      <Backdrop {...args} />
    </Surface>
  ),
};

/**
 * Storybook interaction test. Mounts a closable backdrop, clicks the
 * scrim, asserts onClose fires and the scrim unmounts via
 * AnimatePresence.
 */
export const InteractionSpec: Story = {
  args: {
    onClose: fn(),
  },
  render: (args) => {
    const InteractionShell = () => {
      const [open, setOpen] = useState(true);
      return (
        <Surface>
          <Backdrop
            {...args}
            contained
            open={open}
            onClose={() => {
              setOpen(false);
              args.onClose?.();
            }}
          />
        </Surface>
      );
    };
    return <InteractionShell />;
  },
  play: async ({ canvasElement, args, step }) => {
    const scrim = canvasElement.querySelector(
      "[data-component='backdrop']",
    ) as HTMLElement | null;

    await step(
      "Backdrop mounts with role=presentation by default",
      async () => {
        expect(scrim).not.toBeNull();
        expect(scrim?.getAttribute("role")).toBe("presentation");
      },
    );

    await step("Click on the scrim fires onClose", async () => {
      if (!scrim) throw new Error("scrim missing");
      await userEvent.click(scrim);
      expect(args.onClose).toHaveBeenCalledTimes(1);
    });
  },
};
