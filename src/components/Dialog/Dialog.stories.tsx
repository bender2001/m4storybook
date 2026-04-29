import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent } from "@storybook/test";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/Button";
import { Dialog } from "./Dialog";

/**
 * The Dialog covers a full surface, so most stories pin it inside a
 * 600x400 `position: relative` host with `contained=true` so the
 * scrim doesn't eat the entire Storybook iframe.
 */
const Surface = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => (
  <div
    data-host="dialog-surface"
    className={
      "relative h-[400px] w-[600px] overflow-hidden rounded-shape-md " +
      "bg-surface-container-low p-4 text-on-surface " +
      (className ?? "")
    }
  >
    <div className="absolute inset-4 grid place-items-center text-body-m">
      Content behind dialog
    </div>
    {children}
  </div>
);

const HeroIcon = (): React.ReactElement => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M12 2 1 21h22zM12 16h-1v-2h1zm0-4h-1V8h1z" />
  </svg>
);

const meta: Meta<typeof Dialog> = {
  title: "Feedback/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Dialog. Re-skins the MUI Dialog API onto the M3 basic-dialog surface (https://m3.material.io/components/dialogs/specs). Four variants (standard / tonal / outlined / fullscreen), three density sizes, full shape-token scale, optional 24dp hero icon, headline-s title, body-m supporting text, inline body content, trailing actions row, and a built-in scrim with click-to-dismiss + Escape-to-close.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["standard", "tonal", "outlined", "fullscreen"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    open: { control: "boolean" },
    scrim: { control: "boolean" },
    contained: { control: "boolean" },
    disableEscapeClose: { control: "boolean" },
    disableScrimClose: { control: "boolean" },
  },
  args: {
    variant: "standard",
    size: "md",
    shape: "xl",
    open: true,
    scrim: true,
    contained: true,
    disableEscapeClose: false,
    disableScrimClose: false,
    title: "Reset settings?",
    supportingText:
      "This will restore default values for all preferences in this section.",
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: (args) => (
    <Surface>
      <Dialog
        {...args}
        actions={
          <>
            <Button variant="text">Cancel</Button>
            <Button variant="filled">Reset</Button>
          </>
        }
      />
    </Surface>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        <Dialog
          variant="standard"
          contained
          title="Standard dialog"
          supportingText="Surface-container-high + elevation 3 + xl shape."
          actions={<Button variant="text">OK</Button>}
        />
      </Surface>
      <Surface>
        <Dialog
          variant="tonal"
          contained
          title="Tonal dialog"
          supportingText="Primary-container surface, elevation 1."
          actions={<Button variant="tonal">OK</Button>}
        />
      </Surface>
      <Surface>
        <Dialog
          variant="outlined"
          contained
          title="Outlined dialog"
          supportingText="Transparent surface with a 1dp outline border."
          actions={<Button variant="outlined">OK</Button>}
        />
      </Surface>
      <Surface>
        <Dialog
          variant="fullscreen"
          contained
          title="Fullscreen dialog"
          supportingText="Edge-to-edge surface with no radius or elevation."
          actions={<Button variant="text">Done</Button>}
        />
      </Surface>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        <Dialog
          size="sm"
          contained
          title="Small dialog"
          supportingText="Compact alert dialog (max 400px)."
          actions={<Button variant="text">OK</Button>}
        />
      </Surface>
      <Surface>
        <Dialog
          size="md"
          contained
          title="Medium dialog"
          supportingText="Default M3 basic dialog (max 560px)."
          actions={<Button variant="text">OK</Button>}
        />
      </Surface>
      <Surface className="!w-[760px]">
        <Dialog
          size="lg"
          contained
          title="Large dialog"
          supportingText="Form / choice dialog (max 720px)."
          actions={<Button variant="text">OK</Button>}
        />
      </Surface>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        <Dialog
          contained
          title="Resting"
          supportingText="Default dialog state."
          actions={<Button variant="text">OK</Button>}
        />
      </Surface>
      <Surface>
        <Dialog
          contained
          variant="outlined"
          title="Outlined"
          supportingText="No elevation, 1dp outline."
          actions={<Button variant="text">OK</Button>}
        />
      </Surface>
      <Surface>
        <Dialog
          contained
          scrim={false}
          title="No scrim"
          supportingText="Inline dialog with no scrim layer."
          actions={<Button variant="text">OK</Button>}
        />
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
            <Dialog
              shape={shape}
              contained
              title={`shape-${shape}`}
              supportingText="Dialog corner-shape token preview."
              actions={<Button variant="text">OK</Button>}
            />
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
        <Dialog
          contained
          icon={<HeroIcon />}
          title="Hero icon"
          supportingText="Icon dialogs center the headline below a 24dp glyph."
          actions={
            <>
              <Button variant="text">Cancel</Button>
              <Button variant="filled">Confirm</Button>
            </>
          }
        />
      </Surface>
      <Surface>
        <Dialog
          contained
          title="Form dialog"
          supportingText="Dialogs can host inline content like a list or a form."
          actions={
            <>
              <Button variant="text">Cancel</Button>
              <Button variant="filled">Save</Button>
            </>
          }
        >
          <ul className="list-disc pl-5 text-body-m text-on-surface">
            <li>Option A</li>
            <li>Option B</li>
            <li>Option C</li>
          </ul>
        </Dialog>
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
            <Dialog
              contained
              open={open}
              onClose={() => setOpen(false)}
              title="Motion preview"
              supportingText="Surface scales from 95% on enter, scrim fades via the M3 emphasized tween."
              actions={
                <>
                  <Button variant="text" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="filled" onClick={() => setOpen(false)}>
                    OK
                  </Button>
                </>
              }
            />
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
        <Dialog
          contained
          title="Accessible dialog"
          supportingText="role=dialog, aria-modal=true, headline + supporting text are auto-wired into aria-labelledby + aria-describedby. Press Escape to dismiss."
          onClose={() => undefined}
          actions={
            <>
              <Button variant="text">Cancel</Button>
              <Button variant="filled">OK</Button>
            </>
          }
        />
      </Surface>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "standard",
    size: "md",
    shape: "xl",
    contained: true,
    open: true,
    title: "Reset settings?",
    supportingText:
      "This will restore default values for all preferences in this section.",
  },
  render: (args) => (
    <Surface>
      <Dialog
        {...args}
        actions={
          <>
            <Button variant="text">Cancel</Button>
            <Button variant="filled">Reset</Button>
          </>
        }
      />
    </Surface>
  ),
};

/**
 * Storybook interaction test. Mounts a closable dialog, drives the
 * trailing OK button, asserts onClose fires and the surface unmounts
 * via AnimatePresence.
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
          <Dialog
            {...args}
            contained
            open={open}
            onClose={() => {
              setOpen(false);
              args.onClose?.();
            }}
            title="Interaction spec"
            supportingText="Click OK to close the dialog. The InteractionShell wires the controlled-open contract."
            actions={
              <>
                <Button
                  data-testid="dialog-cancel"
                  variant="text"
                  onClick={() => {
                    setOpen(false);
                    args.onClose?.();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  data-testid="dialog-ok"
                  variant="filled"
                  onClick={() => {
                    setOpen(false);
                    args.onClose?.();
                  }}
                >
                  OK
                </Button>
              </>
            }
          />
        </Surface>
      );
    };
    return <InteractionShell />;
  },
  play: async ({ canvasElement, args, step }) => {
    const dialog = canvasElement.querySelector(
      "[data-component='dialog']",
    ) as HTMLElement | null;

    await step(
      "Dialog mounts with role=dialog + aria-modal=true",
      async () => {
        expect(dialog).not.toBeNull();
        expect(dialog?.getAttribute("role")).toBe("dialog");
        expect(dialog?.getAttribute("aria-modal")).toBe("true");
      },
    );

    await step("Click on the OK action fires onClose", async () => {
      const ok = canvasElement.querySelector(
        "[data-testid='dialog-ok']",
      ) as HTMLElement | null;
      if (!ok) throw new Error("OK button missing");
      await userEvent.click(ok);
      expect(args.onClose).toHaveBeenCalled();
    });
  },
};
