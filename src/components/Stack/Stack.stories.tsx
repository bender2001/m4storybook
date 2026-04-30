import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { type ReactElement } from "react";
import { Stack } from "./Stack";

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

const itemPlaceholder =
  "min-h-[40px] rounded-shape-sm bg-primary-container text-on-primary-container flex items-center justify-center px-3 text-label-l";

const Items = ({ count = 3 }: { count?: number }): ReactElement => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={itemPlaceholder}>
        Item {i + 1}
      </div>
    ))}
  </>
);

const meta: Meta<typeof Stack> = {
  title: "Layout/Stack",
  component: Stack,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Stack. Token-aware single-axis flex layout primitive that re-skins MUI's Stack with the M3 surface / shape / elevation / motion scales. Supports five surface variants (text / filled / tonal / outlined / elevated), three densities, the full shape token scale, the M3 spacing rhythm, an optional interactive mode with state-layer + Expressive shape morph, and an optional `divider` slot rendered between children.",
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
    direction: {
      control: "inline-radio",
      options: ["column", "row", "column-reverse", "row-reverse"],
    },
    spacing: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl"],
    },
    align: {
      control: "inline-radio",
      options: ["start", "center", "end", "stretch", "baseline"],
    },
    justify: {
      control: "inline-radio",
      options: ["start", "center", "end", "between", "around", "evenly"],
    },
    wrap: {
      control: "inline-radio",
      options: ["nowrap", "wrap", "wrap-reverse"],
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
    direction: "column",
    spacing: "md",
    align: "stretch",
    justify: "start",
    wrap: "nowrap",
    interactive: false,
    selected: false,
    disabled: false,
    error: false,
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

export const Default: Story = {
  args: {
    children: <Items count={3} />,
  },
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[640px] flex-col gap-4">
      {(
        ["text", "filled", "tonal", "outlined", "elevated"] as const
      ).map((variant) => (
        <Stack
          key={variant}
          variant={variant}
          shape="md"
          spacing="md"
          label={`variant=${variant}`}
        >
          <div className={itemPlaceholder}>One</div>
          <div className={itemPlaceholder}>Two</div>
          <div className={itemPlaceholder}>Three</div>
        </Stack>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[640px] flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Stack
          key={size}
          variant="filled"
          shape="md"
          size={size}
          label={`size=${size}`}
        >
          <Items count={3} />
        </Stack>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[640px] flex-col gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <Stack
            key={shape}
            variant="filled"
            shape={shape}
            spacing="md"
            label={`shape=${shape}`}
          >
            <Items count={2} />
          </Stack>
        ),
      )}
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[720px] grid-cols-2 gap-4">
      <Stack variant="filled" shape="md" label="Resting">
        <Items count={2} />
      </Stack>
      <Stack variant="filled" shape="md" interactive label="Interactive">
        <Items count={2} />
      </Stack>
      <Stack
        variant="filled"
        shape="md"
        interactive
        selected
        label="Selected"
      >
        <Items count={2} />
      </Stack>
      <Stack variant="filled" shape="md" disabled label="Disabled">
        <Items count={2} />
      </Stack>
      <Stack variant="filled" shape="md" error label="Error">
        <Items count={2} />
      </Stack>
      <Stack
        variant="elevated"
        shape="md"
        elevation={3}
        label="Elevation 3"
      >
        <Items count={2} />
      </Stack>
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[640px] flex-col gap-4">
      <Stack
        variant="outlined"
        shape="md"
        leadingIcon={<StarGlyph />}
        label="Stack with leading icon"
      >
        <Items count={3} />
      </Stack>
      <Stack
        variant="outlined"
        shape="md"
        trailingIcon={<ChevronGlyph />}
        label="Stack with trailing icon"
      >
        <Items count={3} />
      </Stack>
      <Stack
        variant="outlined"
        shape="md"
        leadingIcon={<StarGlyph />}
        trailingIcon={<ChevronGlyph />}
        label="Stack with both icons"
      >
        <Items count={3} />
      </Stack>
    </div>
  ),
};

export const Spacing: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[640px] flex-col gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl"] as const).map((spacing) => (
        <Stack
          key={spacing}
          variant="outlined"
          shape="md"
          spacing={spacing}
          label={`spacing=${spacing}`}
        >
          <Items count={3} />
        </Stack>
      ))}
    </div>
  ),
};

export const Direction: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-4">
      {(
        ["column", "row", "column-reverse", "row-reverse"] as const
      ).map((direction) => (
        <Stack
          key={direction}
          variant="outlined"
          shape="md"
          direction={direction}
          spacing="md"
          label={`direction=${direction}`}
        >
          <Items count={3} />
        </Stack>
      ))}
    </div>
  ),
};

export const Divider: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[640px] flex-col gap-4">
      <Stack
        variant="outlined"
        shape="md"
        spacing="md"
        divider={<hr className="w-full border-outline-variant" />}
        label="Vertical stack with hr divider"
      >
        <div className={itemPlaceholder}>Item 1</div>
        <div className={itemPlaceholder}>Item 2</div>
        <div className={itemPlaceholder}>Item 3</div>
      </Stack>
      <Stack
        variant="outlined"
        shape="md"
        direction="row"
        spacing="md"
        divider={<span className="block h-full w-px bg-outline-variant" />}
        label="Horizontal stack with vertical divider"
      >
        <div className={itemPlaceholder}>One</div>
        <div className={itemPlaceholder}>Two</div>
        <div className={itemPlaceholder}>Three</div>
      </Stack>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[640px] flex-col gap-4">
      <Stack
        variant="filled"
        shape="md"
        spacing="md"
        interactive
        label="Hover / focus to morph (md → lg)"
      >
        <Items count={2} />
      </Stack>
      <Stack
        variant="elevated"
        shape="md"
        spacing="md"
        interactive
        label="Hover to lift"
      >
        <Items count={2} />
      </Stack>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[640px] flex-col gap-4">
      <Stack
        as="section"
        variant="outlined"
        shape="md"
        label="Polymorphic <section>"
      >
        <Items count={2} />
      </Stack>
      <Stack
        variant="filled"
        shape="md"
        interactive
        aria-label="Interactive stack"
      >
        <Items count={2} />
      </Stack>
      <Stack variant="outlined" shape="md" error>
        <Items count={2} />
      </Stack>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "filled",
    size: "md",
    shape: "md",
    direction: "column",
    spacing: "md",
    interactive: true,
    children: <Items count={3} />,
  },
};

/**
 * @storybook/test interaction spec. Mounts an interactive Stack,
 * activates it via mouse + keyboard, and asserts the documented
 * data-* + ARIA wiring stays in place.
 */
export const InteractionSpec: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <Stack
      {...args}
      variant="filled"
      shape="md"
      spacing="md"
      interactive
      label="Interactive Stack"
      aria-label="Interactive Stack"
    >
      <div className={itemPlaceholder}>Press Enter / Space to activate.</div>
    </Stack>
  ),
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const stack = canvas.getByRole("button", { name: "Interactive Stack" });

    await step("Stack mounts as a focusable button", async () => {
      expect(stack).toBeInTheDocument();
      expect(stack.getAttribute("data-component")).toBe("stack");
      expect(stack.getAttribute("data-interactive")).toBe("true");
      expect(stack.getAttribute("data-direction")).toBe("column");
      expect(stack.getAttribute("data-spacing")).toBe("md");
      expect(stack.getAttribute("tabindex")).toBe("0");
    });

    await step("Click fires the onClick handler", async () => {
      await userEvent.click(stack);
      expect(args.onClick).toHaveBeenCalledTimes(1);
    });

    await step("Enter key activates the stack", async () => {
      stack.focus();
      await userEvent.keyboard("{Enter}");
      expect(args.onClick).toHaveBeenCalledTimes(2);
    });

    await step("Space key activates the stack", async () => {
      stack.focus();
      await userEvent.keyboard(" ");
      expect(args.onClick).toHaveBeenCalledTimes(3);
    });
  },
};
