import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState, type ReactNode } from "react";
import { DatePicker } from "./DatePicker";

const FIXED_TODAY = new Date(2024, 5, 15);
const seedDate = (offset = 0) => {
  const d = new Date(FIXED_TODAY);
  d.setDate(d.getDate() + offset);
  return d;
};

const Stage = ({
  children,
  width = "w-[360px]",
  className,
}: {
  children?: ReactNode;
  width?: string;
  className?: string;
}) => (
  <div
    data-host="date-picker-stage"
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

const meta: Meta<typeof DatePicker> = {
  title: "Advanced/Date Picker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3-tokenized DatePicker. Re-skins MUI X DatePicker (https://mui.com/x/react-date-pickers/date-picker/) onto M3 tokens. The selected-day indicator is a circular `bg-primary` cursor that springs between days via a shared `layoutId` and morphs from `shape-xs` to the selected `shape` token via motion/react springs. 5 variants (filled / tonal / outlined / text / elevated), 3 densities (40 / 56 / 64 dp triggers, 32 / 40 / 48 dp days), 7 shapes, single-date selection with Cancel/OK actions, hover 0.08 / focus 0.10 / pressed 0.10 state-layers, and roving-tabindex keyboard nav (Arrow / Home / End / PageUp / PageDown / Enter / Space / Escape).",
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
    label: "Travel date",
    supportingText: "MM/DD/YYYY",
    placeholder: "MM/DD/YYYY",
    disabled: false,
    error: false,
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <DatePicker
        label="Travel date"
        supportingText="MM/DD/YYYY"
        defaultValue={seedDate(0)}
        ariaLabel="Travel date"
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
            <DatePicker
              variant={variant}
              label="Travel date"
              supportingText="MM/DD/YYYY"
              defaultValue={seedDate(0)}
              ariaLabel={`${variant} date picker`}
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
          <DatePicker
            size={size}
            label="Travel date"
            defaultValue={seedDate(0)}
            ariaLabel={`${size} date picker`}
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
            <DatePicker
              shape={shape}
              label="Travel date"
              defaultValue={seedDate(0)}
              defaultOpen
              ariaLabel={`${shape} date picker`}
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
        <DatePicker label="Travel date" placeholder="MM/DD/YYYY" />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          selected
        </span>
        <DatePicker
          label="Travel date"
          defaultValue={seedDate(2)}
          ariaLabel="selected date picker"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          error
        </span>
        <DatePicker
          label="Travel date"
          supportingText="Date is required"
          error
          ariaLabel="error date picker"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          disabled
        </span>
        <DatePicker
          label="Travel date"
          supportingText="Locked until next quarter"
          defaultValue={seedDate(0)}
          disabled
          ariaLabel="disabled date picker"
        />
      </Stage>
    </div>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <DatePicker
        label="Departure"
        supportingText="MM/DD/YYYY"
        defaultValue={seedDate(0)}
        leadingIcon={<FlightIcon />}
        ariaLabel="departure date picker"
      />
    </Stage>
  ),
};

export const OpenPanel: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage className="pb-[420px]">
      <DatePicker
        label="Travel date"
        defaultValue={seedDate(0)}
        defaultOpen
        ariaLabel="open date picker"
      />
    </Stage>
  ),
};

export const OpenToday: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage className="pb-[420px]">
      <DatePicker
        label="Travel date"
        defaultOpen
        ariaLabel="today date picker"
      />
    </Stage>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage className="pb-[420px]">
      <DatePicker
        label="Travel date"
        defaultValue={seedDate(0)}
        defaultOpen
        ariaLabel="motion date picker"
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
        <DatePicker
          label="Travel date"
          supportingText="MM/DD/YYYY"
          defaultValue={seedDate(0)}
          ariaLabel="Accessible date picker"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          aria-label only
        </span>
        <DatePicker
          ariaLabel="Pick a travel date"
          defaultValue={seedDate(0)}
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
    label: "Travel date",
    supportingText: "MM/DD/YYYY",
    placeholder: "MM/DD/YYYY",
    disabled: false,
    error: false,
  },
  render: (args) => (
    <Stage>
      <DatePicker
        {...args}
        defaultValue={seedDate(0)}
        ariaLabel="playground date picker"
      />
    </Stage>
  ),
};

export const InteractionSpec: Story = {
  args: { onValueChange: fn(), onOpenChange: fn() },
  render: (args) => {
    const InteractiveHost = () => {
      const [value, setValue] = useState<Date | null>(seedDate(0));
      return (
        <div data-testid="dp-host" className="space-y-4">
          <span data-testid="dp-value" className="block text-on-surface">
            value: {value ? value.toISOString().slice(0, 10) : "(none)"}
          </span>
          <Stage className="pb-[420px]">
            <DatePicker
              {...args}
              label="Travel date"
              value={value}
              onValueChange={(next) => {
                setValue(next);
                args.onValueChange?.(next);
              }}
              ariaLabel="interactive date picker"
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
        name: /interactive date picker/i,
      });
      expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    await step("clicking the trigger opens the calendar dialog", async () => {
      const trigger = await canvas.findByRole("button", {
        name: /interactive date picker/i,
      });
      await userEvent.click(trigger);
      expect(args.onOpenChange).toHaveBeenCalledWith(true);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      const dialog = await canvas.findByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    await step("today is flagged via aria-current=date", async () => {
      const dialog = await canvas.findByRole("dialog");
      const today = within(dialog).getAllByRole("gridcell").find((cell) => cell.getAttribute("aria-current") === "date");
      expect(today).toBeTruthy();
    });
  },
};
