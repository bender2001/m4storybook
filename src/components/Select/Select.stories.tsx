import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { Select } from "./Select";

const COUNTRIES = [
  { value: "ar", label: "Argentina" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "de", label: "Germany" },
  { value: "es", label: "Spain" },
  { value: "fr", label: "France" },
  { value: "in", label: "India" },
  { value: "jp", label: "Japan" },
  { value: "kr", label: "South Korea" },
  { value: "mx", label: "Mexico" },
  { value: "us", label: "United States" },
];

const FlagIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
    <path d="M5 21V4h11l-1.5 4 1.5 4H7v9H5z" />
  </svg>
);

const meta: Meta<typeof Select> = {
  title: "Inputs/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3-tokenized Select (MUI fallback re-skinned with the M3 Text Field anatomy + tokenized Menu popup). The trigger advertises itself as a `combobox` with `aria-haspopup=listbox`. All motion routes through motion/react and respects the reduced-motion toggle. See https://m3.material.io/components/text-fields/specs and https://m3.material.io/components/menus/specs.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["filled", "outlined"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    label: { control: "text" },
    placeholder: { control: "text" },
    helperText: { control: "text" },
    onChange: { action: "changed" },
  },
  args: {
    label: "Country",
    placeholder: "Select a country",
    options: COUNTRIES,
    name: "country",
    variant: "outlined",
    size: "md",
    disabled: false,
    error: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: { onChange: fn() },
};

export const Variants: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Select {...args} variant="outlined" label="Outlined" />
      <Select {...args} variant="filled" label="Filled" />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Select {...args} size="sm" label="Small (40dp)" />
      <Select {...args} size="md" label="Medium (56dp)" />
      <Select {...args} size="lg" label="Large (72dp)" />
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Select {...args} label="Resting" />
      <Select {...args} label="With selection" defaultValue="us" />
      <Select
        {...args}
        label="Error"
        error
        helperText="Required field"
      />
      <Select {...args} label="Disabled" disabled defaultValue="fr" />
    </div>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Select
        {...args}
        label="Country"
        leadingIcon={<FlagIcon />}
        defaultValue="us"
      />
      <Select
        {...args}
        variant="filled"
        label="Filled with icon"
        leadingIcon={<FlagIcon />}
      />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    onChange: fn(),
    helperText: "Use the controls panel to drive the variant + size",
  },
};

/**
 * Storybook interaction test: focuses the combobox trigger, opens
 * the menu with Enter, navigates with ArrowDown, commits with Enter,
 * and asserts the resulting state. Then opens again and dismisses
 * with Escape.
 */
export const Interaction: Story = {
  args: { onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    // Open via click.
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    // Move active option to "Brazil" (index 1) and commit.
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(
        "br",
        expect.objectContaining({ value: "br", label: "Brazil" }),
      );
    });

    // Trigger now reflects the selection.
    expect(trigger).toHaveTextContent("Brazil");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    // Re-open and dismiss with Escape.
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  },
};
