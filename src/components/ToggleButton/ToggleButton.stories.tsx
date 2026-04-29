import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { ToggleButton } from "./ToggleButton";

const Glyph = ({ glyph, label }: { glyph: string; label: string }) => (
  <span
    aria-label={label}
    className="inline-flex h-4 w-4 items-center justify-center font-bold leading-none"
  >
    {glyph}
  </span>
);

const meta: Meta<typeof ToggleButton> = {
  title: "Inputs/Toggle Button",
  component: ToggleButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Expressive Toggle Button: a single button that flips between rest and selected states. Selected morphs the container from shape-full to shape-md and swaps to the secondary-container role. https://m3.material.io/components/buttons/specs",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["filled", "tonal", "outlined", "text", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    onChange: { action: "changed" },
  },
  args: {
    variant: "outlined",
    size: "md",
    defaultSelected: false,
    children: "Bold",
    "aria-label": "Toggle bold",
  },
};

export default meta;
type Story = StoryObj<typeof ToggleButton>;

export const Default: Story = {
  args: { onChange: fn() },
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleButton variant="filled" defaultSelected={false}>
          Filled rest
        </ToggleButton>
        <ToggleButton variant="filled" defaultSelected>
          Filled on
        </ToggleButton>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ToggleButton variant="tonal" defaultSelected={false}>
          Tonal rest
        </ToggleButton>
        <ToggleButton variant="tonal" defaultSelected>
          Tonal on
        </ToggleButton>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ToggleButton variant="outlined" defaultSelected={false}>
          Outlined rest
        </ToggleButton>
        <ToggleButton variant="outlined" defaultSelected>
          Outlined on
        </ToggleButton>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ToggleButton variant="text" defaultSelected={false}>
          Text rest
        </ToggleButton>
        <ToggleButton variant="text" defaultSelected>
          Text on
        </ToggleButton>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ToggleButton variant="elevated" defaultSelected={false}>
          Elevated rest
        </ToggleButton>
        <ToggleButton variant="elevated" defaultSelected>
          Elevated on
        </ToggleButton>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-4">
      <ToggleButton variant="outlined" size="sm">
        Small
      </ToggleButton>
      <ToggleButton variant="outlined" size="md">
        Medium
      </ToggleButton>
      <ToggleButton variant="outlined" size="lg">
        Large
      </ToggleButton>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <ToggleButton variant="outlined" aria-label="Resting">
        Rest
      </ToggleButton>
      <ToggleButton variant="outlined" defaultSelected aria-label="Selected">
        Selected
      </ToggleButton>
      <ToggleButton variant="outlined" disabled aria-label="Disabled rest">
        Disabled
      </ToggleButton>
      <ToggleButton
        variant="outlined"
        disabled
        defaultSelected
        aria-label="Disabled selected"
      >
        Disabled on
      </ToggleButton>
    </div>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ToggleButton
        variant="outlined"
        startIcon={<Glyph glyph="B" label="Bold" />}
        aria-label="Bold"
      >
        Bold
      </ToggleButton>
      <ToggleButton
        variant="outlined"
        defaultSelected
        startIcon={<Glyph glyph="I" label="Italic" />}
        aria-label="Italic"
      >
        Italic
      </ToggleButton>
      <ToggleButton
        variant="outlined"
        startIcon={<Glyph glyph="U" label="Underline" />}
        aria-label="Underline"
      >
        Underline
      </ToggleButton>
      <ToggleButton
        variant="outlined"
        size="md"
        startIcon={<Glyph glyph="★" label="Star" />}
        aria-label="Icon only"
      />
    </div>
  ),
};

export const Playground: Story = {
  args: { onChange: fn(), children: "Toggle me" },
};

/**
 * Storybook interaction test: clicks the toggle, asserts onChange + aria-pressed
 * flip on, then clicks again and asserts the toggle returns to rest.
 */
export const Interaction: Story = {
  args: {
    onChange: fn(),
    defaultSelected: false,
    children: "Toggle",
    "aria-label": "Toggle",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Toggle" });
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    await waitFor(() => {
      expect(args.onChange).toHaveBeenLastCalledWith(true);
    });
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(button);
    await waitFor(() => {
      expect(args.onChange).toHaveBeenLastCalledWith(false);
    });
    await expect(button).toHaveAttribute("aria-pressed", "false");
  },
};
