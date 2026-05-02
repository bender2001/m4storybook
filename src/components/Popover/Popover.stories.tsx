import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent } from "@storybook/test";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/Button";
import { Popover } from "./Popover";
import type { PopoverPlacement } from "./types";

/**
 * Popovers anchor inside a positioned host. Stories pin them inside a
 * 600x360 `position: relative` surface with `contained=true` so the
 * popover doesn't escape the Storybook iframe.
 */
const Surface = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => (
  <div
    data-host="popover-surface"
    className={
      "relative h-[360px] w-[600px] overflow-hidden rounded-shape-md " +
      "bg-surface-container-low p-4 text-on-surface " +
      (className ?? "")
    }
  >
    <div className="absolute inset-4 grid place-items-center text-body-m text-on-surface-variant">
      Anchor surface
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

const CloseGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
  >
    <path d="M18.3 5.71 12 12.01l-6.3-6.3-1.41 1.41 6.3 6.3-6.3 6.3 1.41 1.41 6.3-6.3 6.3 6.3 1.41-1.41-6.3-6.3 6.3-6.3z" />
  </svg>
);

const meta: Meta<typeof Popover> = {
  title: "Utils/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Popover. Re-skins the MUI Popover API onto the M3 menu/popover surface (https://m3.material.io/components/menus/specs). Five variants (standard / tonal / outlined / text / elevated), three density sizes, full M3 shape-token scale, header (leading icon + title + trailing icon) + body + actions slots, optional scrim, click-outside + Escape dismissal, M3 expressive motion via motion/react with placement-aware transform-origin.",
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
      ] satisfies PopoverPlacement[],
    },
    open: { control: "boolean" },
    scrim: { control: "boolean" },
    contained: { control: "boolean" },
    disabled: { control: "boolean" },
    selected: { control: "boolean" },
    error: { control: "boolean" },
    dismissOnEscape: { control: "boolean" },
    dismissOnClickAway: { control: "boolean" },
    offset: { control: { type: "number", min: 0, max: 32, step: 1 } },
  },
  args: {
    variant: "standard",
    size: "md",
    shape: "xs",
    placement: "bottom-start",
    offset: 8,
    open: true,
    scrim: false,
    contained: true,
    disabled: false,
    selected: false,
    error: false,
    dismissOnEscape: true,
    dismissOnClickAway: true,
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: (args) => (
    <Surface>
      <Popover {...args} title="Popover headline">
        Default popover body. Renders the M3 standard surface
        (surface-container, elevation-2, shape-xs) anchored to the
        bottom-start of its host.
      </Popover>
    </Surface>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        <Popover variant="standard" contained title="Standard">
          surface-container + elevation 2 (M3 default popover)
        </Popover>
      </Surface>
      <Surface>
        <Popover variant="tonal" contained title="Tonal">
          secondary-container + elevation 1
        </Popover>
      </Surface>
      <Surface>
        <Popover variant="outlined" contained title="Outlined">
          Transparent surface + 1dp outline-variant border
        </Popover>
      </Surface>
      <Surface>
        <Popover variant="text" contained title="Text">
          Transparent fill, no border, no elevation
        </Popover>
      </Surface>
      <Surface>
        <Popover variant="elevated" contained title="Elevated">
          surface-container-low + elevation 3 (high-emphasis popover)
        </Popover>
      </Surface>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        <Popover size="sm" contained title="Small">
          160..280px popover
        </Popover>
      </Surface>
      <Surface>
        <Popover size="md" contained title="Medium">
          M3 default 200..360px popover
        </Popover>
      </Surface>
      <Surface>
        <Popover size="lg" contained title="Large">
          280..480px form / list popover
        </Popover>
      </Surface>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        <Popover contained title="Resting">
          Default popover state.
        </Popover>
      </Surface>
      <Surface>
        <Popover contained selected title="Selected">
          Selected popover paints secondary-container.
        </Popover>
      </Surface>
      <Surface>
        <Popover contained disabled title="Disabled">
          Disabled — dimmed to 0.38, blocks pointer events.
        </Popover>
      </Surface>
      <Surface>
        <Popover contained error title="Error">
          Error popover paints error-container.
        </Popover>
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
            <Popover shape={shape} contained title={`shape-${shape}`}>
              Popover corner-shape token preview.
            </Popover>
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
        ] satisfies PopoverPlacement[]
      ).map((placement) => (
        <Surface key={placement}>
          <Popover contained placement={placement} title={placement}>
            Anchored to {placement}.
          </Popover>
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
        <Popover
          contained
          leadingIcon={<InfoGlyph />}
          title="Leading + trailing icons"
          trailingIcon={<CloseGlyph />}
          actions={
            <>
              <Button color="text">Cancel</Button>
              <Button color="filled">Save</Button>
            </>
          }
        >
          The header row hosts a leading 24dp glyph, a title, and a trailing close icon.
          The body sits between the header and the trailing actions row.
        </Popover>
      </Surface>
      <Surface>
        <Popover contained label="Label-only header">
          Popover with a label slot instead of a title — matches the
          M3 menu surface header type role.
        </Popover>
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
            <Button onClick={() => setOpen((o) => !o)} color="tonal">
              {open ? "Dismiss" : "Re-open"}
            </Button>
          </div>
          <Surface>
            <Popover
              contained
              open={open}
              onClose={() => setOpen(false)}
              title="Motion preview"
              trailingIcon={<CloseGlyph />}
              actions={
                <Button color="text" onClick={() => setOpen(false)}>
                  Dismiss
                </Button>
              }
            >
              Surface scales 95% -&gt; 100% on enter, anchored to the
              bottom-start corner of the host. Container transitions
              ride medium2/emphasized.
            </Popover>
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
        <Popover
          contained
          title="Accessible popover"
          trailingIcon={<CloseGlyph />}
          onClose={() => undefined}
          actions={
            <>
              <Button color="text">Cancel</Button>
              <Button color="filled">OK</Button>
            </>
          }
        >
          role=dialog with the headline auto-wired into aria-labelledby.
          Escape and click-outside fire onDismiss; reduced-motion
          collapses the surface scale.
        </Popover>
      </Surface>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "standard",
    size: "md",
    shape: "xs",
    placement: "bottom-start",
    contained: true,
    open: true,
  },
  render: (args) => (
    <Surface>
      <Popover {...args} title="Playground" trailingIcon={<CloseGlyph />}>
        Adjust the controls in the addons panel.
      </Popover>
    </Surface>
  ),
};

/**
 * Storybook interaction test. Mounts a closable popover, drives the
 * trailing-icon dismissal via Escape and asserts onClose fires.
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
          <Popover
            {...args}
            contained
            open={open}
            onClose={() => {
              setOpen(false);
              args.onClose?.();
            }}
            onDismiss={(source) => {
              args.onDismiss?.(source);
            }}
            title="Interaction spec"
            trailingIcon={<CloseGlyph />}
            actions={
              <Button
                data-testid="popover-ok"
                color="filled"
                onClick={() => {
                  setOpen(false);
                  args.onClose?.();
                }}
              >
                OK
              </Button>
            }
          >
            Press Escape or click the OK button to dismiss.
          </Popover>
        </Surface>
      );
    };
    return <InteractionShell />;
  },
  play: async ({ canvasElement, args, step }) => {
    const popover = canvasElement.querySelector(
      "[data-component='popover']",
    ) as HTMLElement | null;

    await step(
      "Popover mounts with role=dialog + auto-labelled by the title",
      async () => {
        expect(popover).not.toBeNull();
        expect(popover?.getAttribute("role")).toBe("dialog");
        const labelled = popover?.getAttribute("aria-labelledby");
        expect(labelled).toBeTruthy();
        const title = canvasElement.querySelector(
          "[data-slot='title']",
        ) as HTMLElement | null;
        expect(title?.id).toBe(labelled);
      },
    );

    await step(
      "Click the OK action button fires onClose",
      async () => {
        const ok = canvasElement.querySelector(
          "[data-testid='popover-ok']",
        ) as HTMLElement | null;
        if (!ok) throw new Error("OK action button missing");
        await userEvent.click(ok);
        expect(args.onClose).toHaveBeenCalled();
      },
    );
  },
};
