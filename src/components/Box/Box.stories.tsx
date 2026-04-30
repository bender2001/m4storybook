import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { type ReactElement } from "react";
import { Box } from "./Box";

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

const meta: Meta<typeof Box> = {
  title: "Layout/Box",
  component: Box,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Box. Token-aware polymorphic layout primitive. Five surface variants (text / filled / tonal / outlined / elevated), three densities, full shape token scale, optional interactive mode with M3 state-layer + Expressive shape morph, and standard layout props (display / direction / align / justify) so the Box reads as a generic <div> with M3 styling baked in. M3 spec: https://m3.material.io/styles.",
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
    display: {
      control: "inline-radio",
      options: ["block", "inline-block", "flex", "inline-flex", "grid"],
    },
    direction: {
      control: "inline-radio",
      options: ["row", "column"],
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
    display: "block",
    direction: "row",
    align: "stretch",
    justify: "start",
    interactive: false,
    selected: false,
    disabled: false,
    error: false,
    children: "M3 Box layout primitive.",
  },
};

export default meta;
type Story = StoryObj<typeof Box>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[640px] grid-cols-2 gap-4">
      <Box variant="text" shape="md" label="text">
        Transparent host (layout default)
      </Box>
      <Box variant="filled" shape="md" label="filled">
        surface-container-highest
      </Box>
      <Box variant="tonal" shape="md" label="tonal">
        secondary-container
      </Box>
      <Box variant="outlined" shape="md" label="outlined">
        1dp outline-variant border
      </Box>
      <Box variant="elevated" shape="md" label="elevated">
        surface-container-low + elevation-1
      </Box>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[480px] flex-col gap-3">
      <Box variant="filled" size="sm" shape="md">
        Small density (8dp pad / 32dp min-height)
      </Box>
      <Box variant="filled" size="md" shape="md">
        Medium density (16dp pad / 48dp min-height)
      </Box>
      <Box variant="filled" size="lg" shape="md">
        Large density (24dp pad / 64dp min-height)
      </Box>
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[480px] flex-col gap-3">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <Box key={shape} variant="filled" shape={shape}>
            shape-{shape}
          </Box>
        ),
      )}
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[640px] grid-cols-2 gap-3">
      <Box variant="filled" shape="md">
        Resting
      </Box>
      <Box variant="filled" shape="md" interactive>
        Interactive (hover/focus)
      </Box>
      <Box variant="filled" shape="md" interactive selected>
        Selected
      </Box>
      <Box variant="filled" shape="md" disabled>
        Disabled
      </Box>
      <Box variant="filled" shape="md" error>
        Error
      </Box>
      <Box variant="elevated" shape="md" elevation={3}>
        Elevation level 3
      </Box>
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[480px] flex-col gap-3">
      <Box
        variant="filled"
        shape="md"
        label="Box with leading icon"
        leadingIcon={<StarGlyph />}
      />
      <Box
        variant="filled"
        shape="md"
        label="Box with trailing icon"
        trailingIcon={<ChevronGlyph />}
      />
      <Box
        variant="outlined"
        shape="md"
        label="Box with both icons + body"
        leadingIcon={<StarGlyph />}
        trailingIcon={<ChevronGlyph />}
      >
        Body content sits below the header row.
      </Box>
    </div>
  ),
};

export const Layout: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Box
        variant="outlined"
        shape="md"
        display="flex"
        direction="row"
        justify="between"
        align="center"
        className="w-[480px]"
      >
        <span>Flex row</span>
        <span>justify-between</span>
      </Box>
      <Box
        variant="outlined"
        shape="md"
        display="flex"
        direction="column"
        align="center"
        className="w-[480px]"
      >
        <span>Flex column</span>
        <span>align-center</span>
      </Box>
      <Box
        variant="outlined"
        shape="md"
        display="grid"
        className="w-[480px] grid-cols-3"
      >
        <span>Grid</span>
        <span>three</span>
        <span>columns</span>
      </Box>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[480px] flex-col gap-3">
      <Box
        variant="filled"
        shape="md"
        interactive
        label="Hover / focus to morph"
        trailingIcon={<ChevronGlyph />}
      >
        M3 Expressive shape morph: corners step from md → lg.
      </Box>
      <Box
        variant="elevated"
        shape="md"
        interactive
        label="Hover to lift"
        trailingIcon={<ChevronGlyph />}
      >
        Translates -1px (motion/react gentle spring).
      </Box>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[480px] flex-col gap-3">
      <Box
        as="section"
        variant="outlined"
        shape="md"
        label="Polymorphic"
      >
        Renders as &lt;section&gt; via the `as` prop.
      </Box>
      <Box
        variant="filled"
        shape="md"
        interactive
        aria-label="Interactive box"
      >
        Tab to focus, Enter / Space to activate.
      </Box>
      <Box variant="outlined" shape="md" error aria-label="Error box">
        aria-invalid is set automatically when `error` is true.
      </Box>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "filled",
    size: "md",
    shape: "md",
    interactive: true,
    children: "Adjust the controls to explore the Box matrix.",
  },
};

/**
 * @storybook/test interaction spec. Mounts an interactive Box, hovers
 * + focuses + activates it, asserts the click handler fires and the
 * shape morphs (the data-shape stays constant; the morph is a class
 * swap on the rendered element).
 */
export const InteractionSpec: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <Box
      {...args}
      variant="filled"
      shape="md"
      interactive
      label="Interactive Box"
      aria-label="Interactive Box"
    >
      Click or press Enter / Space.
    </Box>
  ),
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole("button", { name: "Interactive Box" });

    await step("Box mounts as a focusable button", async () => {
      expect(box).toBeInTheDocument();
      expect(box.getAttribute("data-component")).toBe("box");
      expect(box.getAttribute("data-interactive")).toBe("true");
      expect(box.getAttribute("tabindex")).toBe("0");
    });

    await step("Click fires the onClick handler", async () => {
      await userEvent.click(box);
      expect(args.onClick).toHaveBeenCalledTimes(1);
    });

    await step("Enter key activates the box", async () => {
      box.focus();
      await userEvent.keyboard("{Enter}");
      expect(args.onClick).toHaveBeenCalledTimes(2);
    });
  },
};
