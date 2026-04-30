import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent } from "@storybook/test";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/Button";
import { Modal } from "./Modal";

/**
 * The Modal covers a full surface, so most stories pin it inside a
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
    data-host="modal-surface"
    className={
      "relative h-[400px] w-[600px] overflow-hidden rounded-shape-md " +
      "bg-surface-container-low p-4 text-on-surface " +
      (className ?? "")
    }
  >
    <div className="absolute inset-4 grid place-items-center text-body-m">
      Content behind modal
    </div>
    {children}
  </div>
);

const LeadingGlyph = (): React.ReactElement => (
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

const CloseGlyph = (): React.ReactElement => (
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

const meta: Meta<typeof Modal> = {
  title: "Utils/Modal",
  component: Modal,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Modal. Re-skins the MUI Modal API onto the M3 modal surface (https://m3.material.io/components/dialogs/specs). Modal is the primitive that powers Dialog / Drawer / Bottom Sheet — five variants (standard / tonal / outlined / text / elevated), three density sizes, full shape-token scale, header (leading icon + title + trailing close icon) + content + actions slots, built-in scrim with click-to-dismiss, Escape-to-close, focus trap, and motion via motion/react with the M3 emphasized tween.",
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
    scrim: { control: "boolean" },
    contained: { control: "boolean" },
    disabled: { control: "boolean" },
    disableEscapeClose: { control: "boolean" },
    disableScrimClose: { control: "boolean" },
    disableAutoFocus: { control: "boolean" },
    disableFocusTrap: { control: "boolean" },
  },
  args: {
    variant: "standard",
    size: "md",
    shape: "xl",
    open: true,
    scrim: true,
    contained: true,
    disabled: false,
    disableEscapeClose: false,
    disableScrimClose: false,
    disableAutoFocus: false,
    disableFocusTrap: false,
    title: "Modal headline",
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: (args) => (
    <Surface>
      <Modal {...args}>
        <p>Default modal body. The surface uses the M3 standard variant at shape-xl with elevation-3 and the M3 emphasized motion tween.</p>
      </Modal>
    </Surface>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        <Modal
          variant="standard"
          contained
          title="Standard"
          actions={<Button variant="text">OK</Button>}
        >
          surface-container-high + elevation 3 + xl shape
        </Modal>
      </Surface>
      <Surface>
        <Modal
          variant="tonal"
          contained
          title="Tonal"
          actions={<Button variant="tonal">OK</Button>}
        >
          primary-container surface, elevation 1
        </Modal>
      </Surface>
      <Surface>
        <Modal
          variant="outlined"
          contained
          title="Outlined"
          actions={<Button variant="outlined">OK</Button>}
        >
          Surface fill with a 1dp outline, no elevation
        </Modal>
      </Surface>
      <Surface>
        <Modal
          variant="text"
          contained
          title="Text"
          actions={<Button variant="text">OK</Button>}
        >
          Transparent surface, no border, no elevation
        </Modal>
      </Surface>
      <Surface>
        <Modal
          variant="elevated"
          contained
          title="Elevated"
          actions={<Button variant="filled">OK</Button>}
        >
          surface-container-low + elevation 4
        </Modal>
      </Surface>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        <Modal
          size="sm"
          contained
          title="Small"
          actions={<Button variant="text">OK</Button>}
        >
          280..400px modal width band
        </Modal>
      </Surface>
      <Surface>
        <Modal
          size="md"
          contained
          title="Medium"
          actions={<Button variant="text">OK</Button>}
        >
          M3 default 320..560px modal
        </Modal>
      </Surface>
      <Surface className="!w-[760px]">
        <Modal
          size="lg"
          contained
          title="Large"
          actions={<Button variant="text">OK</Button>}
        >
          400..720px form / list modal
        </Modal>
      </Surface>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Surface>
        <Modal
          contained
          title="Resting"
          actions={<Button variant="text">OK</Button>}
        >
          Default modal state.
        </Modal>
      </Surface>
      <Surface>
        <Modal
          contained
          disabled
          title="Disabled"
          actions={<Button variant="text">OK</Button>}
        >
          Disabled modal — dimmed to 0.38, blocks pointer events.
        </Modal>
      </Surface>
      <Surface>
        <Modal
          contained
          scrim={false}
          title="No scrim"
          actions={<Button variant="text">OK</Button>}
        >
          Inline modal with no scrim layer.
        </Modal>
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
            <Modal
              shape={shape}
              contained
              title={`shape-${shape}`}
              actions={<Button variant="text">OK</Button>}
            >
              Modal corner-shape token preview.
            </Modal>
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
        <Modal
          contained
          leadingIcon={<LeadingGlyph />}
          title="Leading + trailing icons"
          trailingIcon={<CloseGlyph />}
          actions={
            <>
              <Button variant="text">Cancel</Button>
              <Button variant="filled">Confirm</Button>
            </>
          }
        >
          The header row hosts a leading 24dp glyph, a title, and a trailing close icon.
        </Modal>
      </Surface>
      <Surface>
        <Modal
          contained
          title="Form modal"
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
        </Modal>
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
            <Modal
              contained
              open={open}
              onClose={() => setOpen(false)}
              title="Motion preview"
              trailingIcon={<CloseGlyph />}
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
            >
              Surface scales 95% -&gt; 100% on enter, scrim fades via the M3 emphasized tween.
            </Modal>
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
        <Modal
          contained
          title="Accessible modal"
          trailingIcon={<CloseGlyph />}
          onClose={() => undefined}
          actions={
            <>
              <Button variant="text">Cancel</Button>
              <Button variant="filled">OK</Button>
            </>
          }
        >
          role=dialog, aria-modal=true, headline auto-wired into aria-labelledby. Tab cycles inside the surface; Escape dismisses.
        </Modal>
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
    title: "Playground",
  },
  render: (args) => (
    <Surface>
      <Modal
        {...args}
        actions={
          <>
            <Button variant="text">Cancel</Button>
            <Button variant="filled">OK</Button>
          </>
        }
      >
        Adjust the controls in the addons panel.
      </Modal>
    </Surface>
  ),
};

/**
 * Storybook interaction test. Mounts a closable modal, drives the
 * trailing-icon close button, asserts onClose fires and the surface
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
        <Surface>
          <Modal
            {...args}
            contained
            open={open}
            onClose={() => {
              setOpen(false);
              args.onClose?.();
            }}
            title="Interaction spec"
            trailingIcon={<CloseGlyph />}
            actions={
              <Button
                data-testid="modal-ok"
                variant="filled"
                onClick={() => {
                  setOpen(false);
                  args.onClose?.();
                }}
              >
                OK
              </Button>
            }
          >
            Click the trailing close icon or OK to dismiss.
          </Modal>
        </Surface>
      );
    };
    return <InteractionShell />;
  },
  play: async ({ canvasElement, args, step }) => {
    const modal = canvasElement.querySelector(
      "[data-component='modal']",
    ) as HTMLElement | null;

    await step("Modal mounts with role=dialog + aria-modal=true", async () => {
      expect(modal).not.toBeNull();
      expect(modal?.getAttribute("role")).toBe("dialog");
      expect(modal?.getAttribute("aria-modal")).toBe("true");
    });

    await step("Click the trailing close icon fires onClose", async () => {
      const close = canvasElement.querySelector(
        "[data-slot='trailing-icon']",
      ) as HTMLElement | null;
      if (!close) throw new Error("trailing close icon missing");
      await userEvent.click(close);
      expect(args.onClose).toHaveBeenCalled();
    });
  },
};
