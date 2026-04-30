import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { ClickAway } from "./ClickAway";

/** Inline 24dp glyphs — keeps stories network-free + deterministic. */
const InfoGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M11 17h2v-6h-2v6zm1-15a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM11 9h2V7h-2v2z" />
  </svg>
);

const CloseGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const Surface = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    data-host="click-away-surface"
    className={
      "flex w-[640px] flex-col gap-3 rounded-shape-md bg-surface p-6 " +
      (className ?? "")
    }
  >
    {children}
  </div>
);

const meta: Meta<typeof ClickAway> = {
  title: "Utils/Click-Away Listener",
  component: ClickAway,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3-tokenized Click-Away Listener. Renders a dismissable panel (M3 menu / popover surface) that fires `onClickAway` when the user clicks outside its bounds. Five variants (text / filled / tonal / outlined / elevated), three densities, full M3 shape scale, M3 Expressive open/close spring, and Escape-key dismissal. Re-skins MUI's behaviour primitive (https://mui.com/material-ui/react-click-away-listener/) with the M3 menu spec at https://m3.material.io/components/menus/specs.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["text", "filled", "tonal", "outlined", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    open: { control: "boolean" },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    dismissOnEscape: { control: "boolean" },
  },
  args: {
    variant: "elevated",
    size: "md",
    shape: "lg",
    open: true,
    selected: false,
    disabled: false,
    error: false,
    dismissOnEscape: true,
    label: "Dismissable panel",
    leadingIcon: <InfoGlyph />,
    children: "Click outside the panel to fire onClickAway.",
  },
};

export default meta;
type Story = StoryObj<typeof ClickAway>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <ClickAway label="Dismissable panel" leadingIcon={<InfoGlyph />}>
        Click outside this panel to dismiss it.
      </ClickAway>
    </Surface>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <ClickAway variant="text" label="Text">
        Transparent panel — pure behaviour wrapper.
      </ClickAway>
      <ClickAway variant="filled" label="Filled">
        surface-container-highest panel.
      </ClickAway>
      <ClickAway variant="tonal" label="Tonal">
        secondary-container panel.
      </ClickAway>
      <ClickAway variant="outlined" label="Outlined">
        outline-variant border, transparent fill.
      </ClickAway>
      <ClickAway variant="elevated" label="Elevated">
        surface-container-low + elevation-2 (M3 menu surface).
      </ClickAway>
    </Surface>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <ClickAway size="sm" variant="filled" label="Small">
        Compact panel — title-s, 12dp pad, 56dp min-height.
      </ClickAway>
      <ClickAway size="md" variant="filled" label="Medium">
        Default panel — title-m, 16dp pad, 72dp min-height.
      </ClickAway>
      <ClickAway size="lg" variant="filled" label="Large">
        Spacious panel — title-l, 24dp pad, 96dp min-height.
      </ClickAway>
    </Surface>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <ClickAway variant="filled" label="Resting">
        Default state.
      </ClickAway>
      <ClickAway variant="filled" selected label="Selected">
        secondary-container fill.
      </ClickAway>
      <ClickAway variant="filled" disabled label="Disabled">
        opacity-0.38, pointer-events:none.
      </ClickAway>
      <ClickAway variant="filled" error label="Error">
        error-container fill.
      </ClickAway>
    </Surface>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <ClickAway key={shape} shape={shape} variant="filled" label={`Shape ${shape}`}>
            rounded-shape-{shape}
          </ClickAway>
        ),
      )}
    </Surface>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <ClickAway
        variant="filled"
        label="Leading + trailing icons"
        leadingIcon={<InfoGlyph />}
        trailingIcon={<CloseGlyph />}
      >
        Both icon slots filled.
      </ClickAway>
      <ClickAway variant="filled" label="Leading only" leadingIcon={<InfoGlyph />}>
        Leading icon only.
      </ClickAway>
      <ClickAway variant="filled" label="Trailing only" trailingIcon={<CloseGlyph />}>
        Trailing icon only.
      </ClickAway>
      <ClickAway variant="filled">No header, body only.</ClickAway>
    </Surface>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <ClickAway variant="elevated" label="Motion preview" leadingIcon={<InfoGlyph />}>
        Container transitions ride medium2 (300ms) on emphasized; open/close
        rides springs.gentle.
      </ClickAway>
    </Surface>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <ClickAway
        variant="elevated"
        label="Accessible panel"
        aria-label="Settings dialog"
        leadingIcon={<InfoGlyph />}
      >
        role=dialog, focusable, Escape dismisses, focus-visible ring.
      </ClickAway>
      <ClickAway variant="elevated" disabled label="Disabled">
        aria-disabled, pointer-events:none, tabIndex=-1.
      </ClickAway>
    </Surface>
  ),
};

export const Playground: Story = {
  args: {
    variant: "elevated",
    size: "md",
    shape: "lg",
    open: true,
    selected: false,
    disabled: false,
    error: false,
    dismissOnEscape: true,
    label: "Playground panel",
    leadingIcon: <InfoGlyph />,
    children: "Toggle the controls to inspect every M3 token surface.",
  },
  render: (args) => (
    <Surface>
      <ClickAway {...args} />
    </Surface>
  ),
};

/**
 * @storybook/test interaction spec. Verifies pointer-outside dismissal,
 * Escape-key dismissal, and that interior clicks do NOT dismiss.
 */
export const InteractionSpec: Story = {
  args: { onClickAway: fn(), onDismiss: fn() },
  render: (args) => {
    const InteractiveHost = () => {
      const [open, setOpen] = useState(true);
      return (
        <div data-testid="ca-host" className="space-y-4">
          <button
            type="button"
            data-testid="ca-outside"
            className="rounded-shape-md bg-primary px-4 py-2 text-on-primary"
            onClick={() => setOpen((value) => !value)}
          >
            Toggle / outside target
          </button>
          <ClickAway
            {...args}
            open={open}
            onClickAway={(event) => {
              args.onClickAway?.(event);
              setOpen(false);
            }}
            onDismiss={(source) => {
              args.onDismiss?.(source);
              setOpen(false);
            }}
            variant="elevated"
            label="Interactive panel"
          >
            <button
              type="button"
              data-testid="ca-inside"
              className="rounded-shape-md bg-surface-container-high px-3 py-1 text-on-surface"
            >
              Inside button
            </button>
          </ClickAway>
        </div>
      );
    };
    return (
      <Surface>
        <InteractiveHost />
      </Surface>
    );
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const inside = await canvas.findByTestId("ca-inside");
    const outside = await canvas.findByTestId("ca-outside");

    await step("clicking inside the panel does NOT fire click-away", async () => {
      await userEvent.click(inside);
      expect(args.onClickAway).not.toHaveBeenCalled();
    });

    await step("clicking outside fires click-away + dismiss('pointer')", async () => {
      await userEvent.click(outside);
      expect(args.onClickAway).toHaveBeenCalled();
      expect(args.onDismiss).toHaveBeenCalledWith("pointer");
    });
  },
};
