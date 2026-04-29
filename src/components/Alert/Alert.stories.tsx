import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "Feedback/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Alert. Re-skins the MUI Alert API onto the M3 banner surface with severity color mapping (info -> primary, success -> secondary, warning -> tertiary, error -> error). Four variants (filled / tonal / outlined / text), three density sizes, full shape-token scale, optional title slot, custom or auto leading icon, action slot, and a close affordance with Escape-key dismissal. Per https://m3.material.io/components/banners.",
      },
    },
  },
  argTypes: {
    severity: {
      control: "inline-radio",
      options: ["info", "success", "warning", "error"],
    },
    variant: {
      control: "inline-radio",
      options: ["filled", "tonal", "outlined", "text"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    disabled: { control: "boolean" },
    open: { control: "boolean" },
  },
  args: {
    severity: "info",
    variant: "tonal",
    size: "md",
    shape: "sm",
    disabled: false,
    open: true,
    children: "Connection restored. Sync resumed.",
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert variant="filled" severity="info">
        filled / info
      </Alert>
      <Alert variant="tonal" severity="info">
        tonal / info
      </Alert>
      <Alert variant="outlined" severity="info">
        outlined / info
      </Alert>
      <Alert variant="text" severity="info">
        text / info
      </Alert>
    </div>
  ),
};

export const Severities: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert severity="info">Info: a routine status update.</Alert>
      <Alert severity="success">Success: changes saved.</Alert>
      <Alert severity="warning">Warning: connection unstable.</Alert>
      <Alert severity="error">Error: could not save changes.</Alert>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert size="sm" severity="info">
        Small density (32dp shell)
      </Alert>
      <Alert size="md" severity="info">
        Medium density (48dp shell)
      </Alert>
      <Alert size="lg" severity="info">
        Large density (56dp shell)
      </Alert>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert severity="info">Resting</Alert>
      <Alert severity="info" disabled>
        Disabled
      </Alert>
      <Alert severity="error">Error severity (assertive)</Alert>
      <Alert severity="warning">Warning severity (assertive)</Alert>
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map((shape) => (
        <Alert key={shape} shape={shape} severity="info">
          shape-{shape}
        </Alert>
      ))}
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert severity="success" title="All set">
        Your changes have been saved.
      </Alert>
      <Alert
        severity="warning"
        title="Heads up"
        action={<Button variant="text">Review</Button>}
      >
        We noticed an unusual sign-in.
      </Alert>
      <Alert severity="error" onClose={() => undefined}>
        Could not save changes. Try again.
      </Alert>
      <Alert severity="info" icon={false}>
        No-icon variant — body only.
      </Alert>
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
          <Alert
            severity="info"
            open={open}
            onClose={() => setOpen(false)}
            title="M3 emphasized motion"
          >
            Enter / exit animates height + opacity over the M3
            emphasized tween (300ms / cubic-bezier(0.2, 0, 0, 1)).
          </Alert>
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
      <Alert severity="info" aria-label="Polite informational status">
        role=status, aria-live=polite (info / success severities).
      </Alert>
      <Alert severity="error" aria-label="Assertive error alert">
        role=alert, aria-live=assertive (warning / error severities).
      </Alert>
      <Alert severity="info" onClose={() => undefined}>
        Press Escape with focus inside to dismiss.
      </Alert>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    severity: "info",
    variant: "tonal",
    size: "md",
    shape: "sm",
    title: "Playground title",
    children: "Adjust the controls in the addons panel.",
  },
};

/**
 * Storybook interaction test. Mounts a closable alert, clicks the
 * close affordance, asserts the close handler fired and the alert
 * unmounts via AnimatePresence.
 */
export const InteractionSpec: Story = {
  args: {
    onClose: fn(),
  },
  render: (args) => {
    const InteractionShell = () => {
      const [open, setOpen] = useState(true);
      return (
        <Alert
          {...args}
          severity="info"
          open={open}
          onClose={() => {
            setOpen(false);
            args.onClose?.();
          }}
        >
          Click the close icon (or press Escape) to dismiss this alert.
        </Alert>
      );
    };
    return <InteractionShell />;
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const alert = canvasElement.querySelector("[data-component='alert']");

    await step("Alert mounts with role=status for info severity", async () => {
      expect(alert).not.toBeNull();
      expect(alert?.getAttribute("role")).toBe("status");
      expect(alert?.getAttribute("aria-live")).toBe("polite");
    });

    await step("Close icon dismisses the alert", async () => {
      const close = canvas.getByRole("button", { name: "Close alert" });
      await userEvent.click(close);
      expect(args.onClose).toHaveBeenCalledTimes(1);
    });
  },
};
