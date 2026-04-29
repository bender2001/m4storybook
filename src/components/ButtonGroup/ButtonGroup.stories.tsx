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

const FormatIcon = ({ glyph }: { glyph: string }) => (
  <span aria-hidden className="inline-flex h-4 w-4 items-center justify-center font-bold">
    {glyph}
  </span>
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
    // The `options` arg can contain ReactNode icons, which break
    // Storybook's prettyPrint serializer (max-call-stack on JSX trees).
    options: { control: false },
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

const ICON_OPTIONS = [
  { value: "bold", label: "Bold", startIcon: <FormatIcon glyph="B" /> },
  { value: "italic", label: "Italic", startIcon: <FormatIcon glyph="I" /> },
  { value: "under", label: "Underline", startIcon: <FormatIcon glyph="U" /> },
];

export const WithIcons: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <ButtonGroup
        variant="outlined"
        size="md"
        selectionMode="multi"
        defaultValue={["bold"]}
        options={FORMAT_OPTIONS}
        aria-label="Text formatting"
      />
      <ButtonGroup
        variant="outlined"
        size="md"
        selectionMode="multi"
        defaultValue={["bold"]}
        options={ICON_OPTIONS}
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
