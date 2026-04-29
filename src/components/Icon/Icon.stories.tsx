import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { Icon } from "./Icon";

/** Stable inline SVG glyphs used across the stories + tests. */
const FavoriteGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const HomeGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
  </svg>
);

const SearchGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
    <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zM10 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
  </svg>
);

const meta: Meta<typeof Icon> = {
  title: "Data Display/Icon",
  component: Icon,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Icon. Bare-glyph wrapper used in slots that take a 24dp visual (lists, buttons, chips, app bars, tabs). Six color variants (standard / primary / filled / tonal / outlined / error), three sizes (sm 18dp / md 24dp / lg 40dp), and four states (default / selected / disabled / error). Promotes to a focusable button when `interactive`. Reference: https://m3.material.io/styles/icons/overview.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["standard", "primary", "filled", "tonal", "outlined", "error"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    state: {
      control: "inline-radio",
      options: ["default", "selected", "disabled", "error"],
    },
    interactive: { control: "boolean" },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
  args: {
    variant: "standard",
    size: "md",
    label: "Favorite",
    children: <FavoriteGlyph />,
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  args: { label: "Favorite" },
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Icon variant="standard" label="Standard" data-testid="variant-standard">
        <FavoriteGlyph />
      </Icon>
      <Icon variant="primary" label="Primary" data-testid="variant-primary">
        <FavoriteGlyph />
      </Icon>
      <Icon variant="filled" label="Filled" data-testid="variant-filled">
        <FavoriteGlyph />
      </Icon>
      <Icon variant="tonal" label="Tonal" data-testid="variant-tonal">
        <FavoriteGlyph />
      </Icon>
      <Icon variant="outlined" label="Outlined" data-testid="variant-outlined">
        <FavoriteGlyph />
      </Icon>
      <Icon variant="error" label="Error" data-testid="variant-error">
        <FavoriteGlyph />
      </Icon>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-6">
      <Icon size="sm" label="Small" data-testid="size-sm">
        <FavoriteGlyph />
      </Icon>
      <Icon size="md" label="Medium" data-testid="size-md">
        <FavoriteGlyph />
      </Icon>
      <Icon size="lg" variant="filled" label="Large" data-testid="size-lg">
        <FavoriteGlyph />
      </Icon>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-6">
      <Icon label="Default" data-testid="state-default">
        <FavoriteGlyph />
      </Icon>
      <Icon
        variant="tonal"
        selected
        interactive
        label="Selected"
        data-testid="state-selected"
      >
        <FavoriteGlyph />
      </Icon>
      <Icon disabled label="Disabled" data-testid="state-disabled">
        <FavoriteGlyph />
      </Icon>
      <Icon state="error" label="Error" data-testid="state-error">
        <FavoriteGlyph />
      </Icon>
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Icon
        variant="primary"
        label="Search shortcut"
        leadingLabel="Search"
        data-testid="slot-leading"
      >
        <SearchGlyph />
      </Icon>
      <Icon
        variant="primary"
        label="Home shortcut"
        trailingLabel="Home"
        data-testid="slot-trailing"
      >
        <HomeGlyph />
      </Icon>
      <Icon
        variant="primary"
        label="Favorite shortcut"
        leadingLabel="Save"
        trailingLabel="3"
        data-testid="slot-both"
      >
        <FavoriteGlyph />
      </Icon>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-6">
      <Icon
        interactive
        variant="filled"
        label="Press to feel the spring"
        data-testid="motion-press"
      >
        <FavoriteGlyph />
      </Icon>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Icon
        decorative
        data-testid="a11y-decorative"
      >
        <FavoriteGlyph />
      </Icon>
      <Icon
        interactive
        label="Toggle favorite"
        data-testid="a11y-interactive"
      >
        <FavoriteGlyph />
      </Icon>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    label: "Favorite",
    interactive: false,
  },
  render: (args) => (
    <Icon {...args}>
      <FavoriteGlyph />
    </Icon>
  ),
};

/**
 * Storybook interaction test. Drives an interactive Icon:
 *  - role=img + aria-label projected from `label`
 *  - tabIndex=0 + keyboard activation (Enter + Space)
 *  - aria-pressed reflects `selected` while interactive
 */
export const InteractionSpec: Story = {
  args: {
    label: "Favorite",
    interactive: true,
    selected: false,
    onActivate: fn(),
  },
  render: (args) => (
    <Icon {...args} data-testid="interactive-icon">
      <FavoriteGlyph />
    </Icon>
  ),
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByTestId("interactive-icon");

    await step("renders as a labelled focusable img", async () => {
      expect(icon).toHaveAttribute("role", "img");
      expect(icon).toHaveAttribute("aria-label", "Favorite");
      expect(icon).toHaveAttribute("data-variant", "standard");
      expect(icon).toHaveAttribute("data-size", "md");
      expect(icon).toHaveAttribute("data-interactive", "");
      expect(icon).toHaveAttribute("tabindex", "0");
    });

    await step("Enter activates onActivate", async () => {
      icon.focus();
      await userEvent.keyboard("{Enter}");
      expect(args.onActivate).toHaveBeenCalledTimes(1);
    });

    await step("Space activates onActivate", async () => {
      await userEvent.keyboard(" ");
      expect(args.onActivate).toHaveBeenCalledTimes(2);
    });

    await step("Click activates onActivate", async () => {
      await userEvent.click(icon);
      expect(args.onActivate).toHaveBeenCalledTimes(3);
    });
  },
};
