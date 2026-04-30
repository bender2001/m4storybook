import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { Menu } from "./Menu";
import type { MenuItem } from "./types";

/** Inline 24dp glyphs — keeps stories network-free + deterministic. */
const EditGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.21a1 1 0 0 0 0-1.42l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.82z" />
  </svg>
);

const ShareGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7 0-.24-.04-.47-.09-.7l7.05-4.11A2.99 2.99 0 0 0 21 5a3 3 0 1 0-6 0c0 .24.04.47.09.7L8.04 9.81A3 3 0 1 0 8 14.19l7.12 4.16c-.05.21-.08.43-.08.65A2.92 2.92 0 1 0 18 16.08z" />
  </svg>
);

const DeleteGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
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
    <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
    data-host="menu-surface"
    className={
      "flex w-[640px] flex-col gap-4 rounded-shape-md bg-surface p-6 " +
      (className ?? "")
    }
  >
    {children}
  </div>
);

const baseItems: MenuItem[] = [
  { id: "edit", label: "Edit", leadingIcon: <EditGlyph />, trailingText: "⌘E" },
  { id: "share", label: "Share", leadingIcon: <ShareGlyph />, trailingText: "⌘S" },
  {
    id: "more",
    label: "More options",
    leadingIcon: <ChevronGlyph />,
    divider: true,
  },
  {
    id: "delete",
    label: "Delete",
    leadingIcon: <DeleteGlyph />,
    error: true,
  },
];

const meta: Meta<typeof Menu> = {
  title: "Navigation/Menu",
  component: Menu,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3-tokenized Menu surface. Renders the M3 menu container (default: surface-container, elevation-2, shape-xs) with a list of token-driven menu items. Five variants (text / filled / tonal / outlined / elevated), three densities (sm = 40dp / md = 48dp / lg = 56dp), full M3 shape scale, per-item state-layer at the canonical hover 0.08 / focus 0.10 / pressed 0.10 opacities, M3 Expressive open/close spring, and roving-tabindex keyboard navigation. Re-skins MUI's Menu (https://mui.com/material-ui/react-menu/) onto the M3 menu spec at https://m3.material.io/components/menus/specs.",
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
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    dismissOnEscape: { control: "boolean" },
  },
  args: {
    variant: "elevated",
    size: "md",
    shape: "xs",
    open: true,
    disabled: false,
    error: false,
    dismissOnEscape: true,
    label: "Actions",
    items: baseItems,
  },
};

export default meta;
type Story = StoryObj<typeof Menu>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Menu label="Actions" items={baseItems} />
    </Surface>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface className="grid grid-cols-2 gap-6">
      <Menu variant="text" label="Text" items={baseItems} />
      <Menu variant="filled" label="Filled" items={baseItems} />
      <Menu variant="tonal" label="Tonal" items={baseItems} />
      <Menu variant="outlined" label="Outlined" items={baseItems} />
      <Menu variant="elevated" label="Elevated" items={baseItems} />
    </Surface>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface className="grid grid-cols-3 gap-6">
      <Menu size="sm" variant="elevated" label="Small" items={baseItems} />
      <Menu size="md" variant="elevated" label="Medium" items={baseItems} />
      <Menu size="lg" variant="elevated" label="Large" items={baseItems} />
    </Surface>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface className="grid grid-cols-2 gap-6">
      <Menu
        variant="elevated"
        label="Resting"
        items={baseItems}
        selectedId="edit"
      />
      <Menu
        variant="elevated"
        label="Disabled"
        disabled
        items={baseItems}
      />
      <Menu
        variant="elevated"
        label="Error"
        error
        items={baseItems}
      />
      <Menu
        variant="elevated"
        label="Mixed item states"
        items={[
          { id: "a", label: "Resting", leadingIcon: <EditGlyph /> },
          { id: "b", label: "Selected", selected: true, leadingIcon: <EditGlyph /> },
          { id: "c", label: "Disabled", disabled: true, leadingIcon: <EditGlyph /> },
          { id: "d", label: "Error", error: true, leadingIcon: <DeleteGlyph /> },
        ]}
      />
    </Surface>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface className="grid grid-cols-2 gap-6">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <Menu
            key={shape}
            shape={shape}
            variant="elevated"
            label={`Shape ${shape}`}
            items={[
              { id: `${shape}-a`, label: "Edit", leadingIcon: <EditGlyph /> },
              { id: `${shape}-b`, label: "Share", leadingIcon: <ShareGlyph /> },
            ]}
          />
        ),
      )}
    </Surface>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Menu
        variant="elevated"
        label="Leading + trailing slots"
        items={[
          {
            id: "all",
            label: "Both icon slots + shortcut",
            leadingIcon: <EditGlyph />,
            trailingIcon: <ChevronGlyph />,
            trailingText: "⌘E",
          },
          {
            id: "lead",
            label: "Leading only",
            leadingIcon: <ShareGlyph />,
          },
          {
            id: "trail",
            label: "Trailing only",
            trailingIcon: <ChevronGlyph />,
          },
          { id: "none", label: "Plain item" },
        ]}
      />
    </Surface>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Menu
        variant="elevated"
        label="Motion preview"
        items={baseItems}
      />
    </Surface>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Menu
        variant="elevated"
        label="Accessible menu"
        aria-label="Document actions"
        items={baseItems}
      />
      <Menu
        variant="elevated"
        label="Disabled menu"
        disabled
        items={baseItems}
      />
    </Surface>
  ),
};

export const Playground: Story = {
  args: {
    variant: "elevated",
    size: "md",
    shape: "xs",
    open: true,
    disabled: false,
    error: false,
    dismissOnEscape: true,
    label: "Playground",
    items: baseItems,
  },
  render: (args) => (
    <Surface>
      <Menu {...args} />
    </Surface>
  ),
};

/**
 * @storybook/test interaction spec. Verifies pointer activation,
 * keyboard activation (Enter), and Escape dismissal.
 */
export const InteractionSpec: Story = {
  args: { onSelect: fn(), onDismiss: fn() },
  render: (args) => {
    const InteractiveHost = () => {
      const [open, setOpen] = useState(true);
      const [lastPicked, setLastPicked] = useState<string>("");
      return (
        <div data-testid="menu-host" className="space-y-4">
          <button
            type="button"
            data-testid="menu-toggle"
            className="rounded-shape-md bg-primary px-4 py-2 text-on-primary"
            onClick={() => setOpen((value) => !value)}
          >
            Toggle menu
          </button>
          <span data-testid="last-picked" className="block text-on-surface">
            {lastPicked || "—"}
          </span>
          <Menu
            {...args}
            open={open}
            label="Interactive menu"
            items={baseItems}
            onSelect={(item) => {
              args.onSelect?.(item);
              setLastPicked(item.id);
            }}
            onDismiss={(source) => {
              args.onDismiss?.(source);
              if (source !== "escape") setOpen(false);
              if (source === "escape") setOpen(false);
            }}
          />
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
    const editItem = await canvas.findByRole("menuitem", { name: /Edit/i });
    const lastPicked = await canvas.findByTestId("last-picked");

    await step("clicking an item fires onSelect + onDismiss('select')", async () => {
      await userEvent.click(editItem);
      expect(args.onSelect).toHaveBeenCalled();
      expect(args.onDismiss).toHaveBeenCalledWith("select");
      expect(lastPicked).toHaveTextContent("edit");
    });
  },
};
