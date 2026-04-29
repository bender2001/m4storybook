import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { Chip } from "./Chip";

/**
 * Inline 16dp glyphs for the leading-icon stories — keeps the
 * Storybook deliverable network-free for visual regression.
 */
const StarGlyph = () => (
  <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
    <path d="M12 2.6l2.92 6.55 7.13.62-5.4 4.7 1.62 6.96L12 17.77l-6.27 3.66 1.62-6.96-5.4-4.7 7.13-.62z" />
  </svg>
);

const SettingsGlyph = () => (
  <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
    <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.61-.22l-2.39.96a7.03 7.03 0 00-1.62-.94l-.36-2.54a.5.5 0 00-.5-.42h-3.84a.5.5 0 00-.5.42l-.36 2.54c-.59.24-1.13.55-1.62.94l-2.39-.96a.5.5 0 00-.61.22L2.65 8.84a.5.5 0 00.12.64L4.8 11.06c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 00-.12.64l1.92 3.32c.14.24.43.34.68.22l2.39-.96c.49.39 1.03.7 1.62.94l.36 2.54c.05.24.27.42.5.42h3.84c.23 0 .45-.18.5-.42l.36-2.54c.59-.24 1.13-.55 1.62-.94l2.39.96c.25.12.54.02.68-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1115.5 12 3.5 3.5 0 0112 15.5z" />
  </svg>
);

const meta: Meta<typeof Chip> = {
  title: "Data Display/Chip",
  component: Chip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Expressive Chip implementing the four chip types (assist / filter / input / suggestion) at three densities. Selected chips morph their corner radius from shape-sm (8dp) to shape-full (pill) over the medium2 (300ms) emphasized easing token. Filter and input chips render a leading check glyph automatically when selected. `onDelete` opts the chip into the input-tag pattern with a built-in dismiss button.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["assist", "filter", "input", "suggestion"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    elevated: { control: "boolean" },
  },
  args: {
    variant: "assist",
    size: "md",
    label: "Chip",
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: {
    label: "Add to favorites",
    leadingIcon: <StarGlyph />,
    "aria-label": "Add to favorites",
  },
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Chip variant="assist" label="Assist" leadingIcon={<SettingsGlyph />} />
      <Chip variant="filter" label="Filter" />
      <Chip variant="input" label="Input" onDelete={() => undefined} />
      <Chip variant="suggestion" label="Suggestion" />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-3">
      <Chip size="sm" label="Small chip" />
      <Chip size="md" label="Medium chip" />
      <Chip size="lg" label="Large chip" />
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Chip label="Rest" />
      <Chip label="Selected" variant="filter" selected />
      <Chip label="Disabled" disabled />
      <Chip label="Selected disabled" variant="filter" selected disabled />
      <Chip label="Elevated" elevated />
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Chip label="Leading" leadingIcon={<StarGlyph />} />
      <Chip
        label="Trailing"
        trailingIcon={<SettingsGlyph />}
        aria-label="Trailing icon chip"
      />
      <Chip
        label="Both"
        leadingIcon={<StarGlyph />}
        trailingIcon={<SettingsGlyph />}
        aria-label="Both icons chip"
      />
      <Chip
        label="Dismissible"
        variant="input"
        onDelete={() => undefined}
        leadingIcon={<StarGlyph />}
      />
    </div>
  ),
};

export const Filters: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Chip variant="filter" label="Vegan" />
      <Chip variant="filter" label="Vegetarian" selected />
      <Chip variant="filter" label="Gluten-free" selected />
      <Chip variant="filter" label="Dairy-free" />
    </div>
  ),
};

export const Inputs: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Chip
        variant="input"
        label="ada@example.com"
        onDelete={() => undefined}
        aria-label="ada@example.com"
      />
      <Chip
        variant="input"
        label="design"
        onDelete={() => undefined}
        aria-label="design tag"
      />
      <Chip
        variant="input"
        label="m3-expressive"
        onDelete={() => undefined}
        aria-label="m3-expressive tag"
      />
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    variant: "filter",
    label: "Toggle me",
    "aria-label": "Toggle me",
    onClick: fn(),
  },
};

export const Playground: Story = {
  args: {
    label: "Chip",
    "aria-label": "Chip",
  },
};

/**
 * Storybook interaction test:
 *   - clicks the chip and asserts onClick fires
 *   - presses Enter and asserts onClick fires again
 *   - clicks the dismiss affordance and asserts onDelete fires
 */
export const InteractionSpec: Story = {
  args: {
    variant: "input",
    label: "Removable tag",
    "aria-label": "Removable tag",
    onClick: fn(),
    onDelete: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole("button", { name: "Removable tag" });
    await userEvent.click(chip);
    await waitFor(() => {
      expect(args.onClick).toHaveBeenCalledTimes(1);
    });
    chip.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(args.onClick).toHaveBeenCalledTimes(2);
    });
    const dismiss = canvas.getByRole("button", { name: "Remove" });
    await userEvent.click(dismiss);
    await waitFor(() => {
      expect(args.onDelete).toHaveBeenCalledTimes(1);
    });
  },
};
