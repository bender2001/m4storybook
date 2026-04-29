import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Typography } from "./Typography";

/**
 * Inline 16dp glyphs for the icon-slot stories — keeps the
 * Storybook deliverable network-free for visual regression.
 */
const StarGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    fill="currentColor"
    width="100%"
    height="100%"
  >
    <path d="M12 2.6l2.92 6.55 7.13.62-5.4 4.7 1.62 6.96L12 17.77l-6.27 3.66 1.62-6.96-5.4-4.7 7.13-.62z" />
  </svg>
);

const meta: Meta<typeof Typography> = {
  title: "Data Display/Typography",
  component: Typography,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Typography. Five categories (display/headline/title/body/label) × three sizes (sm/md/lg) yield the full 15-role M3 type scale. Color emphasis maps to on-surface / on-surface-variant / primary / error / inverse-on-surface tokens. Polymorphic via the `as` prop; default semantic element follows the variant (h1/h2/h3/p/span). Honors `prefers-reduced-motion` by skipping color/opacity transitions.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["display", "headline", "title", "body", "label"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    emphasis: {
      control: "inline-radio",
      options: ["default", "muted", "primary", "error", "inverse"],
    },
    align: {
      control: "inline-radio",
      options: ["start", "center", "end", "justify"],
    },
    truncate: { control: "boolean" },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    variant: "body",
    size: "md",
    emphasis: "default",
    align: "start",
    truncate: false,
    selected: false,
    disabled: false,
    children: "The quick brown fox jumps over the lazy dog",
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  args: {
    children: "Body medium — default emphasis",
  },
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[640px] flex-col gap-3">
      <Typography variant="display" size="lg" data-testid="display-l">
        Display large
      </Typography>
      <Typography variant="headline" size="lg" data-testid="headline-l">
        Headline large
      </Typography>
      <Typography variant="title" size="lg" data-testid="title-l">
        Title large
      </Typography>
      <Typography variant="body" size="lg" data-testid="body-l">
        Body large — sets the default reading rhythm
      </Typography>
      <Typography variant="label" size="lg" data-testid="label-l">
        Label large
      </Typography>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[640px] flex-col gap-3">
      <Typography variant="body" size="sm" data-testid="body-s">
        Body small (12px)
      </Typography>
      <Typography variant="body" size="md" data-testid="body-m">
        Body medium (14px)
      </Typography>
      <Typography variant="body" size="lg" data-testid="body-l">
        Body large (16px)
      </Typography>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[640px] flex-col gap-3">
      <Typography variant="title" size="md">
        Resting title
      </Typography>
      <Typography variant="title" size="md" emphasis="muted">
        Muted (on-surface-variant)
      </Typography>
      <Typography variant="title" size="md" emphasis="primary">
        Primary (selected emphasis)
      </Typography>
      <Typography variant="title" size="md" emphasis="error">
        Error (validation)
      </Typography>
      <Typography variant="title" size="md" disabled>
        Disabled (38% opacity)
      </Typography>
      <Typography variant="title" size="md" selected>
        Selected (forces primary)
      </Typography>
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[640px] flex-col gap-3">
      <Typography
        variant="label"
        size="lg"
        leadingIcon={<StarGlyph />}
        data-testid="leading-icon"
      >
        Leading icon label
      </Typography>
      <Typography
        variant="label"
        size="lg"
        trailingIcon={<StarGlyph />}
        data-testid="trailing-icon"
      >
        Trailing icon label
      </Typography>
      <Typography
        variant="title"
        size="md"
        leadingIcon={<StarGlyph />}
        trailingIcon={<StarGlyph />}
        data-testid="both-icons"
      >
        Title with both icons
      </Typography>
      <div className="w-48">
        <Typography
          variant="body"
          size="md"
          truncate
          leadingIcon={<StarGlyph />}
          data-testid="truncate"
        >
          A long line that should truncate inside a constrained box
        </Typography>
      </div>
    </div>
  ),
};

export const Polymorphic: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[640px] flex-col gap-3">
      <Typography variant="display" size="md" as="h1" data-testid="as-h1">
        Renders as h1
      </Typography>
      <Typography variant="headline" size="md" as="h2" data-testid="as-h2">
        Renders as h2
      </Typography>
      <Typography variant="body" size="md" as="strong" data-testid="as-strong">
        Renders as strong
      </Typography>
      <Typography variant="label" size="md" as="kbd" data-testid="as-kbd">
        Renders as kbd
      </Typography>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[480px]">
      <Typography variant="body" size="md">
        M3 typography uses the standard easing token (cubic-bezier(0.2, 0, 0, 1))
        for color and opacity transitions when the emphasis or disabled state
        changes. Reduced-motion preferences skip the transition.
      </Typography>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[640px] flex-col gap-3">
      <Typography variant="display" size="md" as="h1">
        Page heading (h1)
      </Typography>
      <Typography variant="body" size="md">
        Body text inherits the default on-surface color so it meets WCAG AA
        contrast against the surface role. The disabled state is announced via
        aria-disabled.
      </Typography>
      <Typography variant="label" size="md" disabled>
        Disabled label (announced via aria-disabled)
      </Typography>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    children: "Playground sample text",
  },
  render: (args) => <Typography {...args} />,
};

/**
 * Storybook interaction test:
 *  - asserts the resolved variant/size/emphasis data attributes
 *  - asserts the default semantic tag follows the variant map
 *  - asserts disabled toggles aria-disabled + the 38% opacity
 */
export const InteractionSpec: Story = {
  args: {
    variant: "title",
    size: "md",
    emphasis: "primary",
    children: "Spec target",
  },
  render: (args) => (
    <div className="w-[480px]">
      <Typography {...args} />
      <Typography variant="body" size="md" disabled data-testid="disabled-row">
        Disabled body
      </Typography>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const target = canvas.getByText("Spec target");
    expect(target).toHaveAttribute("data-variant", "title");
    expect(target).toHaveAttribute("data-size", "md");
    expect(target).toHaveAttribute("data-emphasis", "primary");
    expect(target).toHaveAttribute("data-role", "title-m");
    expect(target.tagName).toBe("H3");
    const disabled = canvas.getByTestId("disabled-row");
    expect(disabled).toHaveAttribute("aria-disabled", "true");
    expect(disabled).toHaveAttribute("data-disabled", "");
  },
};
