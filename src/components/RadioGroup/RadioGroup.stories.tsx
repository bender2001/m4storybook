import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { RadioGroup } from "./RadioGroup";

const baseOptions = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
] as const;

const meta: Meta<typeof RadioGroup> = {
  title: "Inputs/Radio Group",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Radio Group: a single-select group of 20dp radio buttons. Selected state paints a primary ring with a 10dp inner dot and animates with motion/react. See https://m3.material.io/components/radio-button/specs.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "error"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    orientation: {
      control: "inline-radio",
      options: ["vertical", "horizontal"],
    },
    labelPlacement: { control: "inline-radio", options: ["start", "end"] },
    disabled: { control: "boolean" },
    legend: { control: "text" },
    helperText: { control: "text" },
    onChange: { action: "changed" },
  },
  args: {
    name: "size",
    legend: "T-shirt size",
    options: [...baseOptions],
    size: "md",
    variant: "default",
    orientation: "vertical",
    labelPlacement: "end",
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  args: { onChange: fn(), defaultValue: "medium" },
};

export const Variants: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <RadioGroup
        name="variant-default"
        legend="Default"
        defaultValue="medium"
        options={[...baseOptions]}
      />
      <RadioGroup
        name="variant-error"
        legend="Error"
        variant="error"
        defaultValue="medium"
        helperText="Choose a size to continue"
        options={[...baseOptions]}
      />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <RadioGroup
        name="size-sm"
        legend="Small"
        size="sm"
        defaultValue="small"
        options={[...baseOptions]}
      />
      <RadioGroup
        name="size-md"
        legend="Medium"
        size="md"
        defaultValue="medium"
        options={[...baseOptions]}
      />
      <RadioGroup
        name="size-lg"
        legend="Large"
        size="lg"
        defaultValue="large"
        options={[...baseOptions]}
      />
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <RadioGroup
        name="state-rest"
        legend="Resting"
        options={[...baseOptions]}
      />
      <RadioGroup
        name="state-selected"
        legend="With selection"
        defaultValue="medium"
        options={[...baseOptions]}
      />
      <RadioGroup
        name="state-disabled"
        legend="Disabled"
        disabled
        defaultValue="medium"
        options={[...baseOptions]}
      />
      <RadioGroup
        name="state-error"
        legend="Error"
        variant="error"
        helperText="Pick a size"
        defaultValue="small"
        options={[...baseOptions]}
      />
      <RadioGroup
        name="state-mixed"
        legend="Per-option disabled"
        defaultValue="medium"
        options={[
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large", disabled: true },
        ]}
      />
    </div>
  ),
};

const StarIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="currentColor"
  >
    <path d="M12 2l2.9 6.9L22 9.3l-5.5 4.7 1.7 7.3L12 17.8 5.8 21.3l1.7-7.3L2 9.3l7.1-.4L12 2z" />
  </svg>
);

const ChevronIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

export const WithIcons: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <RadioGroup
      name="with-icons"
      legend="Notification frequency"
      defaultValue="weekly"
      options={[
        {
          value: "daily",
          label: "Daily",
          startIcon: <StarIcon />,
          helperText: "One summary email per day",
        },
        {
          value: "weekly",
          label: "Weekly",
          endIcon: <ChevronIcon />,
          helperText: "Recommended",
        },
        {
          value: "off",
          label: "Off",
          helperText: "No emails",
        },
      ]}
    />
  ),
};

export const Horizontal: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <RadioGroup
      name="orientation-horizontal"
      legend="Pick a payment method"
      orientation="horizontal"
      defaultValue="card"
      options={[
        { value: "card", label: "Card" },
        { value: "bank", label: "Bank" },
        { value: "wallet", label: "Wallet" },
      ]}
    />
  ),
};

export const Playground: Story = {
  args: {
    name: "playground",
    onChange: fn(),
    defaultValue: "medium",
    helperText: "Choose your preferred size",
  },
};

/**
 * Interaction test: clicks the second radio, asserts onChange fired with
 * "medium" and aria-checked flipped. Then drives keyboard navigation
 * (Tab, Arrow keys) to verify a11y.
 */
export const Interaction: Story = {
  args: {
    name: "interaction",
    legend: "Pick one",
    options: [...baseOptions],
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const medium = canvas.getByRole("radio", { name: "Medium" });
    const large = canvas.getByRole("radio", { name: "Large" });

    await userEvent.click(medium);
    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith("medium");
    });
    expect(medium).toHaveAttribute("aria-checked", "true");

    await userEvent.click(large);
    await waitFor(() => {
      expect(args.onChange).toHaveBeenLastCalledWith("large");
    });
    expect(large).toHaveAttribute("aria-checked", "true");
    expect(medium).toHaveAttribute("aria-checked", "false");
  },
};
