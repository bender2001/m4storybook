import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { ButtonGroup } from "./ButtonGroup";

const ALIGN_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const FORMAT_OPTIONS = [
  { value: "bold", label: "B", ariaLabel: "Bold" },
  { value: "italic", label: "I", ariaLabel: "Italic" },
  { value: "underline", label: "U", ariaLabel: "Underline" },
];

const FormatBoldIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M15.6 11.8c1-.7 1.6-1.8 1.6-2.8 0-2.3-1.8-4-4-4H7v14h7c2.2 0 3.9-1.8 3.9-4 0-1.6-.9-3-2.3-3.2zM10 7.5h3a1.5 1.5 0 0 1 0 3h-3v-3zm3.5 9H10v-3h3.5a1.5 1.5 0 0 1 0 3z" />
  </svg>
);

const meta: Meta<typeof ButtonGroup> = {
  title: "Inputs/Button Group",
  component: ButtonGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Button Group: a row of connected buttons that share a pill-shaped outer radius and a 2dp inner gap. Supports `single` and `multi` selection. See https://m3.material.io/components/button-groups/specs.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["filled", "tonal", "outlined", "text", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    selectionMode: { control: "inline-radio", options: ["single", "multi"] },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    disabled: { control: "boolean" },
    onChange: { action: "changed" },
  },
  args: {
    options: ALIGN_OPTIONS,
    variant: "outlined",
    size: "md",
    selectionMode: "single",
    orientation: "horizontal",
    defaultValue: "center",
    "aria-label": "Text alignment",
  },
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  args: { onChange: fn() },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <ButtonGroup {...args} variant="filled" defaultValue="left" />
      <ButtonGroup {...args} variant="tonal" defaultValue="center" />
      <ButtonGroup {...args} variant="outlined" defaultValue="right" />
      <ButtonGroup {...args} variant="text" defaultValue="left" />
      <ButtonGroup {...args} variant="elevated" defaultValue="center" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <ButtonGroup {...args} size="sm" />
      <ButtonGroup {...args} size="md" />
      <ButtonGroup {...args} size="lg" />
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <ButtonGroup {...args} defaultValue={null} aria-label="Default" />
      <ButtonGroup
        {...args}
        defaultValue="center"
        aria-label="With selection"
      />
      <ButtonGroup {...args} disabled aria-label="Disabled" />
      <ButtonGroup
        {...args}
        options={[
          { value: "left", label: "Left" },
          { value: "center", label: "Center", disabled: true },
          { value: "right", label: "Right" },
        ]}
        aria-label="Mixed disabled"
      />
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <ButtonGroup
        {...args}
        selectionMode="multi"
        defaultValue={["bold"]}
        options={FORMAT_OPTIONS}
        aria-label="Text formatting"
      />
      <ButtonGroup
        {...args}
        options={[
          { value: "bold", label: "Bold", startIcon: <FormatBoldIcon /> },
          { value: "italic", label: "Italic", startIcon: <FormatBoldIcon /> },
          { value: "under", label: "Underline", startIcon: <FormatBoldIcon /> },
        ]}
        selectionMode="multi"
        defaultValue={["bold"]}
        aria-label="Format with icons"
      />
    </div>
  ),
};

export const Playground: Story = {
  args: { onChange: fn() },
};

/**
 * Storybook interaction test: clicks an option in single-select mode and
 * asserts onChange fires with the option value, then clicks the same
 * option again and asserts toggle-off behavior.
 */
export const Interaction: Story = {
  args: {
    onChange: fn(),
    defaultValue: null,
    "aria-label": "Alignment",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const center = canvas.getByRole("radio", { name: "Center" });
    await userEvent.click(center);
    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith("center");
    });
    expect(center).toHaveAttribute("aria-checked", "true");

    await userEvent.click(center);
    await waitFor(() => {
      expect(args.onChange).toHaveBeenLastCalledWith(null);
    });
    expect(center).toHaveAttribute("aria-checked", "false");
  },
};
