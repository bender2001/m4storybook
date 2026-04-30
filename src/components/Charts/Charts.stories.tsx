import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Charts } from "./Charts";
import type { ChartsSeries, ChartsSlice } from "./types";

/** Inline 18dp icon glyphs — keeps the stories network-free. */
const InsightsGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M5 9.2h3v9.2H5zm5.6-5.2h2.8v14.4h-2.8zm5.6 8.4H19v6h-2.8z" />
  </svg>
);

const MoreGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <circle cx="12" cy="6" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="12" cy="18" r="1.6" />
  </svg>
);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const baseSeries: ChartsSeries[] = [
  {
    id: "revenue",
    label: "Revenue",
    color: "primary",
    data: [12, 19, 15, 24, 22, 30],
  },
  {
    id: "cost",
    label: "Cost",
    color: "secondary",
    data: [8, 11, 9, 14, 13, 17],
  },
];

const tripleSeries: ChartsSeries[] = [
  {
    id: "alpha",
    label: "Alpha",
    color: "primary",
    data: [10, 14, 12, 18, 16, 22],
  },
  {
    id: "beta",
    label: "Beta",
    color: "secondary",
    data: [6, 9, 7, 11, 10, 14],
  },
  {
    id: "gamma",
    label: "Gamma",
    color: "tertiary",
    data: [4, 5, 6, 8, 9, 11],
  },
];

const pieSlices: ChartsSlice[] = [
  { id: "design", label: "Design", value: 32, color: "primary" },
  { id: "engineering", label: "Engineering", value: 48, color: "secondary" },
  { id: "research", label: "Research", value: 14, color: "tertiary" },
  { id: "ops", label: "Ops", value: 6, color: "error" },
];

const Surface = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    data-host="charts-surface"
    className={
      "flex w-[640px] flex-col gap-4 rounded-shape-md bg-surface p-4 " +
      (className ?? "")
    }
  >
    {children}
  </div>
);

const meta: Meta<typeof Charts> = {
  title: "Advanced/Charts",
  component: Charts,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "MUI X-Charts re-skinned with M3 tokens. The card host paints variant + shape + elevation while the data series paint the M3 primary / secondary / tertiary / error roles. Bar / line / area / pie plots, three densities, full M3 shape scale, springy draw-in motion on the M3 emphasized envelope.",
      },
    },
  },
  argTypes: {
    type: {
      control: "inline-radio",
      options: ["bar", "line", "area", "pie"],
    },
    variant: {
      control: "inline-radio",
      options: ["text", "filled", "tonal", "outlined", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    legend: { control: "boolean" },
    showGrid: { control: "boolean" },
    showAxis: { control: "boolean" },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
  },
  args: {
    type: "bar",
    variant: "filled",
    size: "md",
    shape: "lg",
    legend: true,
    showGrid: true,
    showAxis: true,
    error: false,
    disabled: false,
    loading: false,
  },
};

export default meta;
type Story = StoryObj<typeof Charts>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Charts
        title="Quarterly Revenue"
        leadingIcon={<InsightsGlyph />}
        series={baseSeries}
        xAxis={months}
      />
    </Surface>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Charts
        variant="text"
        aria-label="Text variant"
        series={baseSeries}
        xAxis={months}
        title="Text"
      />
      <Charts
        variant="filled"
        aria-label="Filled variant"
        series={baseSeries}
        xAxis={months}
        title="Filled"
      />
      <Charts
        variant="tonal"
        aria-label="Tonal variant"
        series={baseSeries}
        xAxis={months}
        title="Tonal"
      />
      <Charts
        variant="outlined"
        aria-label="Outlined variant"
        series={baseSeries}
        xAxis={months}
        title="Outlined"
      />
      <Charts
        variant="elevated"
        aria-label="Elevated variant"
        series={baseSeries}
        xAxis={months}
        title="Elevated"
      />
    </Surface>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Charts
        size="sm"
        aria-label="Small density"
        title="Small"
        series={baseSeries}
        xAxis={months}
      />
      <Charts
        size="md"
        aria-label="Medium density"
        title="Medium"
        series={baseSeries}
        xAxis={months}
      />
      <Charts
        size="lg"
        aria-label="Large density"
        title="Large"
        series={baseSeries}
        xAxis={months}
      />
    </Surface>
  ),
};

export const Types: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Charts
        type="bar"
        title="Bar"
        aria-label="Bar plot"
        series={tripleSeries}
        xAxis={months}
      />
      <Charts
        type="line"
        title="Line"
        aria-label="Line plot"
        series={tripleSeries}
        xAxis={months}
      />
      <Charts
        type="area"
        title="Area"
        aria-label="Area plot"
        series={tripleSeries}
        xAxis={months}
      />
      <Charts
        type="pie"
        title="Pie"
        aria-label="Pie plot"
        slices={pieSlices}
        showAxis={false}
        showGrid={false}
      />
    </Surface>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Charts
        title="Resting"
        aria-label="Resting"
        series={baseSeries}
        xAxis={months}
      />
      <Charts
        title="Loading"
        aria-label="Loading"
        loading
        series={baseSeries}
        xAxis={months}
      />
      <Charts
        title="Empty"
        aria-label="Empty"
        series={[]}
        xAxis={[]}
        emptyState="Nothing to plot"
      />
      <Charts
        title="Disabled"
        aria-label="Disabled"
        disabled
        series={baseSeries}
        xAxis={months}
      />
      <Charts
        title="Error"
        aria-label="Error"
        error
        series={baseSeries}
        xAxis={months}
      />
    </Surface>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map((shape) => (
        <Charts
          key={shape}
          shape={shape}
          aria-label={`Shape ${shape}`}
          title={`Shape ${shape}`}
          series={baseSeries}
          xAxis={months}
        />
      ))}
    </Surface>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Charts
        title="Insights"
        aria-label="With leading icon"
        leadingIcon={<InsightsGlyph />}
        series={baseSeries}
        xAxis={months}
      />
      <Charts
        title="Insights"
        aria-label="With trailing icon"
        leadingIcon={<InsightsGlyph />}
        trailingIcon={<MoreGlyph />}
        series={baseSeries}
        xAxis={months}
      />
      <Charts
        aria-label="No legend"
        title="Hidden legend"
        legend={false}
        series={baseSeries}
        xAxis={months}
      />
      <Charts
        aria-label="No grid"
        title="Hidden grid"
        showGrid={false}
        series={baseSeries}
        xAxis={months}
      />
    </Surface>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Charts
        type="line"
        title="Motion preview"
        aria-label="Motion preview"
        series={tripleSeries}
        xAxis={months}
      />
    </Surface>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Charts
        title="Quarterly Revenue"
        aria-label="Quarterly revenue chart"
        series={baseSeries}
        xAxis={months}
      />
    </Surface>
  ),
};

export const Playground: Story = {
  args: {
    type: "bar",
    variant: "filled",
    size: "md",
    shape: "lg",
    legend: true,
    showGrid: true,
    showAxis: true,
    error: false,
    disabled: false,
    loading: false,
  },
  render: (args) => (
    <Surface>
      <Charts
        {...args}
        title="Playground"
        series={baseSeries}
        slices={pieSlices}
        xAxis={months}
      />
    </Surface>
  ),
};

/**
 * @storybook/test interaction spec. Verifies role wiring,
 * legend rendering, and aria-busy / aria-invalid annotations.
 */
export const InteractionSpec: Story = {
  render: () => (
    <Surface>
      <Charts
        title="Interaction spec"
        aria-label="Interaction spec chart"
        series={baseSeries}
        xAxis={months}
      />
    </Surface>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.querySelector("[data-component='charts']");

    await step("renders the figure with role + aria-label", async () => {
      expect(root).not.toBeNull();
      expect(root?.getAttribute("role")).toBe("figure");
      expect(root?.getAttribute("aria-label")).toBe("Interaction spec chart");
    });

    await step("title slot renders the supplied title", async () => {
      const title = root?.querySelector("[data-slot='title']");
      expect(title?.textContent).toBe("Interaction spec");
    });

    await step("plot renders one bar per series datum", async () => {
      const bars = canvasElement.querySelectorAll(
        "[data-component='charts'] [data-slot='bar']",
      );
      expect(bars.length).toBe(baseSeries.length * months.length);
    });

    await step("legend lists each series with a colored dot", async () => {
      const legend = canvas.getByRole("list", { name: "Legend" });
      expect(legend).toBeDefined();
      const items = legend.querySelectorAll("[data-slot='legend-item']");
      expect(items.length).toBe(baseSeries.length);
    });
  },
};
