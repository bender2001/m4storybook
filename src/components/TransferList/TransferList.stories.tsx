import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { TransferList } from "./TransferList";
import type { TransferListItem, TransferListProps } from "./types";

const FRUITS: TransferListItem[] = [
  { id: "apple", label: "Apple" },
  { id: "banana", label: "Banana" },
  { id: "cherry", label: "Cherry" },
  { id: "durian", label: "Durian" },
  { id: "elderberry", label: "Elderberry" },
];

const FRUITS_DESCRIPTIONS: TransferListItem[] = [
  { id: "apple", label: "Apple", description: "12 in stock" },
  { id: "banana", label: "Banana", description: "8 in stock" },
  { id: "cherry", label: "Cherry", description: "Out of stock", disabled: true },
  { id: "durian", label: "Durian", description: "3 in stock" },
];

interface ControlledStoryProps extends Omit<TransferListProps, "source" | "target"> {
  initialSource?: TransferListItem[];
  initialTarget?: TransferListItem[];
}

function Controlled({
  initialSource = FRUITS,
  initialTarget = [],
  onChange,
  ...rest
}: ControlledStoryProps) {
  const [state, setState] = useState({
    source: initialSource,
    target: initialTarget,
  });

  return (
    <TransferList
      {...rest}
      source={state.source}
      target={state.target}
      onChange={(next) => {
        setState(next);
        onChange?.(next);
      }}
    />
  );
}

const meta: Meta<typeof TransferList> = {
  title: "Inputs/Transfer List",
  component: TransferList,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Transfer List — MUI fallback re-skinned with M3 tokens. Two surface-container-low cards (left source, right target) connected by a center action rail of 4 M3 Icon Buttons that move items in either direction (selected only, or all). Each row pairs a 24dp M3 Checkbox with a label + optional description; rows paint the M3 state-layer at hover 0.08, focus 0.10, pressed 0.10. No native M3 Expressive spec exists for Transfer List, so this matches the MUI behavior model with M3 tokens for surface, shape, type, motion, and elevation.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["filled", "outlined"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    sourceLabel: { control: "text" },
    targetLabel: { control: "text" },
    onChange: { action: "changed" },
  },
  args: {
    variant: "filled",
    size: "md",
    disabled: false,
    sourceLabel: "Choices",
    targetLabel: "Chosen",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 640 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TransferList>;

export const Default: Story = {
  args: { onChange: fn() },
  render: (args) => <Controlled {...(args as ControlledStoryProps)} />,
};

export const Variants: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Controlled {...(args as ControlledStoryProps)} variant="filled" sourceLabel="Filled source" targetLabel="Filled target" />
      <Controlled {...(args as ControlledStoryProps)} variant="outlined" sourceLabel="Outlined source" targetLabel="Outlined target" />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Controlled {...(args as ControlledStoryProps)} size="sm" sourceLabel="Small (32dp)" />
      <Controlled {...(args as ControlledStoryProps)} size="md" sourceLabel="Medium (40dp)" />
      <Controlled {...(args as ControlledStoryProps)} size="lg" sourceLabel="Large (48dp)" />
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Controlled {...(args as ControlledStoryProps)} sourceLabel="Resting" />
      <Controlled
        {...(args as ControlledStoryProps)}
        sourceLabel="Pre-populated"
        initialSource={FRUITS.slice(0, 3)}
        initialTarget={FRUITS.slice(3)}
      />
      <Controlled
        {...(args as ControlledStoryProps)}
        sourceLabel="Disabled"
        targetLabel="Disabled"
        disabled
        initialSource={FRUITS.slice(0, 3)}
        initialTarget={FRUITS.slice(3)}
      />
    </div>
  ),
};

export const WithDescriptions: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <Controlled
      {...(args as ControlledStoryProps)}
      initialSource={FRUITS_DESCRIPTIONS}
      sourceLabel="Inventory"
      targetLabel="Order"
      helperText="Cherry is unavailable and cannot be moved."
    />
  ),
};

export const Playground: Story = {
  args: { onChange: fn(), helperText: "Use the controls panel to drive variant + size" },
  render: (args) => <Controlled {...(args as ControlledStoryProps)} />,
};

/**
 * Storybook interaction test: select two source rows, click the
 * single-right arrow, assert the rows moved to the target column.
 */
export const Interaction: Story = {
  args: { onChange: fn(), sourceLabel: "Choices", targetLabel: "Chosen" },
  render: (args) => <Controlled {...(args as ControlledStoryProps)} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const sourceRows = canvas
      .getAllByRole("option")
      .filter((row) => row.closest("[data-side='source']"));
    expect(sourceRows.length).toBe(FRUITS.length);

    // Click the first two source rows to select them.
    await userEvent.click(sourceRows[0]);
    await userEvent.click(sourceRows[1]);

    await waitFor(() => {
      expect(sourceRows[0].getAttribute("aria-selected")).toBe("true");
      expect(sourceRows[1].getAttribute("aria-selected")).toBe("true");
    });

    const moveRight = canvas.getByLabelText("Move selected to target");
    await userEvent.click(moveRight);

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalled();
    });

    const targetRows = canvas
      .getAllByRole("option")
      .filter((row) => row.closest("[data-side='target']"));
    expect(targetRows.length).toBe(2);
    const movedLabels = targetRows.map((row) =>
      row.querySelector("[data-transferlist-row-label]")?.textContent,
    );
    expect(movedLabels).toEqual([FRUITS[0].label, FRUITS[1].label]);
  },
};
