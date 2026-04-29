import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { Autocomplete } from "./Autocomplete";

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

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
    <path d="M10 18a7.95 7.95 0 0 0 4.9-1.7l4.4 4.4 1.4-1.4-4.4-4.4A8 8 0 1 0 10 18Zm0-14a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
  </svg>
);

const meta: Meta<typeof Autocomplete> = {
  title: "Inputs/Autocomplete",
  component: Autocomplete,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3-tokenized Autocomplete (MUI fallback re-skinned with M3 outlined/filled Text Field anatomy and a tokenized Menu popup). All motion routes through motion/react and respects the reduced-motion toggle. See https://m3.material.io/components/text-fields/specs and https://m3.material.io/components/menus/specs.",
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
type Story = StoryObj<typeof Autocomplete>;

export const Default: Story = {
  args: { onChange: fn() },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Autocomplete {...args} variant="outlined" label="Outlined" />
      <Autocomplete {...args} variant="filled" label="Filled" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Autocomplete {...args} size="sm" label="Small (40dp)" />
      <Autocomplete {...args} size="md" label="Medium (56dp)" />
      <Autocomplete {...args} size="lg" label="Large (72dp)" />
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Autocomplete {...args} label="Default" />
      <Autocomplete {...args} label="With selection" defaultValue="us" />
      <Autocomplete
        {...args}
        label="Error"
        error
        helperText="Required field"
      />
      <Autocomplete {...args} label="Disabled" disabled />
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Autocomplete {...args} label="Search countries" leadingIcon={<SearchIcon />} />
    </div>
  ),
};

export const Playground: Story = {
  args: { onChange: fn() },
};

/**
 * Storybook interaction test: opens the listbox, types a query, navigates with
 * the keyboard, selects an option, and asserts the resulting state.
 */
export const Interaction: Story = {
  args: { onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");

    await userEvent.click(input);
    await waitFor(() => {
      expect(input).toHaveAttribute("aria-expanded", "true");
    });

    await userEvent.type(input, "fr");
    await waitFor(() => {
      expect(canvas.getByText("France")).toBeVisible();
    });

    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(
        "fr",
        expect.objectContaining({ value: "fr", label: "France" }),
      );
    });
    expect(input).toHaveValue("France");
  },
};
