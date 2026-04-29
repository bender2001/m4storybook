import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { TextField } from "./TextField";

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
    <path
      d="M20 20l-4-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ClearIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
  </svg>
);

const meta: Meta<typeof TextField> = {
  title: "Inputs/Text Field",
  component: TextField,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Text Field — a 56dp tray with a floating label, leading/trailing icon slots, helper text, and an animated focus indicator. Filled paints surface-container-highest with a 1dp on-surface-variant indicator that morphs to 2dp primary on focus; outlined paints transparent with a 1dp outline that grows to 2dp primary and lets the floating label cut through the top edge. State-layer respects the M3 opacities (hover 0.08, focus 0.10, pressed 0.10). See https://m3.material.io/components/text-fields/specs.",
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
    label: "Email",
    name: "email",
    variant: "filled",
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
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: { onChange: fn() },
};

export const Variants: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <TextField {...args} variant="filled" label="Filled" />
      <TextField {...args} variant="outlined" label="Outlined" />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <TextField {...args} size="sm" label="Small (40dp)" />
      <TextField {...args} size="md" label="Medium (56dp)" />
      <TextField {...args} size="lg" label="Large (72dp)" />
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <TextField {...args} label="Resting" />
      <TextField
        {...args}
        label="Filled with value"
        defaultValue="hello@example.com"
      />
      <TextField
        {...args}
        label="Error"
        error
        defaultValue="not-an-email"
        helperText="Please enter a valid email"
      />
      <TextField
        {...args}
        label="Disabled"
        disabled
        defaultValue="cannot-edit@example.com"
      />
    </div>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <TextField
        {...args}
        label="Search"
        leadingIcon={<SearchIcon />}
        placeholder="Type to search…"
      />
      <TextField
        {...args}
        label="Username"
        defaultValue="meir"
        trailingIcon={<ClearIcon />}
      />
      <TextField
        {...args}
        variant="outlined"
        label="Outlined with icons"
        leadingIcon={<SearchIcon />}
        trailingIcon={<ClearIcon />}
      />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    onChange: fn(),
    helperText: "Use the controls panel to drive variant + size",
  },
};

/**
 * Storybook interaction test: focuses the input, types a value,
 * asserts onChange fires + the floating label has the floating data
 * attribute, then blurs and checks the value is preserved.
 */
export const Interaction: Story = {
  args: {
    label: "Username",
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Username") as HTMLInputElement;

    input.focus();
    await userEvent.keyboard("meir");

    await waitFor(() => {
      expect(args.onChange).toHaveBeenLastCalledWith("meir");
    });
    expect(input.value).toBe("meir");

    // Floating label should be in floating state.
    const label = canvas.getByText("Username");
    await waitFor(() => {
      expect(label).toHaveAttribute("data-floating", "true");
    });

    input.blur();
    // Value should persist on blur — label stays floated.
    expect(input.value).toBe("meir");
  },
};
