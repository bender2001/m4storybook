import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Inputs/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Checkbox: a 18dp box with a 2dp shape-xs corner radius, a 40dp circular state-layer, and a springy check-morph driven by motion/react. See https://m3.material.io/components/checkbox/specs.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "error"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    labelPlacement: { control: "inline-radio", options: ["start", "end"] },
    checked: {
      control: "select",
      options: [false, true, "indeterminate"],
    },
    disabled: { control: "boolean" },
    label: { control: "text" },
    helperText: { control: "text" },
    onChange: { action: "changed" },
  },
  args: {
    label: "Subscribe to updates",
    size: "md",
    variant: "default",
    labelPlacement: "end",
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: { onChange: fn() },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Checkbox {...args} variant="default" label="Default unchecked" />
      <Checkbox
        {...args}
        variant="default"
        defaultChecked
        label="Default checked"
      />
      <Checkbox
        {...args}
        variant="default"
        defaultChecked="indeterminate"
        label="Default indeterminate"
      />
      <Checkbox {...args} variant="error" label="Error unchecked" />
      <Checkbox
        {...args}
        variant="error"
        defaultChecked
        label="Error checked"
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Checkbox {...args} size="sm" defaultChecked label="Small" />
      <Checkbox {...args} size="md" defaultChecked label="Medium" />
      <Checkbox {...args} size="lg" defaultChecked label="Large" />
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Checkbox {...args} label="Unchecked" />
      <Checkbox {...args} defaultChecked label="Checked" />
      <Checkbox
        {...args}
        defaultChecked="indeterminate"
        label="Indeterminate"
      />
      <Checkbox {...args} disabled label="Disabled unchecked" />
      <Checkbox {...args} disabled defaultChecked label="Disabled checked" />
      <Checkbox
        {...args}
        variant="error"
        label="Error"
        helperText="This field is required"
      />
    </div>
  ),
};

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

export const WithIcons: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox
        defaultChecked
        startIcon={<StarIcon />}
        label="Mark as favorite"
      />
      <Checkbox
        endIcon={<ChevronIcon />}
        label="Show advanced options"
        helperText="Reveals 5 additional toggles"
      />
      <Checkbox
        labelPlacement="start"
        defaultChecked
        label="Trailing checkbox"
        helperText="Box renders to the right of the label"
      />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    onChange: fn(),
    helperText: "Receive a weekly newsletter",
  },
};

/**
 * Interaction test: clicks the box, asserts the change handler fires
 * with `true`, then clicks again and asserts it fires with `false`.
 * Also drives keyboard activation via Space to confirm a11y.
 */
export const Interaction: Story = {
  args: {
    onChange: fn(),
    label: "Newsletter",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole("checkbox", { name: "Newsletter" });

    await userEvent.click(box);
    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(true);
    });
    expect(box).toHaveAttribute("aria-checked", "true");

    await userEvent.click(box);
    await waitFor(() => {
      expect(args.onChange).toHaveBeenLastCalledWith(false);
    });
    expect(box).toHaveAttribute("aria-checked", "false");

    // Keyboard activation: focus + space toggles.
    box.focus();
    await userEvent.keyboard(" ");
    await waitFor(() => {
      expect(args.onChange).toHaveBeenLastCalledWith(true);
    });
    expect(box).toHaveAttribute("aria-checked", "true");
  },
};
