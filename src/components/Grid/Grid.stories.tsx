import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { type ReactElement } from "react";
import { Grid, GridItem } from "./Grid";

const StarGlyph = (): ReactElement => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const ChevronGlyph = (): ReactElement => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M9 6l6 6-6 6 1.4 1.4L17.8 12 10.4 4.6z" />
  </svg>
);

const cellPlaceholder = "h-12 rounded-shape-sm bg-primary-container text-on-primary-container flex items-center justify-center text-label-l";

const meta: Meta<typeof Grid> = {
  title: "Layout/Grid",
  component: Grid,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Grid. Token-aware 12-column layout primitive that re-skins MUI's Grid with the M3 surface / shape / elevation / motion scales. Supports five surface variants (text / filled / tonal / outlined / elevated), three densities, the full shape token scale, an optional interactive mode with M3 state-layer + Expressive shape morph, and a `<GridItem>` child for explicit column / row placement.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["text", "filled", "tonal", "outlined", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    elevation: { control: { type: "number", min: 0, max: 5, step: 1 } },
    columns: { control: { type: "number", min: 1, max: 12, step: 1 } },
    spacing: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl"],
    },
    flow: {
      control: "inline-radio",
      options: ["row", "column", "row-dense", "column-dense"],
    },
    align: {
      control: "inline-radio",
      options: ["start", "center", "end", "stretch", "baseline"],
    },
    justify: {
      control: "inline-radio",
      options: ["start", "center", "end", "between", "around", "evenly"],
    },
    interactive: { control: "boolean" },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
  },
  args: {
    variant: "filled",
    size: "md",
    shape: "md",
    elevation: 0,
    columns: 12,
    flow: "row",
    align: "stretch",
    justify: "start",
    interactive: false,
    selected: false,
    disabled: false,
    error: false,
  },
};

export default meta;
type Story = StoryObj<typeof Grid>;

const Cells = ({
  count = 6,
  span = 4,
}: {
  count?: number;
  span?: number;
}): ReactElement => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <GridItem
        key={i}
        span={span as 1 | 2 | 3 | 4 | 6 | 12}
        className={cellPlaceholder}
      >
        Cell {i + 1}
      </GridItem>
    ))}
  </>
);

export const Default: Story = {
  args: {
    columns: 12,
    spacing: "md",
    children: <Cells count={6} span={4} />,
  },
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-4">
      {(
        ["text", "filled", "tonal", "outlined", "elevated"] as const
      ).map((variant) => (
        <Grid
          key={variant}
          variant={variant}
          shape="md"
          columns={6}
          spacing="md"
          label={`variant=${variant}`}
        >
          <GridItem span={2} className={cellPlaceholder}>
            One
          </GridItem>
          <GridItem span={2} className={cellPlaceholder}>
            Two
          </GridItem>
          <GridItem span={2} className={cellPlaceholder}>
            Three
          </GridItem>
        </Grid>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Grid
          key={size}
          variant="filled"
          shape="md"
          size={size}
          columns={4}
          label={`size=${size}`}
        >
          <Cells count={4} span={1} />
        </Grid>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <Grid
            key={shape}
            variant="filled"
            shape={shape}
            columns={3}
            spacing="md"
            label={`shape=${shape}`}
          >
            <GridItem span={1} className={cellPlaceholder}>
              A
            </GridItem>
            <GridItem span={1} className={cellPlaceholder}>
              B
            </GridItem>
            <GridItem span={1} className={cellPlaceholder}>
              C
            </GridItem>
          </Grid>
        ),
      )}
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[720px] grid-cols-2 gap-4">
      <Grid variant="filled" shape="md" columns={3} label="Resting">
        <Cells count={3} span={1} />
      </Grid>
      <Grid variant="filled" shape="md" columns={3} interactive label="Interactive">
        <Cells count={3} span={1} />
      </Grid>
      <Grid variant="filled" shape="md" columns={3} interactive selected label="Selected">
        <Cells count={3} span={1} />
      </Grid>
      <Grid variant="filled" shape="md" columns={3} disabled label="Disabled">
        <Cells count={3} span={1} />
      </Grid>
      <Grid variant="filled" shape="md" columns={3} error label="Error">
        <Cells count={3} span={1} />
      </Grid>
      <Grid variant="elevated" shape="md" columns={3} elevation={3} label="Elevation 3">
        <Cells count={3} span={1} />
      </Grid>
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-4">
      <Grid
        variant="outlined"
        shape="md"
        columns={4}
        leadingIcon={<StarGlyph />}
        label="Grid with leading icon"
      >
        <Cells count={4} span={1} />
      </Grid>
      <Grid
        variant="outlined"
        shape="md"
        columns={4}
        trailingIcon={<ChevronGlyph />}
        label="Grid with trailing icon"
      >
        <Cells count={4} span={1} />
      </Grid>
      <Grid
        variant="outlined"
        shape="md"
        columns={4}
        leadingIcon={<StarGlyph />}
        trailingIcon={<ChevronGlyph />}
        label="Grid with both icons"
      >
        <Cells count={4} span={1} />
      </Grid>
    </div>
  ),
};

export const Spacing: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl"] as const).map((spacing) => (
        <Grid
          key={spacing}
          variant="outlined"
          shape="md"
          columns={4}
          spacing={spacing}
          label={`spacing=${spacing}`}
        >
          <Cells count={4} span={1} />
        </Grid>
      ))}
      <Grid
        variant="outlined"
        shape="md"
        columns={4}
        rowSpacing="lg"
        columnSpacing="xs"
        label="rowSpacing=lg / columnSpacing=xs"
      >
        <Cells count={8} span={1} />
      </Grid>
    </div>
  ),
};

export const Layout: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-4">
      <Grid
        variant="outlined"
        shape="md"
        columns={12}
        spacing="md"
        label="12-col grid + GridItem spans"
      >
        <GridItem span={6} className={cellPlaceholder}>
          span=6
        </GridItem>
        <GridItem span={3} className={cellPlaceholder}>
          span=3
        </GridItem>
        <GridItem span={3} className={cellPlaceholder}>
          span=3
        </GridItem>
        <GridItem span={4} className={cellPlaceholder}>
          span=4
        </GridItem>
        <GridItem span={4} className={cellPlaceholder}>
          span=4
        </GridItem>
        <GridItem span={4} className={cellPlaceholder}>
          span=4
        </GridItem>
        <GridItem span="full" className={cellPlaceholder}>
          span=full
        </GridItem>
      </Grid>
      <Grid
        variant="outlined"
        shape="md"
        columns={4}
        spacing="md"
        label="explicit column starts"
      >
        <GridItem span={2} start={1} className={cellPlaceholder}>
          start=1 span=2
        </GridItem>
        <GridItem span={2} start={3} className={cellPlaceholder}>
          start=3 span=2
        </GridItem>
        <GridItem span={1} start={2} rowStart={2} className={cellPlaceholder}>
          start=2 rowStart=2
        </GridItem>
      </Grid>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-4">
      <Grid
        variant="filled"
        shape="md"
        columns={3}
        spacing="md"
        interactive
        label="Hover / focus to morph (md → lg)"
      >
        <Cells count={3} span={1} />
      </Grid>
      <Grid
        variant="elevated"
        shape="md"
        columns={3}
        spacing="md"
        interactive
        label="Hover to lift"
      >
        <Cells count={3} span={1} />
      </Grid>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-4">
      <Grid
        as="section"
        variant="outlined"
        shape="md"
        columns={3}
        label="Polymorphic <section>"
      >
        <Cells count={3} span={1} />
      </Grid>
      <Grid
        variant="filled"
        shape="md"
        columns={3}
        interactive
        aria-label="Interactive grid"
      >
        <Cells count={3} span={1} />
      </Grid>
      <Grid variant="outlined" shape="md" columns={3} error>
        <Cells count={3} span={1} />
      </Grid>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "filled",
    size: "md",
    shape: "md",
    columns: 6,
    spacing: "md",
    interactive: true,
    children: <Cells count={6} span={1} />,
  },
};

/**
 * @storybook/test interaction spec. Mounts an interactive Grid, focuses
 * + activates it, asserts the click handler fires twice (mouse + Enter)
 * and that the GridItem placement attributes are exposed.
 */
export const InteractionSpec: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <Grid
      {...args}
      variant="filled"
      shape="md"
      columns={4}
      spacing="md"
      interactive
      label="Interactive Grid"
      aria-label="Interactive Grid"
    >
      <GridItem span={4} className={cellPlaceholder}>
        Press Enter / Space to activate.
      </GridItem>
    </Grid>
  ),
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole("button", { name: "Interactive Grid" });

    await step("Grid mounts as a focusable button", async () => {
      expect(grid).toBeInTheDocument();
      expect(grid.getAttribute("data-component")).toBe("grid");
      expect(grid.getAttribute("data-interactive")).toBe("true");
      expect(grid.getAttribute("data-columns")).toBe("4");
      expect(grid.getAttribute("tabindex")).toBe("0");
    });

    await step("GridItem exposes placement attributes", async () => {
      const item = grid.querySelector(
        "[data-component='grid-item']",
      ) as HTMLElement;
      expect(item).not.toBeNull();
      expect(item.getAttribute("data-span")).toBe("4");
    });

    await step("Click fires the onClick handler", async () => {
      await userEvent.click(grid);
      expect(args.onClick).toHaveBeenCalledTimes(1);
    });

    await step("Enter key activates the grid", async () => {
      grid.focus();
      await userEvent.keyboard("{Enter}");
      expect(args.onClick).toHaveBeenCalledTimes(2);
    });
  },
};
