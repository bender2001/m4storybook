import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { MaterialIcon } from "@/components/MaterialIcons";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Inputs/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Material 3 Button. Two variants (default and toggle) with five color configurations for default buttons and four for toggle buttons. See https://m3.material.io/components/buttons/specs.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "toggle"],
    },
    color: {
      control: "inline-radio",
      options: ["elevated", "filled", "tonal", "outlined", "text"],
      description:
        "M3 color configuration. Toggle buttons resolve text to filled because M3 does not define a text toggle style.",
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    softDisabled: { control: "boolean" },
    selected: { control: "boolean" },
    onClick: { action: "clicked" },
  },
  args: {
    children: "Button",
    variant: "default",
    color: "filled",
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
  render: (args) => {
    const toggleColor = args.color === "text" ? "filled" : args.color;

    return (
      <div className="flex flex-wrap gap-3">
        <Button {...args} variant="default">Default</Button>
        <Button {...args} variant="toggle" color={toggleColor}>
          Toggle unselected
        </Button>
        <Button {...args} variant="toggle" color={toggleColor} selected>
          Toggle selected
        </Button>
      </div>
    );
  },
};

export const Colors: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      <Button {...args} variant="default" color="elevated">Elevated</Button>
      <Button {...args} variant="default" color="filled">Filled</Button>
      <Button {...args} variant="default" color="tonal">Tonal</Button>
      <Button {...args} variant="default" color="outlined">Outlined</Button>
      <Button {...args} variant="default" color="text">Text</Button>
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
      <Button {...args} variant="toggle" selected>Toggle selected</Button>
      <Button {...args} disabled>Disabled</Button>
      <Button {...args} softDisabled>Soft disabled</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      <Button {...args} startIcon={<MaterialIcon name="add" />}>Add item</Button>
      <Button {...args} endIcon={<MaterialIcon name="arrow_forward" />}>Continue</Button>
    </div>
  ),
};

export const Playground: Story = {
  args: { children: "Click me" },
};
