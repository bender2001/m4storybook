import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Inputs/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Expressive Button. Five variants (filled, tonal, outlined, text, elevated) with springy press, shape morphing, and a state-layer driven by hover/focus/pressed. See https://m3.material.io/components/buttons/specs.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["filled", "tonal", "outlined", "text", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    selected: { control: "boolean" },
    onClick: { action: "clicked" },
  },
  args: {
    children: "Button",
    variant: "filled",
    size: "md",
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      <Button {...args} variant="filled">Filled</Button>
      <Button {...args} variant="tonal">Tonal</Button>
      <Button {...args} variant="outlined">Outlined</Button>
      <Button {...args} variant="text">Text</Button>
      <Button {...args} variant="elevated">Elevated</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      <Button {...args}>Default</Button>
      <Button {...args} selected>Selected</Button>
      <Button {...args} disabled>Disabled</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      <Button {...args} startIcon={<span>+</span>}>Add item</Button>
      <Button {...args} endIcon={<span>→</span>}>Continue</Button>
    </div>
  ),
};

export const Playground: Story = {
  args: { children: "Click me" },
};
