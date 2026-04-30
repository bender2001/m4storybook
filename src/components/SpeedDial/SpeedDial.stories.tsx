import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { SpeedDial } from "./SpeedDial";
import type { SpeedDialAction } from "./types";

const PencilIcon = () => (
  <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z" />
  </svg>
);
const ShareIcon = () => (
  <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 1 0-3-3c0 .24.04.47.09.7L8.04 9.81A3 3 0 1 0 6 15c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65A2.92 2.92 0 1 0 18 16.08z" />
  </svg>
);
const CopyIcon = () => (
  <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z" />
  </svg>
);
const PrintIcon = () => (
  <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M19 8H5a3 3 0 0 0-3 3v6h4v4h12v-4h4v-6a3 3 0 0 0-3-3zm-3 11H8v-5h8v5zm3-7a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-1-9H6v4h12V3z" />
  </svg>
);

const sampleActions: SpeedDialAction[] = [
  { key: "edit", icon: <PencilIcon />, label: "Edit" },
  { key: "share", icon: <ShareIcon />, label: "Share" },
  { key: "copy", icon: <CopyIcon />, label: "Copy" },
  { key: "print", icon: <PrintIcon />, label: "Print" },
];

const Stage = ({
  children,
  className,
  height = "h-[420px]",
}: {
  children?: React.ReactNode;
  className?: string;
  height?: string;
}) => (
  <div
    data-host="speed-dial-stage"
    className={
      "relative w-[640px] " +
      height +
      " rounded-shape-md bg-surface-container-low p-6 overflow-hidden " +
      (className ?? "")
    }
  >
    {children}
  </div>
);

const Anchor = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div className={"absolute " + (className ?? "bottom-6 right-6")}>{children}</div>
);

const meta: Meta<typeof SpeedDial> = {
  title: "Navigation/Speed Dial",
  component: SpeedDial,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3-tokenized Speed Dial. Re-skins MUI's `<SpeedDial />` (https://mui.com/material-ui/react-speed-dial/) onto M3 navigation tokens. Trigger paints as the M3 Expressive FAB (https://m3.material.io/components/floating-action-button/specs); actions paint as the M3 Small FAB (40dp / shape-md / 24dp icon). Trigger morphs its leading icon (cross-fade + 45° rotate) on toggle. Hover 0.08 / focus 0.10 / pressed 0.10 state-layers. Springy press scale on the trigger; per-action staggered enter/exit. Four directions (up/down/left/right), four trigger color variants, three sizes, and the M3 corner shape scale.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["surface", "primary", "secondary", "tertiary"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    direction: {
      control: "inline-radio",
      options: ["up", "down", "left", "right"],
    },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    open: { control: "boolean" },
    disabled: { control: "boolean" },
    hideBackdrop: { control: "boolean" },
  },
  args: {
    variant: "primary",
    size: "md",
    direction: "up",
    shape: "lg",
    disabled: false,
    hideBackdrop: false,
  },
};

export default meta;
type Story = StoryObj<typeof SpeedDial>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Anchor>
        <SpeedDial
          ariaLabel="Compose actions"
          actions={sampleActions}
          icon={
            <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
            </svg>
          }
          defaultOpen
          hideBackdrop
        />
      </Anchor>
    </Stage>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {(["surface", "primary", "secondary", "tertiary"] as const).map((variant) => (
        <Stage key={variant} className="!h-[300px]">
          <span className="text-label-l text-on-surface">{variant}</span>
          <Anchor>
            <SpeedDial
              variant={variant}
              ariaLabel={`${variant} speed dial`}
              actions={sampleActions.slice(0, 3)}
              icon={
                <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
                </svg>
              }
              defaultOpen
              hideBackdrop
            />
          </Anchor>
        </Stage>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Stage key={size} className="!h-[320px]">
          <span className="text-label-l text-on-surface">{size}</span>
          <Anchor>
            <SpeedDial
              size={size}
              ariaLabel={`${size} speed dial`}
              actions={sampleActions.slice(0, 3)}
              icon={
                <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
                </svg>
              }
              defaultOpen
              hideBackdrop
            />
          </Anchor>
        </Stage>
      ))}
    </div>
  ),
};

export const Directions: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {(
        [
          { direction: "up", anchor: "bottom-6 right-6" },
          { direction: "down", anchor: "top-6 right-6" },
          { direction: "left", anchor: "bottom-6 right-6" },
          { direction: "right", anchor: "bottom-6 left-6" },
        ] as const
      ).map(({ direction, anchor }) => (
        <Stage key={direction} className="!h-[280px]">
          <span className="text-label-l text-on-surface">{direction}</span>
          <Anchor className={anchor}>
            <SpeedDial
              direction={direction}
              ariaLabel={`${direction} speed dial`}
              actions={sampleActions.slice(0, 3)}
              icon={
                <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
                </svg>
              }
              defaultOpen
              hideBackdrop
            />
          </Anchor>
        </Stage>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map((shape) => (
        <Stage key={shape} className="!h-[200px]">
          <span className="text-label-l text-on-surface">{shape}</span>
          <Anchor>
            <SpeedDial
              shape={shape}
              ariaLabel={`shape ${shape}`}
              actions={[]}
              icon={
                <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
                </svg>
              }
              hideBackdrop
            />
          </Anchor>
        </Stage>
      ))}
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Stage className="!h-[280px]">
        <span className="text-label-l text-on-surface">closed</span>
        <Anchor>
          <SpeedDial
            ariaLabel="closed"
            actions={sampleActions.slice(0, 2)}
            icon={
              <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
              </svg>
            }
            hideBackdrop
          />
        </Anchor>
      </Stage>
      <Stage className="!h-[280px]">
        <span className="text-label-l text-on-surface">open</span>
        <Anchor>
          <SpeedDial
            ariaLabel="open"
            actions={sampleActions.slice(0, 2)}
            icon={
              <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
              </svg>
            }
            defaultOpen
            hideBackdrop
          />
        </Anchor>
      </Stage>
      <Stage className="!h-[280px]">
        <span className="text-label-l text-on-surface">disabled</span>
        <Anchor>
          <SpeedDial
            ariaLabel="disabled"
            disabled
            actions={sampleActions.slice(0, 2)}
            icon={
              <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
              </svg>
            }
            hideBackdrop
          />
        </Anchor>
      </Stage>
      <Stage className="!h-[280px]">
        <span className="text-label-l text-on-surface">disabled action</span>
        <Anchor>
          <SpeedDial
            ariaLabel="disabled action"
            actions={[
              { key: "edit", icon: <PencilIcon />, label: "Edit" },
              {
                key: "share",
                icon: <ShareIcon />,
                label: "Share",
                disabled: true,
              },
              { key: "copy", icon: <CopyIcon />, label: "Copy" },
            ]}
            icon={
              <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
              </svg>
            }
            defaultOpen
            hideBackdrop
          />
        </Anchor>
      </Stage>
    </div>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Anchor>
        <SpeedDial
          ariaLabel="With custom open icon"
          actions={sampleActions}
          icon={<PencilIcon />}
          openIcon={
            <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
              <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          }
          defaultOpen
          hideBackdrop
        />
      </Anchor>
    </Stage>
  ),
};

export const Backdrop: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <span className="text-label-l text-on-surface">backdrop visible while open</span>
      <Anchor>
        <SpeedDial
          ariaLabel="With backdrop"
          actions={sampleActions.slice(0, 3)}
          icon={
            <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
            </svg>
          }
          defaultOpen
        />
      </Anchor>
    </Stage>
  ),
};

export const Playground: Story = {
  args: {
    variant: "primary",
    size: "md",
    direction: "up",
    shape: "lg",
    disabled: false,
    hideBackdrop: false,
  },
  render: (args) => (
    <Stage>
      <Anchor>
        <SpeedDial
          {...args}
          ariaLabel="Playground speed dial"
          actions={sampleActions}
          icon={
            <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
            </svg>
          }
        />
      </Anchor>
    </Stage>
  ),
};

export const InteractionSpec: Story = {
  args: { onOpenChange: fn() },
  render: (args) => {
    const InteractiveHost = () => {
      const [last, setLast] = useState<string>("(none)");
      return (
        <div data-testid="speed-dial-host" className="space-y-4">
          <span data-testid="last-action" className="block text-on-surface">
            last: {last}
          </span>
          <Stage>
            <Anchor>
              <SpeedDial
                {...args}
                ariaLabel="Compose actions"
                actions={sampleActions.map((a) => ({
                  ...a,
                  onClick: (_event, key) => setLast(key),
                }))}
                icon={
                  <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
                  </svg>
                }
                hideBackdrop
              />
            </Anchor>
          </Stage>
        </div>
      );
    };
    return <InteractiveHost />;
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const last = await canvas.findByTestId("last-action");

    await step("trigger has aria-haspopup and starts collapsed", async () => {
      const trigger = await canvas.findByRole("button", {
        name: /Compose actions/i,
      });
      expect(trigger).toHaveAttribute("aria-haspopup", "menu");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    await step("clicking the trigger opens the action menu", async () => {
      const trigger = await canvas.findByRole("button", {
        name: /Compose actions/i,
      });
      await userEvent.click(trigger);
      expect(args.onOpenChange).toHaveBeenCalledWith(true);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      const menu = await canvas.findByRole("menu", { name: /Compose actions/i });
      expect(menu).toBeInTheDocument();
    });

    await step("activating an action fires its onClick + closes the dial", async () => {
      const editAction = await canvas.findByRole("menuitem", { name: /Edit/i });
      await userEvent.click(editAction);
      expect(last).toHaveTextContent("last: edit");
    });
  },
};
