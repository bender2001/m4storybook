import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { Badge } from "@/components/Badge";
import { BottomNavigation } from "./BottomNavigation";
import type { BottomNavigationItem } from "./types";

/** Inline 24dp glyphs — keeps the stories network-free + deterministic. */
const HomeGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);

const HomeFilledGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3z" />
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

const ProfileGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3 0-9 1.5-9 4.5V21h18v-2.5c0-3-6-4.5-9-4.5z" />
  </svg>
);

const baseItems: BottomNavigationItem[] = [
  {
    id: "home",
    label: "Home",
    icon: <HomeGlyph />,
    selectedIcon: <HomeFilledGlyph />,
  },
  { id: "search", label: "Search", icon: <SearchGlyph /> },
  { id: "favorites", label: "Favorites", icon: <FavoriteGlyph /> },
  { id: "profile", label: "Profile", icon: <ProfileGlyph /> },
];

const Surface = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    data-host="bottom-nav-surface"
    className={
      "flex w-[480px] flex-col gap-4 rounded-shape-md bg-surface " +
      (className ?? "")
    }
  >
    {children}
  </div>
);

const meta: Meta<typeof BottomNavigation> = {
  title: "Navigation/BottomNavigation",
  component: BottomNavigation,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Expressive Bottom Navigation (a.k.a. Navigation Bar). Four variants (filled / tonal / outlined / elevated), three density sizes, full shape-token scale, springy active-indicator, and per-destination badge slot. Per https://m3.material.io/components/navigation-bar/specs.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["filled", "tonal", "outlined", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    showLabels: {
      control: "inline-radio",
      options: [true, false, "selected"],
    },
    elevated: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    variant: "filled",
    size: "md",
    shape: "none",
    showLabels: true,
    elevated: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof BottomNavigation>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <BottomNavigation items={baseItems} defaultValue="home" />
    </Surface>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <BottomNavigation
        variant="filled"
        items={baseItems}
        defaultValue="home"
        aria-label="Filled bottom nav"
      />
      <BottomNavigation
        variant="tonal"
        items={baseItems}
        defaultValue="search"
        aria-label="Tonal bottom nav"
      />
      <BottomNavigation
        variant="outlined"
        items={baseItems}
        defaultValue="favorites"
        aria-label="Outlined bottom nav"
      />
      <BottomNavigation
        variant="elevated"
        items={baseItems}
        defaultValue="profile"
        aria-label="Elevated bottom nav"
      />
    </Surface>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <BottomNavigation
        size="sm"
        items={baseItems}
        defaultValue="home"
        aria-label="Small density"
      />
      <BottomNavigation
        size="md"
        items={baseItems}
        defaultValue="home"
        aria-label="Medium density"
      />
      <BottomNavigation
        size="lg"
        items={baseItems}
        defaultValue="home"
        aria-label="Large density"
      />
    </Surface>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <BottomNavigation items={baseItems} defaultValue="home" aria-label="Resting" />
      <BottomNavigation
        items={baseItems.map((item, index) =>
          index === 1 ? { ...item, disabled: true } : item,
        )}
        defaultValue="home"
        aria-label="Disabled item"
      />
      <BottomNavigation
        items={baseItems}
        defaultValue="favorites"
        disabled
        aria-label="Disabled bar"
      />
      <BottomNavigation
        items={baseItems}
        defaultValue="search"
        elevated
        aria-label="Elevated"
      />
    </Surface>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map((shape) => (
        <BottomNavigation
          key={shape}
          shape={shape}
          items={baseItems}
          defaultValue="home"
          aria-label={`Shape ${shape}`}
        />
      ))}
    </Surface>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <BottomNavigation
        items={[
          {
            id: "home",
            label: "Home",
            icon: <HomeGlyph />,
            selectedIcon: <HomeFilledGlyph />,
          },
          {
            id: "search",
            label: "Search",
            icon: <SearchGlyph />,
            badge: <Badge content={2} size="sm" aria-label="2 unread" standalone />,
          },
          {
            id: "favorites",
            label: "Favorites",
            icon: <FavoriteGlyph />,
            badge: <Badge content={9} aria-label="9 favorites" standalone />,
          },
          { id: "profile", label: "Profile", icon: <ProfileGlyph /> },
        ]}
        defaultValue="home"
      />
      <BottomNavigation
        items={baseItems}
        defaultValue="favorites"
        showLabels="selected"
        aria-label="Labels on selected only"
      />
      <BottomNavigation
        items={baseItems}
        defaultValue="profile"
        showLabels={false}
        aria-label="Icons only"
      />
    </Surface>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <BottomNavigation
        items={baseItems}
        defaultValue="home"
        aria-label="Springy active indicator"
      />
    </Surface>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <BottomNavigation
        items={baseItems}
        defaultValue="home"
        aria-label="Primary navigation"
      />
    </Surface>
  ),
};

export const Playground: Story = {
  args: {
    variant: "filled",
    size: "md",
    shape: "none",
    showLabels: true,
    elevated: false,
    disabled: false,
  },
  render: (args) => (
    <Surface>
      <BottomNavigation {...args} items={baseItems} defaultValue="home" />
    </Surface>
  ),
};

/**
 * @storybook/test interaction spec. Verifies role wiring, click +
 * keyboard navigation, and aria-selected toggling.
 */
export const InteractionSpec: Story = {
  args: { onChange: fn() },
  render: (args) => {
    const ControlledShell = () => {
      const [value, setValue] = useState("home");
      return (
        <Surface>
          <BottomNavigation
            {...args}
            items={baseItems}
            value={value}
            onChange={(next, event) => {
              setValue(next);
              args.onChange?.(next, event);
            }}
          />
        </Surface>
      );
    };
    return <ControlledShell />;
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const nav = canvasElement.querySelector(
      "[data-component='bottom-navigation']",
    );

    await step("renders with role=navigation", async () => {
      expect(nav).not.toBeNull();
      expect(nav?.getAttribute("role")).toBe("navigation");
    });

    await step("home is selected by default", async () => {
      const home = canvas.getByRole("tab", { name: "Home" });
      expect(home.getAttribute("aria-selected")).toBe("true");
    });

    await step("clicking another destination updates selection", async () => {
      const search = canvas.getByRole("tab", { name: "Search" });
      await userEvent.click(search);
      expect(search.getAttribute("aria-selected")).toBe("true");
      expect(args.onChange).toHaveBeenCalled();
    });

    await step(
      "ArrowRight from selected destination focuses + selects the next",
      async () => {
        const search = canvas.getByRole("tab", { name: "Search" });
        search.focus();
        await userEvent.keyboard("{ArrowRight}");
        const favorites = canvas.getByRole("tab", { name: "Favorites" });
        expect(favorites.getAttribute("aria-selected")).toBe("true");
      },
    );
  },
};
