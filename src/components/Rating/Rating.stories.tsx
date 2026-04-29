import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { Rating } from "./Rating";

const meta: Meta<typeof Rating> = {
  title: "Inputs/Rating",
  component: Rating,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "MUI fallback re-skinned with M3 tokens. Each symbol paints from token roles (filled = primary, empty = on-surface-variant), state-layer opacities follow M3 (0.08/0.10/0.10), and motion routes through motion/react with the springy preset. Half-precision is supported.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "accent"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    precision: { control: "inline-radio", options: [0.5, 1] },
    max: { control: { type: "number", min: 1, max: 10 } },
    readOnly: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    helperText: { control: "text" },
    onChange: { action: "changed" },
    onChangeActive: { action: "active" },
  },
  args: {
    name: "rating",
    label: "Rate this",
    size: "md",
    variant: "default",
    max: 5,
    precision: 1,
    readOnly: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Rating>;

export const Default: Story = {
  args: { onChange: fn(), defaultValue: 3 },
};

export const Variants: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <Rating
        name="variant-default"
        label="Default (primary)"
        defaultValue={4}
      />
      <Rating
        name="variant-accent"
        label="Accent (tertiary)"
        variant="accent"
        defaultValue={4}
      />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <Rating name="size-sm" label="Small" size="sm" defaultValue={3} />
      <Rating name="size-md" label="Medium" size="md" defaultValue={3} />
      <Rating name="size-lg" label="Large" size="lg" defaultValue={3} />
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <Rating name="state-rest" label="Resting" />
      <Rating
        name="state-selected"
        label="With selection"
        defaultValue={4}
      />
      <Rating
        name="state-disabled"
        label="Disabled"
        disabled
        defaultValue={3}
      />
      <Rating
        name="state-readonly"
        label="Read-only"
        readOnly
        defaultValue={4.5}
        precision={0.5}
      />
      <Rating
        name="state-half"
        label="Half precision"
        precision={0.5}
        defaultValue={3.5}
        helperText="Drag the cursor across a star to pick a half value"
      />
    </div>
  ),
};

const HeartFilled = ({ size = 24 }: { size?: number }) => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
  >
    <path d="M12 21s-7.5-4.6-9.6-9.4C1 7.7 3.7 4 7.4 4c2 0 3.7 1 4.6 2.5C12.9 5 14.6 4 16.6 4c3.7 0 6.4 3.7 5 7.6C19.5 16.4 12 21 12 21z" />
  </svg>
);

const HeartEmpty = ({ size = 24 }: { size?: number }) => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 21s-7.5-4.6-9.6-9.4C1 7.7 3.7 4 7.4 4c2 0 3.7 1 4.6 2.5C12.9 5 14.6 4 16.6 4c3.7 0 6.4 3.7 5 7.6C19.5 16.4 12 21 12 21z" />
  </svg>
);

export const WithIcons: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <Rating
        name="icons-stars"
        label="Stars"
        defaultValue={3}
        helperText="Default star glyph"
      />
      <Rating
        name="icons-hearts"
        label="Hearts"
        variant="accent"
        defaultValue={3}
        icon={<HeartFilled />}
        emptyIcon={<HeartEmpty />}
        helperText="Custom heart glyph + accent variant"
      />
      <Rating
        name="icons-half"
        label="Half-precision hearts"
        variant="accent"
        precision={0.5}
        defaultValue={2.5}
        icon={<HeartFilled />}
        emptyIcon={<HeartEmpty />}
      />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    name: "playground",
    onChange: fn(),
    defaultValue: 3,
    helperText: "Use the controls panel to drive the variant + size",
  },
};

/**
 * Interaction test: clicks the 4th star, asserts onChange(4) + the
 * input is checked. Then clicks the 4th star again to toggle off and
 * asserts onChange(null). Finally drives keyboard activation (focus +
 * Space) on the 2nd star and asserts onChange(2).
 */
export const Interaction: Story = {
  args: {
    name: "interaction",
    label: "Pick a value",
    onChange: fn(),
    defaultValue: null,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const four = canvas.getByRole("radio", { name: "4 Stars" });
    const two = canvas.getByRole("radio", { name: "2 Stars" });

    await userEvent.click(four);
    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(4);
    });
    expect(four).toBeChecked();

    await userEvent.click(four);
    await waitFor(() => {
      expect(args.onChange).toHaveBeenLastCalledWith(null);
    });

    two.focus();
    await userEvent.keyboard(" ");
    await waitFor(() => {
      expect(args.onChange).toHaveBeenLastCalledWith(2);
    });
  },
};
