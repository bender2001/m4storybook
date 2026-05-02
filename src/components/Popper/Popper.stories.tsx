import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent } from "@storybook/test";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/Button";
import { Popper } from "./Popper";
import type { PopperPlacement } from "./types";

/**
 * Poppers anchor inside a positioned host. Stories pin them inside a
 * 480x280 `position: relative` surface with `contained=true` so the
 * popper doesn't escape the Storybook iframe.
 */
const Surface = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => (
  <div
    data-host="popper-surface"
    className={
      "relative h-[280px] w-[480px] overflow-hidden rounded-shape-md " +
      "bg-surface-container-low p-4 text-on-surface " +
      (className ?? "")
    }
  >
    <div className="absolute inset-4 grid place-items-center text-body-m text-on-surface-variant">
      Anchor
    </div>
    {children}
  </div>
);

const InfoGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
  </svg>
);

const ChevronGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M9 18l6-6-6-6 1.41-1.41L17.83 12l-7.42 7.41z" />
  </svg>
);

const meta: Meta<typeof Popper> = {
  title: "Utils/Popper",
  component: Popper,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Popper. Re-skins the MUI Popper API (https://mui.com/material-ui/react-popper/) onto the M3 tooltip / menu surface (https://m3.material.io/components/tooltips/specs). Five surface variants (standard / tonal / outlined / text / elevated), three density sizes, full M3 shape-token scale, leading + trailing icon + label slots, optional caret arrow that points back at the anchor edge, modifier mirrors (flip + keepInViewport) and M3 expressive motion via motion/react with placement-aware transform-origin.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["standard", "tonal", "outlined", "text", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    placement: {
      control: "select",
      options: [
        "top-start",
        "top",
        "top-end",
        "bottom-start",
        "bottom",
        "bottom-end",
        "left-start",
        "left",
        "left-end",
        "right-start",
        "right",
        "right-end",
        "center",
      ] satisfies PopperPlacement[],
    },
    open: { control: "boolean" },
    arrow: { control: "boolean" },
    flip: { control: "boolean" },
    keepInViewport: { control: "boolean" },
    contained: { control: "boolean" },
    disabled: { control: "boolean" },
    selected: { control: "boolean" },
    error: { control: "boolean" },
    dismissOnEscape: { control: "boolean" },
    dismissOnClickAway: { control: "boolean" },
    offset: { control: { type: "number", min: 0, max: 32, step: 1 } },
    arrowSize: { control: { type: "number", min: 4, max: 16, step: 1 } },
  },
  args: {
    variant: "standard",
    size: "sm",
    shape: "sm",
    placement: "bottom",
    offset: 12,
    arrow: false,
    arrowSize: 8,
    open: true,
    flip: true,
    keepInViewport: true,
    contained: true,
    disabled: false,
    selected: false,
    error: false,
    dismissOnEscape: true,
    dismissOnClickAway: false,
  },
};

export default meta;
type Story = StoryObj<typeof Popper>;

export const Default: Story = {
  render: (args) => (
    <Surface>
      <Popper {...args}>
        Default popper hint. Renders the M3 standard surface
        (surface-container-high, elevation-2, shape-sm) anchored
        below its host.
      </Popper>
    </Surface>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        <Popper variant="standard" contained>
          surface-container-high + elevation-2
        </Popper>
      </Surface>
      <Surface>
        <Popper variant="tonal" contained>
          secondary-container + elevation-1
        </Popper>
      </Surface>
      <Surface>
        <Popper variant="outlined" contained>
          Transparent surface + 1dp outline border
        </Popper>
      </Surface>
      <Surface>
        <Popper variant="text" contained>
          Transparent fill, no border, no elevation
        </Popper>
      </Surface>
      <Surface>
        <Popper variant="elevated" contained>
          surface-container-low + elevation-3
        </Popper>
      </Surface>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        <Popper size="sm" contained>
          96..224px popper
        </Popper>
      </Surface>
      <Surface>
        <Popper size="md" contained>
          144..320px rich tooltip
        </Popper>
      </Surface>
      <Surface>
        <Popper size="lg" contained>
          200..400px description popper
        </Popper>
      </Surface>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        <Popper contained>Resting popper.</Popper>
      </Surface>
      <Surface>
        <Popper contained selected>
          Selected popper paints secondary-container.
        </Popper>
      </Surface>
      <Surface>
        <Popper contained disabled>
          Disabled — dimmed to 0.38, blocks pointer events.
        </Popper>
      </Surface>
      <Surface>
        <Popper contained error>
          Error popper paints error-container.
        </Popper>
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
            <Popper shape={shape} contained>
              shape-{shape}
            </Popper>
          </Surface>
        ),
      )}
    </div>
  ),
};

export const Placements: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(
        [
          "top-start",
          "top",
          "top-end",
          "bottom-start",
          "bottom",
          "bottom-end",
          "left-start",
          "left",
          "left-end",
          "right-start",
          "right",
          "right-end",
          "center",
        ] satisfies PopperPlacement[]
      ).map((placement) => (
        <Surface key={placement}>
          <Popper contained placement={placement}>
            {placement}
          </Popper>
        </Surface>
      ))}
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        <Popper
          contained
          size="md"
          leadingIcon={<InfoGlyph />}
          label="Rich tooltip"
          trailingIcon={<ChevronGlyph />}
        >
          Leading 20dp glyph + label-l + body-m + trailing 20dp glyph.
        </Popper>
      </Surface>
      <Surface>
        <Popper contained size="md" arrow>
          Caret arrow points back at the anchor edge.
        </Popper>
      </Surface>
    </div>
  ),
};

export const Arrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(
        [
          "top",
          "bottom",
          "left",
          "right",
        ] satisfies PopperPlacement[]
      ).map((placement) => (
        <Surface key={placement}>
          <Popper contained placement={placement} arrow size="md">
            arrow / {placement}
          </Popper>
        </Surface>
      ))}
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
            <Button onClick={() => setOpen((o) => !o)} color="tonal">
              {open ? "Dismiss" : "Re-open"}
            </Button>
          </div>
          <Surface>
            <Popper
              contained
              open={open}
              size="md"
              arrow
              onClose={() => setOpen(false)}
              label="Motion preview"
            >
              Surface scales 96% -&gt; 100% on enter, anchored to the
              bottom edge of the host. Container transitions ride
              medium2/emphasized.
            </Popper>
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
        <Popper
          contained
          size="md"
          ariaLabel="Accessible popper"
          onClose={() => undefined}
        >
          role=tooltip with aria-describedby auto-wired into the body
          slot id. Escape fires onDismiss; reduced-motion collapses
          the surface scale.
        </Popper>
      </Surface>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "standard",
    size: "sm",
    shape: "sm",
    placement: "bottom",
    contained: true,
    open: true,
    arrow: true,
  },
  render: (args) => (
    <Surface>
      <Popper {...args} label="Playground">
        Adjust the controls in the addons panel.
      </Popper>
    </Surface>
  ),
};

/**
 * Storybook interaction test. Mounts a closable popper and asserts
 * Escape fires onClose + onDismiss('escape').
 */
export const InteractionSpec: Story = {
  args: {
    onClose: fn(),
    onDismiss: fn(),
  },
  render: (args) => {
    const InteractionShell = () => {
      const [open, setOpen] = useState(true);
      return (
        <Surface>
          <Popper
            {...args}
            contained
            open={open}
            size="md"
            onClose={() => {
              setOpen(false);
              args.onClose?.();
            }}
            onDismiss={(source) => {
              args.onDismiss?.(source);
            }}
            label="Interaction spec"
          >
            Press Escape to dismiss.
          </Popper>
        </Surface>
      );
    };
    return <InteractionShell />;
  },
  play: async ({ canvasElement, args, step }) => {
    const popper = canvasElement.querySelector(
      "[data-component='popper']",
    ) as HTMLElement | null;

    await step(
      "Popper mounts with role=tooltip + auto-described body id",
      async () => {
        expect(popper).not.toBeNull();
        expect(popper?.getAttribute("role")).toBe("tooltip");
        const described = popper?.getAttribute("aria-describedby");
        expect(described).toBeTruthy();
        const body = canvasElement.querySelector(
          "[data-slot='content']",
        ) as HTMLElement | null;
        expect(body?.id).toBe(described);
      },
    );

    await step(
      "Escape fires onClose + onDismiss('escape')",
      async () => {
        if (!popper) throw new Error("popper missing");
        popper.focus();
        await userEvent.keyboard("{Escape}");
        expect(args.onClose).toHaveBeenCalled();
        expect(args.onDismiss).toHaveBeenCalledWith("escape");
      },
    );
  },
};
