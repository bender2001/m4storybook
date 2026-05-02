import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent } from "@storybook/test";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/Button";
import { Portal } from "./Portal";

/**
 * Stories pin the portal target to a positioned host inside the
 * Storybook canvas so screenshots stay deterministic. The host is
 * exposed via a state-bound callback ref; until the host commits
 * Portal renders nothing, then teleports the surface in.
 */
const Surface = ({
  children,
  className,
}: {
  children: (host: HTMLElement | null) => ReactNode;
  className?: string;
}) => {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setHost}
      data-host="portal-surface"
      className={
        "relative grid h-[280px] w-[480px] place-items-center overflow-hidden rounded-shape-md " +
        "bg-surface-container-low p-4 text-on-surface " +
        (className ?? "")
      }
    >
      {children(host)}
    </div>
  );
};

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

const meta: Meta<typeof Portal> = {
  title: "Utils/Portal",
  component: Portal,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Portal. Re-skins the MUI Portal API (https://mui.com/material-ui/react-portal/) onto an M3 surface (https://m3.material.io/styles/elevation/applying-elevation). Portal teleports children into a target container (defaults to document.body) and is the structural primitive that powers Modal / Dialog / Snackbar / Menu containers. Five surface variants (standard / tonal / outlined / text / elevated), three density sizes, full M3 shape-token scale, leading + trailing icon + label slots, optional disablePortal escape hatch and M3 expressive motion via motion/react.",
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
    open: { control: "boolean" },
    disablePortal: { control: "boolean" },
    surface: { control: "boolean" },
    disabled: { control: "boolean" },
    selected: { control: "boolean" },
    error: { control: "boolean" },
    dismissOnEscape: { control: "boolean" },
    dismissOnClickAway: { control: "boolean" },
  },
  args: {
    variant: "standard",
    size: "md",
    shape: "md",
    open: true,
    disablePortal: false,
    surface: true,
    disabled: false,
    selected: false,
    error: false,
    dismissOnEscape: true,
    dismissOnClickAway: false,
  },
};

export default meta;
type Story = StoryObj<typeof Portal>;

export const Default: Story = {
  render: (args) => (
    <Surface>
      {(host) => (
        <Portal {...args} container={host}>
          Default portal panel. Renders the M3 standard surface
          (surface-container-highest, elevation-1, shape-md) teleported
          into the host container.
        </Portal>
      )}
    </Surface>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        {(host) => (
          <Portal variant="standard" container={host}>
            surface-container-highest + elevation-1
          </Portal>
        )}
      </Surface>
      <Surface>
        {(host) => (
          <Portal variant="tonal" container={host}>
            secondary-container + elevation-1
          </Portal>
        )}
      </Surface>
      <Surface>
        {(host) => (
          <Portal variant="outlined" container={host}>
            Transparent surface + 1dp outline border
          </Portal>
        )}
      </Surface>
      <Surface>
        {(host) => (
          <Portal variant="text" container={host}>
            Transparent fill, no border, no elevation
          </Portal>
        )}
      </Surface>
      <Surface>
        {(host) => (
          <Portal variant="elevated" container={host}>
            surface-container-low + elevation-3
          </Portal>
        )}
      </Surface>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        {(host) => (
          <Portal size="sm" container={host}>
            160..320px portal
          </Portal>
        )}
      </Surface>
      <Surface>
        {(host) => (
          <Portal size="md" container={host}>
            240..480px modal-band portal
          </Portal>
        )}
      </Surface>
      <Surface>
        {(host) => (
          <Portal size="lg" container={host}>
            320..640px wide hovercard portal
          </Portal>
        )}
      </Surface>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        {(host) => <Portal container={host}>Resting portal.</Portal>}
      </Surface>
      <Surface>
        {(host) => (
          <Portal container={host} selected>
            Selected portal paints secondary-container.
          </Portal>
        )}
      </Surface>
      <Surface>
        {(host) => (
          <Portal container={host} disabled>
            Disabled — dimmed to 0.38, blocks pointer events.
          </Portal>
        )}
      </Surface>
      <Surface>
        {(host) => (
          <Portal container={host} error>
            Error portal paints error-container.
          </Portal>
        )}
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
            {(host) => (
              <Portal shape={shape} container={host}>
                shape-{shape}
              </Portal>
            )}
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
        {(host) => (
          <Portal
            container={host}
            size="md"
            leadingIcon={<InfoGlyph />}
            label="Slot demo"
            trailingIcon={<ChevronGlyph />}
          >
            Leading 24dp glyph + label-l + body-m + trailing 24dp glyph.
          </Portal>
        )}
      </Surface>
      <Surface>
        {(host) => (
          <Portal container={host} size="md" label="Label-only header">
            Body content with a label-l header above it.
          </Portal>
        )}
      </Surface>
    </div>
  ),
};

export const InlineMode: Story = {
  name: "Inline (disablePortal)",
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      data-host="portal-inline"
      className="flex flex-wrap gap-4 rounded-shape-md bg-surface-container-low p-4"
    >
      <Portal disablePortal size="sm" data-mode="inline">
        Inline rendering — disablePortal skips createPortal and mounts
        the surface at the parent.
      </Portal>
    </div>
  ),
};

export const RawTeleport: Story = {
  name: "Raw teleport (surface=false)",
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      {(host) => (
        <Portal container={host} surface={false}>
          <div data-mode="raw" className="text-body-m text-on-surface-variant">
            surface=false skips the M3 wrapper and teleports raw
            children — Portal collapses back to the MUI primitive.
          </div>
        </Portal>
      )}
    </Surface>
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
            {(host) => (
              <Portal
                container={host}
                open={open}
                size="md"
                onClose={() => setOpen(false)}
                label="Motion preview"
              >
                Surface scales 96% -&gt; 100% on enter and back to 96%
                on exit. Container transitions ride medium2/emphasized.
              </Portal>
            )}
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
        {(host) => (
          <Portal
            container={host}
            size="md"
            ariaLabel="Accessible portal"
            onClose={() => undefined}
          >
            role=presentation with aria-describedby auto-wired into the
            body slot id. Escape fires onDismiss; reduced-motion
            collapses the surface scale.
          </Portal>
        )}
      </Surface>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "standard",
    size: "md",
    shape: "md",
    open: true,
    disablePortal: false,
    surface: true,
  },
  render: (args) => (
    <Surface>
      {(host) => (
        <Portal {...args} container={host} label="Playground">
          Adjust the controls in the addons panel.
        </Portal>
      )}
    </Surface>
  ),
};

/**
 * Storybook interaction test. Mounts a closable portal and asserts
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
          {(host) => (
            <Portal
              {...args}
              container={host}
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
            </Portal>
          )}
        </Surface>
      );
    };
    return <InteractionShell />;
  },
  play: async ({ canvasElement, args, step }) => {
    // Portal teleports out of canvasElement, so query against the
    // surrounding document.
    const doc = canvasElement.ownerDocument;
    const portal = doc.querySelector(
      "[data-component='portal']",
    ) as HTMLElement | null;

    await step(
      "Portal mounts with role=presentation + auto-described body id",
      async () => {
        expect(portal).not.toBeNull();
        expect(portal?.getAttribute("role")).toBe("presentation");
        const described = portal?.getAttribute("aria-describedby");
        expect(described).toBeTruthy();
        const body = doc.querySelector(
          "[data-slot='content']",
        ) as HTMLElement | null;
        expect(body?.id).toBe(described);
      },
    );

    await step(
      "Escape fires onClose + onDismiss('escape')",
      async () => {
        if (!portal) throw new Error("portal missing");
        portal.focus();
        await userEvent.keyboard("{Escape}");
        expect(args.onClose).toHaveBeenCalled();
        expect(args.onDismiss).toHaveBeenCalledWith("escape");
      },
    );
  },
};
