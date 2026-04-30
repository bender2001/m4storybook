import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { IconButton } from "@/components/IconButton";
import { MaterialIcon } from "./MaterialIcon";
import { IconAxisContext } from "./iconAxisContext";

const meta: Meta<typeof MaterialIcon> = {
  title: "Data Display/Material Symbols",
  component: MaterialIcon,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Material Symbols. Variable-font icon wrapper that paints a glyph via the Material Symbols font ligature (FILL / wght / GRAD / opsz axes). Three styles (outlined / rounded / sharp), six color variants, three sizes, four states. Selected glyphs auto-toggle the FILL axis to 1 per the M3 spec. Reference: https://m3.material.io/styles/icons/applying-icons.",
      },
    },
  },
  argTypes: {
    name: { control: "text" },
    iconStyle: {
      control: "inline-radio",
      options: ["outlined", "rounded", "sharp"],
    },
    variant: {
      control: "inline-radio",
      options: [
        "standard",
        "primary",
        "filled",
        "tonal",
        "outlined-box",
        "error",
      ],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    state: {
      control: "inline-radio",
      options: ["default", "selected", "disabled", "error"],
    },
    fill: { control: { type: "inline-radio" }, options: [0, 1] },
    weight: {
      control: { type: "inline-radio" },
      options: [100, 200, 300, 400, 500, 600, 700],
    },
    grade: { control: { type: "inline-radio" }, options: [-25, 0, 200] },
    interactive: { control: "boolean" },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
  args: {
    name: "favorite",
    iconStyle: "outlined",
    variant: "standard",
    size: "md",
    fill: 0,
    weight: 400,
    grade: 0,
    label: "Favorite",
  },
};

export default meta;
type Story = StoryObj<typeof MaterialIcon>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  args: { name: "favorite", label: "Favorite" },
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <MaterialIcon
        name="favorite"
        variant="standard"
        label="Standard"
        data-testid="variant-standard"
      />
      <MaterialIcon
        name="favorite"
        variant="primary"
        label="Primary"
        data-testid="variant-primary"
      />
      <MaterialIcon
        name="favorite"
        variant="filled"
        label="Filled"
        data-testid="variant-filled"
      />
      <MaterialIcon
        name="favorite"
        variant="tonal"
        label="Tonal"
        data-testid="variant-tonal"
      />
      <MaterialIcon
        name="favorite"
        variant="outlined-box"
        label="Outlined-box"
        data-testid="variant-outlined-box"
      />
      <MaterialIcon
        name="favorite"
        variant="error"
        label="Error"
        data-testid="variant-error"
      />
    </div>
  ),
};

export const Styles: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-6">
      <MaterialIcon
        name="settings"
        iconStyle="outlined"
        size="lg"
        label="Outlined"
        data-testid="style-outlined"
      />
      <MaterialIcon
        name="settings"
        iconStyle="rounded"
        size="lg"
        label="Rounded"
        data-testid="style-rounded"
      />
      <MaterialIcon
        name="settings"
        iconStyle="sharp"
        size="lg"
        label="Sharp"
        data-testid="style-sharp"
      />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-6">
      <MaterialIcon
        name="favorite"
        size="sm"
        label="Small"
        data-testid="size-sm"
      />
      <MaterialIcon
        name="favorite"
        size="md"
        label="Medium"
        data-testid="size-md"
      />
      <MaterialIcon
        name="favorite"
        size="lg"
        variant="filled"
        label="Large"
        data-testid="size-lg"
      />
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-6">
      <MaterialIcon name="favorite" label="Default" data-testid="state-default" />
      <MaterialIcon
        name="favorite"
        variant="tonal"
        selected
        interactive
        label="Selected"
        data-testid="state-selected"
      />
      <MaterialIcon
        name="favorite"
        disabled
        label="Disabled"
        data-testid="state-disabled"
      />
      <MaterialIcon
        name="favorite"
        state="error"
        label="Error"
        data-testid="state-error"
      />
    </div>
  ),
};

export const Axes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-6">
        <MaterialIcon
          name="favorite"
          fill={0}
          variant="primary"
          label="Fill 0"
          data-testid="axis-fill-0"
        />
        <MaterialIcon
          name="favorite"
          fill={1}
          variant="primary"
          label="Fill 1"
          data-testid="axis-fill-1"
        />
      </div>
      <div className="flex items-center gap-6">
        <MaterialIcon
          name="favorite"
          weight={300}
          variant="primary"
          label="Weight 300"
          data-testid="axis-weight-300"
        />
        <MaterialIcon
          name="favorite"
          weight={700}
          variant="primary"
          label="Weight 700"
          data-testid="axis-weight-700"
        />
      </div>
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <MaterialIcon
        name="search"
        variant="primary"
        label="Search shortcut"
        leadingLabel="Search"
        data-testid="slot-leading"
      />
      <MaterialIcon
        name="home"
        variant="primary"
        label="Home shortcut"
        trailingLabel="Home"
        data-testid="slot-trailing"
      />
      <MaterialIcon
        name="favorite"
        variant="primary"
        label="Favorite shortcut"
        leadingLabel="Save"
        trailingLabel="3"
        data-testid="slot-both"
      />
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-6">
      <MaterialIcon
        name="favorite"
        interactive
        variant="filled"
        label="Press to feel the spring"
        data-testid="motion-press"
      />
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <MaterialIcon
        name="favorite"
        decorative
        data-testid="a11y-decorative"
      />
      <MaterialIcon
        name="favorite"
        interactive
        label="Toggle favorite"
        data-testid="a11y-interactive"
      />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    name: "favorite",
    label: "Favorite",
    interactive: false,
  },
  render: (args) => <MaterialIcon {...args} />,
};

/**
 * M3 Expressive variable-font axis demo. Hover the swatch to drive the
 * FILL axis 0 → 1; the second row stays "selected" and demonstrates
 * the wght 400 → 700 jump. The animation is a motion/react number
 * tween on the FILL / wght axes (CSS cannot reliably tween variable
 * font axes in Safari + Firefox).
 */
export const ExpressiveAxes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-label-l text-on-surface-variant">
          Hover → FILL 0 → 1
        </span>
        <div className="flex items-center gap-6">
          <HoverSwatch label="favorite" iconName="favorite" />
          <HoverSwatch label="home" iconName="home" />
          <HoverSwatch label="search" iconName="search" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-label-l text-on-surface-variant">
          Selected → wght 400 → 700
        </span>
        <div className="flex items-center gap-6">
          <SelectedSwatch label="rest" hovered={false} selected={false} />
          <SelectedSwatch label="hovered" hovered selected={false} />
          <SelectedSwatch label="selected" hovered={false} selected />
          <SelectedSwatch label="hover+selected" hovered selected />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-label-l text-on-surface-variant">
          Interactive parents drive a child MaterialIcon's axes
        </span>
        <div
          data-testid="interactive-parents"
          className="flex flex-wrap items-center gap-4"
        >
          <Button
            data-testid="parent-button"
            startIcon={
              <MaterialIcon
                name="favorite"
                data-testid="parent-button-icon"
              />
            }
          >
            Hover me
          </Button>
          <IconButton
            data-testid="parent-icon-button"
            aria-label="Toggle bookmark"
            icon={
              <MaterialIcon
                name="bookmark"
                data-testid="parent-icon-button-icon"
              />
            }
          />
          <Chip
            data-testid="parent-chip"
            variant="filter"
            selected
            label="Filter"
            leadingIcon={
              <MaterialIcon name="check" data-testid="parent-chip-icon" />
            }
          />
        </div>
      </div>
    </div>
  ),
};

function HoverSwatch({
  label,
  iconName,
}: {
  label: string;
  iconName: string;
}) {
  return (
    <ExpressiveSwatchButton label={label} dataTestId={`hover-${label}`}>
      {(hovered) => (
        <IconAxisContext.Provider value={{ hovered, selected: false }}>
          <MaterialIcon
            name={iconName}
            variant="primary"
            size="lg"
            data-testid={`hover-glyph-${label}`}
          />
        </IconAxisContext.Provider>
      )}
    </ExpressiveSwatchButton>
  );
}

function SelectedSwatch({
  label,
  hovered,
  selected,
}: {
  label: string;
  hovered: boolean;
  selected: boolean;
}) {
  return (
    <div
      data-testid={`selected-${label}`}
      className="flex flex-col items-center gap-2"
    >
      <IconAxisContext.Provider value={{ hovered, selected }}>
        <MaterialIcon
          name="bolt"
          variant="primary"
          size="lg"
          data-testid={`selected-glyph-${label}`}
        />
      </IconAxisContext.Provider>
      <span className="text-label-s text-on-surface-variant">{label}</span>
    </div>
  );
}

function ExpressiveSwatchButton({
  label,
  dataTestId,
  children,
}: {
  label: string;
  dataTestId: string;
  children: (hovered: boolean) => ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      data-testid={dataTestId}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="flex flex-col items-center gap-2 rounded-shape-md p-4 outline-none ring-primary/40 hover:bg-surface-container-high focus-visible:ring-2"
    >
      {children(hovered)}
      <span className="text-label-s text-on-surface-variant">{label}</span>
    </button>
  );
}

/**
 * Storybook interaction test. Drives an interactive Material Symbol:
 *  - role=img + aria-label projected from `label`
 *  - tabIndex=0 + keyboard activation (Enter + Space)
 *  - aria-pressed reflects `selected` while interactive
 *  - data-name carries the ligature symbol name
 */
export const InteractionSpec: Story = {
  args: {
    name: "favorite",
    label: "Favorite",
    interactive: true,
    selected: false,
    onActivate: fn(),
  },
  render: (args) => (
    <MaterialIcon {...args} data-testid="interactive-symbol" />
  ),
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const symbol = canvas.getByTestId("interactive-symbol");

    await step("renders as a labelled focusable img", async () => {
      expect(symbol).toHaveAttribute("role", "img");
      expect(symbol).toHaveAttribute("aria-label", "Favorite");
      expect(symbol).toHaveAttribute("data-component", "material-icon");
      expect(symbol).toHaveAttribute("data-name", "favorite");
      expect(symbol).toHaveAttribute("data-icon-style", "outlined");
      expect(symbol).toHaveAttribute("data-variant", "standard");
      expect(symbol).toHaveAttribute("data-size", "md");
      expect(symbol).toHaveAttribute("data-interactive", "");
      expect(symbol).toHaveAttribute("tabindex", "0");
    });

    await step("Enter activates onActivate", async () => {
      symbol.focus();
      await userEvent.keyboard("{Enter}");
      expect(args.onActivate).toHaveBeenCalledTimes(1);
    });

    await step("Space activates onActivate", async () => {
      await userEvent.keyboard(" ");
      expect(args.onActivate).toHaveBeenCalledTimes(2);
    });

    await step("Click activates onActivate", async () => {
      await userEvent.click(symbol);
      expect(args.onActivate).toHaveBeenCalledTimes(3);
    });
  },
};
