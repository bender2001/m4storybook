import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { Switch } from "./Switch";

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
    <path
      d="M5 12.5 10 17 19 7"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
    <path
      d="M6 6l12 12M18 6L6 18"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const meta: Meta<typeof Switch> = {
  title: "Inputs/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Expressive Switch: a 52×32dp pill-shaped track with a handle that slides and morphs between off (16dp), on (24dp), and pressed (28dp) states. Selected paints the primary role; unselected uses surface-container-highest with an outline border. Optional handle icons differentiate on/off. See https://m3.material.io/components/switch/specs.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["filled", "outlined"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    labelPlacement: { control: "inline-radio", options: ["start", "end"] },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    label: { control: "text" },
    helperText: { control: "text" },
    onChange: { action: "changed" },
  },
  args: {
    label: "Wi-Fi",
    name: "wifi",
    size: "md",
    variant: "filled",
    labelPlacement: "end",
    disabled: false,
    error: false,
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: { onChange: fn() },
};

export const Variants: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Switch {...args} variant="filled" label="Filled - off" />
      <Switch
        {...args}
        variant="filled"
        defaultChecked
        label="Filled - on"
      />
      <Switch {...args} variant="outlined" label="Outlined - off" />
      <Switch
        {...args}
        variant="outlined"
        defaultChecked
        label="Outlined - on"
      />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Switch {...args} size="sm" defaultChecked label="Small (24dp track)" />
      <Switch {...args} size="md" defaultChecked label="Medium (32dp track)" />
      <Switch {...args} size="lg" defaultChecked label="Large (40dp track)" />
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Switch {...args} label="Off" />
      <Switch {...args} defaultChecked label="On" />
      <Switch {...args} disabled label="Disabled off" />
      <Switch {...args} disabled defaultChecked label="Disabled on" />
      <Switch
        {...args}
        error
        defaultChecked
        label="Error"
        helperText="This setting failed to save"
      />
    </div>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Switch
        {...args}
        defaultChecked
        selectedIcon={<CheckIcon />}
        unselectedIcon={<CloseIcon />}
        label="Wi-Fi (with icons)"
        helperText="Selected handle shows check, unselected shows close"
      />
      <Switch
        {...args}
        selectedIcon={<CheckIcon />}
        unselectedIcon={<CloseIcon />}
        label="Bluetooth (with icons)"
      />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    onChange: fn(),
    helperText: "Toggle me",
  },
};

/**
 * Storybook interaction test: clicks the switch, asserts the change
 * handler fires with `true`, then keyboard-toggles back with Space.
 */
export const Interaction: Story = {
  args: {
    onChange: fn(),
    label: "Notifications",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const sw = canvas.getByRole("switch", { name: "Notifications" });

    await userEvent.click(sw);
    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(true);
    });
    expect(sw).toHaveAttribute("aria-checked", "true");

    sw.focus();
    await userEvent.keyboard(" ");
    await waitFor(() => {
      expect(args.onChange).toHaveBeenLastCalledWith(false);
    });
    expect(sw).toHaveAttribute("aria-checked", "false");
  },
};
