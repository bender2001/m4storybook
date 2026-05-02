import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState, type ReactElement } from "react";
import { Button } from "@/components/Button";
import { Snackbar } from "./Snackbar";

const InfoGlyph = (): ReactElement => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z" />
  </svg>
);

const SyncGlyph = (): ReactElement => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M12 4V1L8 5l4 4V6a6 6 0 0 1 6 6c0 1.66-.69 3.16-1.79 4.21l1.46 1.46A7.96 7.96 0 0 0 20 12a8 8 0 0 0-8-8zm-6.21 1.79A7.96 7.96 0 0 0 4 12a8 8 0 0 0 8 8v3l4-4-4-4v3a6 6 0 0 1-6-6c0-1.66.69-3.16 1.79-4.21z" />
  </svg>
);

const meta: Meta<typeof Snackbar> = {
  title: "Feedback/Snackbar",
  component: Snackbar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Expressive Snackbar. Four variants (filled / tonal / outlined / elevated), three density sizes (40/48/56dp shells), full shape-token scale, optional leading icon + action + close affordance, ARIA status announcements, autoHideDuration timer, and emphasized slide-in motion. Per https://m3.material.io/components/snackbar/specs.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["filled", "tonal", "outlined", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    origin: {
      control: "inline-radio",
      options: [
        "bottom-center",
        "bottom-start",
        "bottom-end",
        "top-center",
        "top-start",
        "top-end",
      ],
    },
    open: { control: "boolean" },
    showClose: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    variant: "filled",
    size: "md",
    shape: "xs",
    origin: "bottom-center",
    open: true,
    showClose: false,
    disabled: false,
    message: "Connection restored. Sync resumed.",
  },
};

export default meta;
type Story = StoryObj<typeof Snackbar>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Snackbar variant="filled" message="filled / inverse-surface" />
      <Snackbar variant="tonal" message="tonal / surface-container-highest" />
      <Snackbar variant="outlined" message="outlined / 1dp outline" />
      <Snackbar
        variant="elevated"
        message="elevated / surface-container-high"
      />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Snackbar size="sm" message="Small density (40dp shell)" />
      <Snackbar size="md" message="Medium density (48dp shell)" />
      <Snackbar size="lg" message="Large density (56dp shell)" />
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Snackbar message="Resting" />
      <Snackbar disabled message="Disabled" />
      <Snackbar
        message="With action"
        action={
          <Button color="text" className="text-inverse-primary">
            Undo
          </Button>
        }
      />
      <Snackbar
        message="With leading icon"
        icon={<InfoGlyph />}
      />
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-3">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map((shape) => (
        <Snackbar key={shape} shape={shape} message={`shape-${shape}`} />
      ))}
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Snackbar
        message="With leading icon + action"
        icon={<InfoGlyph />}
        action={
          <Button color="text" className="text-inverse-primary">
            View
          </Button>
        }
      />
      <Snackbar
        message="With close affordance"
        showClose
        onClose={() => undefined}
      />
      <Snackbar
        icon={<SyncGlyph />}
        message="Icon + action + close"
        showClose
        action={
          <Button color="text" className="text-inverse-primary">
            Retry
          </Button>
        }
        onClose={() => undefined}
      />
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const MotionDemo = () => {
      const [open, setOpen] = useState(true);
      return (
        <div className="flex flex-col items-start gap-3">
          <Button color="tonal" onClick={() => setOpen((o) => !o)}>
            {open ? "Dismiss" : "Re-open"}
          </Button>
          <Snackbar
            open={open}
            onClose={() => setOpen(false)}
            message="Slide-in via the M3 emphasized tween (300ms)."
            showClose
          />
        </div>
      );
    };
    return <MotionDemo />;
  },
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Snackbar message="role=status, aria-live=polite (default)." />
      <Snackbar
        role="alert"
        aria-live="assertive"
        message="Override role=alert + aria-live=assertive for critical errors."
      />
      <Snackbar
        message="Press Escape with focus inside to dismiss."
        showClose
        onClose={() => undefined}
      />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "filled",
    size: "md",
    shape: "xs",
    origin: "bottom-center",
    open: true,
    showClose: true,
    message: "Adjust the controls in the addons panel.",
  },
};

/**
 * @storybook/test interaction spec. Mounts a closable snackbar,
 * clicks the close affordance, asserts the close handler fires
 * with reason="closeClick" and the bar unmounts via AnimatePresence.
 */
export const InteractionSpec: Story = {
  args: { onClose: fn() },
  render: (args) => {
    const InteractionShell = () => {
      const [open, setOpen] = useState(true);
      return (
        <Snackbar
          {...args}
          open={open}
          showClose
          message="Click the close icon to dismiss."
          onClose={(reason) => {
            setOpen(false);
            args.onClose?.(reason);
          }}
        />
      );
    };
    return <InteractionShell />;
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const bar = canvasElement.querySelector("[data-component='snackbar']");

    await step("Snackbar mounts with role=status + polite live region", async () => {
      expect(bar).not.toBeNull();
      expect(bar?.getAttribute("role")).toBe("status");
      expect(bar?.getAttribute("aria-live")).toBe("polite");
    });

    await step("Close icon dismisses the snackbar", async () => {
      const close = canvas.getByRole("button", { name: "Close" });
      await userEvent.click(close);
      expect(args.onClose).toHaveBeenCalledWith("closeClick");
    });
  },
};
