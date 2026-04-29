import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { IconButton } from "@/components/IconButton";
import { AppBar } from "./AppBar";

/** Inline 24dp glyphs — keeps the stories network-free + deterministic. */
const MenuGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
  </svg>
);

const BackGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z" />
  </svg>
);

const SearchGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79L19 20.49 20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z" />
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
    <path d="M12 8a2 2 0 1 0-2-2 2 2 0 0 0 2 2zm0 2a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm0 6a2 2 0 1 0 2 2 2 2 0 0 0-2-2z" />
  </svg>
);

const FavoriteGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z" />
  </svg>
);

const meta: Meta<typeof AppBar> = {
  title: "Surfaces/AppBar",
  component: AppBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "M3 Expressive App Bar. Five variants (small / center-aligned / medium / large / bottom), three density sizes, full shape-token scale, scrolled + elevated states, and a leading / title / trailing slot matrix. Per https://m3.material.io/components/top-app-bar and https://m3.material.io/components/bottom-app-bar.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["small", "center-aligned", "medium", "large", "bottom"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    scrolled: { control: "boolean" },
    elevated: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    variant: "small",
    size: "md",
    shape: "none",
    scrolled: false,
    elevated: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof AppBar>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <AppBar
      title="Page title"
      leading={
        <IconButton
          aria-label="Open navigation"
          icon={<MenuGlyph />}
        />
      }
      trailing={
        <>
          <IconButton aria-label="Search" icon={<SearchGlyph />} />
          <IconButton aria-label="More options" icon={<MoreGlyph />} />
        </>
      }
    />
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <AppBar
        variant="small"
        title="Small"
        leading={<IconButton aria-label="Back" icon={<BackGlyph />} />}
        trailing={<IconButton aria-label="Search" icon={<SearchGlyph />} />}
      />
      <AppBar
        variant="center-aligned"
        title="Center aligned"
        leading={<IconButton aria-label="Back" icon={<BackGlyph />} />}
        trailing={<IconButton aria-label="More" icon={<MoreGlyph />} />}
      />
      <AppBar
        variant="medium"
        title="Medium headline"
        leading={<IconButton aria-label="Back" icon={<BackGlyph />} />}
        trailing={<IconButton aria-label="Search" icon={<SearchGlyph />} />}
      />
      <AppBar
        variant="large"
        title="Large headline"
        leading={<IconButton aria-label="Back" icon={<BackGlyph />} />}
        trailing={<IconButton aria-label="Search" icon={<SearchGlyph />} />}
      />
      <AppBar
        variant="bottom"
        leading={
          <>
            <IconButton aria-label="Search" icon={<SearchGlyph />} />
            <IconButton aria-label="Favorite" icon={<FavoriteGlyph />} />
            <IconButton aria-label="More" icon={<MoreGlyph />} />
          </>
        }
        trailing={
          <IconButton
            aria-label="Compose"
            variant="filled"
            icon={<FavoriteGlyph />}
          />
        }
      />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <AppBar
        size="sm"
        title="Small density (56dp)"
        leading={<IconButton aria-label="Menu" icon={<MenuGlyph />} />}
        trailing={<IconButton aria-label="Search" icon={<SearchGlyph />} />}
      />
      <AppBar
        size="md"
        title="Medium density (64dp)"
        leading={<IconButton aria-label="Menu" icon={<MenuGlyph />} />}
        trailing={<IconButton aria-label="Search" icon={<SearchGlyph />} />}
      />
      <AppBar
        size="lg"
        title="Large density (72dp)"
        leading={<IconButton aria-label="Menu" icon={<MenuGlyph />} />}
        trailing={<IconButton aria-label="Search" icon={<SearchGlyph />} />}
      />
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <AppBar
        title="Resting"
        leading={<IconButton aria-label="Menu" icon={<MenuGlyph />} />}
        trailing={<IconButton aria-label="Search" icon={<SearchGlyph />} />}
      />
      <AppBar
        title="Scrolled (surface-container)"
        scrolled
        leading={<IconButton aria-label="Menu" icon={<MenuGlyph />} />}
        trailing={<IconButton aria-label="Search" icon={<SearchGlyph />} />}
      />
      <AppBar
        title="Elevated (elevation-2)"
        elevated
        leading={<IconButton aria-label="Menu" icon={<MenuGlyph />} />}
        trailing={<IconButton aria-label="Search" icon={<SearchGlyph />} />}
      />
      <AppBar
        title="Disabled"
        disabled
        leading={<IconButton aria-label="Menu" icon={<MenuGlyph />} disabled />}
        trailing={
          <IconButton aria-label="Search" icon={<SearchGlyph />} disabled />
        }
      />
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 px-6">
      {(["none", "xs", "sm", "md", "lg", "xl"] as const).map((shape) => (
        <AppBar
          key={shape}
          variant="small"
          shape={shape}
          elevated
          title={`shape-${shape}`}
          leading={<IconButton aria-label="Menu" icon={<MenuGlyph />} />}
          trailing={<IconButton aria-label="Search" icon={<SearchGlyph />} />}
        />
      ))}
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <AppBar
        title="Leading + trailing"
        leading={<IconButton aria-label="Back" icon={<BackGlyph />} />}
        trailing={
          <>
            <IconButton aria-label="Search" icon={<SearchGlyph />} />
            <IconButton aria-label="Favorite" icon={<FavoriteGlyph />} />
            <IconButton aria-label="More" icon={<MoreGlyph />} />
          </>
        }
      />
      <AppBar
        variant="center-aligned"
        title="Center title only"
        leading={<IconButton aria-label="Back" icon={<BackGlyph />} />}
      />
      <AppBar variant="small" title="Title only" />
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <AppBar
      variant="medium"
      title="Motion: emphasized easing on scroll fill"
      leading={<IconButton aria-label="Menu" icon={<MenuGlyph />} />}
      trailing={<IconButton aria-label="Search" icon={<SearchGlyph />} />}
    />
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <AppBar
        title="Banner role + aria-label"
        aria-label="Primary navigation"
        leading={<IconButton aria-label="Open menu" icon={<MenuGlyph />} />}
        trailing={<IconButton aria-label="Search" icon={<SearchGlyph />} />}
      />
      <AppBar
        variant="bottom"
        aria-label="Footer actions"
        leading={<IconButton aria-label="Favorite" icon={<FavoriteGlyph />} />}
      />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "small",
    size: "md",
    shape: "none",
    scrolled: false,
    elevated: false,
    disabled: false,
  },
  render: (args) => (
    <AppBar
      {...args}
      title="Playground title"
      leading={<IconButton aria-label="Menu" icon={<MenuGlyph />} />}
      trailing={<IconButton aria-label="Search" icon={<SearchGlyph />} />}
    />
  ),
};

/**
 * Storybook interaction test. Mounts an app bar, asserts the leading
 * icon button is reachable + has the right aria-label, and verifies
 * the click handler fires.
 */
export const InteractionSpec: Story = {
  args: {
    onClick: fn(),
  },
  render: (args) => {
    const InteractionShell = () => {
      const [scrolled, setScrolled] = useState(false);
      return (
        <AppBar
          {...args}
          title="Interactive"
          scrolled={scrolled}
          leading={
            <IconButton
              aria-label="Open navigation"
              icon={<MenuGlyph />}
              onClick={() => setScrolled((s) => !s)}
            />
          }
          trailing={<IconButton aria-label="Search" icon={<SearchGlyph />} />}
        />
      );
    };
    return <InteractionShell />;
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("button", { name: "Open navigation" });
    const bar = canvasElement.querySelector("[data-component='app-bar']");

    await step("App bar mounts with the banner role", async () => {
      expect(bar).not.toBeNull();
      expect(bar?.getAttribute("role")).toBe("banner");
    });

    await step("Leading nav button is reachable + clickable", async () => {
      await userEvent.click(nav);
      expect(bar?.getAttribute("data-scrolled")).toBe("true");
    });

    await step("Clicking again toggles scrolled off", async () => {
      await userEvent.click(nav);
      expect(bar?.getAttribute("data-scrolled")).toBeNull();
    });
  },
};
