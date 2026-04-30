import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState, type ReactNode } from "react";
import { DateRangePicker } from "./DateRangePicker";
import type { DateRange } from "./types";

const FIXED_TODAY = new Date(2024, 5, 15);
const seedDate = (offset = 0) => {
  const d = new Date(FIXED_TODAY);
  d.setDate(d.getDate() + offset);
  return d;
};

const seedRange = (startOffset: number, endOffset: number): DateRange => ({
  start: seedDate(startOffset),
  end: seedDate(endOffset),
});

const Stage = ({
  children,
  width = "w-[400px]",
  className,
}: {
  children?: ReactNode;
  width?: string;
  className?: string;
}) => (
  <div
    data-host="date-range-picker-stage"
    className={
      "relative " +
      width +
      " rounded-shape-md bg-surface-container-low p-6 " +
      (className ?? "")
    }
  >
    {children}
  </div>
);

const FlightIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z" />
  </svg>
);

const meta: Meta<typeof DateRangePicker> = {
  title: "Advanced/Date Range Picker",
  component: DateRangePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3-tokenized DateRangePicker. Re-skins MUI X DateRangePicker (https://mui.com/x/react-date-pickers/date-range-picker/) onto M3 tokens. Two endpoint cursors paint `bg-primary` and spring between days via shared `layoutId` motion spans, morphing from `shape-xs` to the picker's `shape` token; the days strictly between them paint a continuous `primary-container` range fill. 5 variants (filled / tonal / outlined / text / elevated), 3 densities (40 / 56 / 64 dp triggers, 32 / 40 / 48 dp days), 7 shapes, click cycle (start → end → reset), Cancel/OK actions, hover 0.08 / focus 0.10 / pressed 0.10 state-layers, and roving-tabindex keyboard nav (Arrow / Home / End / PageUp / PageDown / Enter / Space / Escape).",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["filled", "tonal", "outlined", "text", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    label: { control: "text" },
    supportingText: { control: "text" },
    placeholder: { control: "text" },
  },
  args: {
    variant: "filled",
    size: "md",
    shape: "xl",
    label: "Travel range",
    supportingText: "Start – End",
    placeholder: "Start – End",
    disabled: false,
    error: false,
  },
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <DateRangePicker
        label="Travel range"
        supportingText="Start – End"
        defaultValue={seedRange(0, 4)}
        ariaLabel="Travel range"
      />
    </Stage>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["filled", "tonal", "outlined", "text", "elevated"] as const).map(
        (variant) => (
          <Stage key={variant}>
            <span className="block text-label-l text-on-surface mb-3">
              {variant}
            </span>
            <DateRangePicker
              variant={variant}
              label="Travel range"
              supportingText="Start – End"
              defaultValue={seedRange(0, 4)}
              ariaLabel={`${variant} date range picker`}
            />
          </Stage>
        ),
      )}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Stage key={size}>
          <span className="block text-label-l text-on-surface mb-3">
            {size}
          </span>
          <DateRangePicker
            size={size}
            label="Travel range"
            defaultValue={seedRange(0, 4)}
            ariaLabel={`${size} date range picker`}
          />
        </Stage>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <Stage key={shape}>
            <span className="block text-label-l text-on-surface mb-3">
              {shape}
            </span>
            <DateRangePicker
              shape={shape}
              label="Travel range"
              defaultValue={seedRange(0, 4)}
              defaultOpen
              ariaLabel={`${shape} date range picker`}
            />
          </Stage>
        ),
      )}
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          empty
        </span>
        <DateRangePicker label="Travel range" placeholder="Start – End" />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          selected
        </span>
        <DateRangePicker
          label="Travel range"
          defaultValue={seedRange(2, 6)}
          ariaLabel="selected date range picker"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          error
        </span>
        <DateRangePicker
          label="Travel range"
          supportingText="Range is required"
          error
          ariaLabel="error date range picker"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          disabled
        </span>
        <DateRangePicker
          label="Travel range"
          supportingText="Locked until next quarter"
          defaultValue={seedRange(0, 4)}
          disabled
          ariaLabel="disabled date range picker"
        />
      </Stage>
    </div>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <DateRangePicker
        label="Trip"
        supportingText="Start – End"
        defaultValue={seedRange(0, 4)}
        leadingIcon={<FlightIcon />}
        ariaLabel="trip date range picker"
      />
    </Stage>
  ),
};

export const OpenPanel: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage className="pb-[440px]">
      <DateRangePicker
        label="Travel range"
        defaultValue={seedRange(0, 4)}
        defaultOpen
        ariaLabel="open date range picker"
      />
    </Stage>
  ),
};

export const OpenToday: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage className="pb-[440px]">
      <DateRangePicker
        label="Travel range"
        defaultOpen
        ariaLabel="today date range picker"
      />
    </Stage>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage className="pb-[440px]">
      <DateRangePicker
        label="Travel range"
        defaultValue={seedRange(0, 4)}
        defaultOpen
        ariaLabel="motion date range picker"
      />
    </Stage>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          aria-haspopup + aria-expanded
        </span>
        <DateRangePicker
          label="Travel range"
          supportingText="Start – End"
          defaultValue={seedRange(0, 4)}
          ariaLabel="Accessible date range picker"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          aria-label only
        </span>
        <DateRangePicker
          ariaLabel="Pick a travel range"
          defaultValue={seedRange(0, 4)}
        />
      </Stage>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "filled",
    size: "md",
    shape: "xl",
    label: "Travel range",
    supportingText: "Start – End",
    placeholder: "Start – End",
    disabled: false,
    error: false,
  },
  render: (args) => (
    <Stage>
      <DateRangePicker
        {...args}
        defaultValue={seedRange(0, 4)}
        ariaLabel="playground date range picker"
      />
    </Stage>
  ),
};

export const InteractionSpec: Story = {
  args: { onValueChange: fn(), onOpenChange: fn() },
  render: (args) => {
    const InteractiveHost = () => {
      const [value, setValue] = useState<DateRange>(seedRange(0, 4));
      return (
        <div data-testid="drp-host" className="space-y-4">
          <span data-testid="drp-value" className="block text-on-surface">
            value: {value.start ? value.start.toISOString().slice(0, 10) : "(none)"}
            {" – "}
            {value.end ? value.end.toISOString().slice(0, 10) : "(none)"}
          </span>
          <Stage className="pb-[440px]">
            <DateRangePicker
              {...args}
              label="Travel range"
              value={value}
              onValueChange={(next) => {
                setValue(next);
                args.onValueChange?.(next);
              }}
              ariaLabel="interactive date range picker"
            />
          </Stage>
        </div>
      );
    };
    return <InteractiveHost />;
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step("trigger exposes aria-haspopup + aria-expanded=false", async () => {
      const trigger = await canvas.findByRole("button", {
        name: /interactive date range picker/i,
      });
      expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    await step("clicking the trigger opens the calendar dialog", async () => {
      const trigger = await canvas.findByRole("button", {
        name: /interactive date range picker/i,
      });
      await userEvent.click(trigger);
      expect(args.onOpenChange).toHaveBeenCalledWith(true);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      const dialog = await canvas.findByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    await step("today is flagged via aria-current=date", async () => {
      const dialog = await canvas.findByRole("dialog");
      const today = within(dialog)
        .getAllByRole("gridcell")
        .find((cell) => cell.getAttribute("aria-current") === "date");
      expect(today).toBeTruthy();
    });
  },
};
