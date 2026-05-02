import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { IconButton } from "./IconButton";

const HeartIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-full w-full"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const StarIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-full w-full"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const SearchIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-full w-full"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-full w-full"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const meta: Meta<typeof IconButton> = {
  title: "Buttons/Icon Button",
  component: IconButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Expressive Icon Button. Four variants (filled, tonal, outlined, standard), three sizes (sm 32dp, md 40dp, lg 56dp), and an optional toggle mode that morphs the corner radius from circular (rest) to a squircle (selected). See https://m3.material.io/components/icon-buttons/specs.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["filled", "tonal", "outlined", "standard"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    onClick: { action: "clicked" },
  },
  args: {
    variant: "standard",
    size: "md",
    disabled: false,
    "aria-label": "Favorite",
    icon: <HeartIcon />,
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: { onClick: fn() },
};

export const Variants: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-row items-center gap-6">
      <IconButton variant="filled" icon={<HeartIcon />} aria-label="Filled" />
      <IconButton variant="tonal" icon={<HeartIcon />} aria-label="Tonal" />
      <IconButton
        variant="outlined"
        icon={<HeartIcon />}
        aria-label="Outlined"
      />
      <IconButton
        variant="standard"
        icon={<HeartIcon />}
        aria-label="Standard"
      />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-row items-center gap-6">
      <IconButton size="sm" icon={<HeartIcon />} aria-label="Small" />
      <IconButton size="md" icon={<HeartIcon />} aria-label="Default" />
      <IconButton size="lg" icon={<HeartIcon />} aria-label="Large" />
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-row items-center gap-6">
      <IconButton icon={<HeartIcon />} aria-label="Resting" />
      <IconButton
        variant="filled"
        icon={<HeartIcon />}
        aria-label="Selected"
        selected
      />
      <IconButton icon={<HeartIcon />} aria-label="Disabled" disabled />
      <IconButton
        variant="filled"
        icon={<HeartIcon />}
        aria-label="Filled disabled"
        disabled
      />
      <IconButton
        variant="outlined"
        icon={<HeartIcon />}
        aria-label="Outlined disabled"
        disabled
      />
    </div>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <div className="flex flex-row items-center gap-6">
        <IconButton icon={<SearchIcon />} aria-label="Search" />
        <IconButton
          variant="filled"
          icon={<SettingsIcon />}
          aria-label="Settings"
        />
        <IconButton
          variant="tonal"
          icon={<StarIcon />}
          aria-label="Favorite"
        />
        <IconButton
          variant="outlined"
          icon={<HeartIcon />}
          aria-label="Like"
        />
      </div>
      <div className="flex flex-row items-center gap-6">
        <IconButton
          size="lg"
          variant="filled"
          icon={<HeartIcon />}
          aria-label="Like (large)"
        />
        <IconButton
          size="lg"
          variant="tonal"
          icon={<StarIcon />}
          aria-label="Favorite (large)"
        />
        <IconButton
          size="lg"
          variant="outlined"
          icon={<SearchIcon />}
          aria-label="Search (large)"
        />
      </div>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    onClick: fn(),
  },
};

/**
 * Stateful toggle wrapper. Used by both the static Toggle story
 * (Playwright drives it directly) and the Interaction story (Storybook
 * play() drives it).
 */
const ToggleHarness = ({
  ariaLabel = "Like",
  variant = "filled" as const,
}: {
  ariaLabel?: string;
  variant?: "filled" | "tonal" | "outlined" | "standard";
}) => {
  const [on, setOn] = useState(false);
  return (
    <IconButton
      variant={variant}
      icon={<HeartIcon />}
      aria-label={ariaLabel}
      selected={on}
      onClick={() => setOn((prev) => !prev)}
    />
  );
};

/**
 * Static toggle harness. No play() function — designed for Playwright
 * to drive the click and assert aria-pressed flips.
 */
export const Toggle: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => <ToggleHarness ariaLabel="Toggle" />,
};

/**
 * Storybook play() interaction test: drives pointer + keyboard
 * activation against the toggle harness, asserting aria-pressed
 * flips on each input.
 */
export const Interaction: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => <ToggleHarness ariaLabel="Like" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Like" });

    expect(button.getAttribute("aria-pressed")).toBe("false");

    await userEvent.click(button);
    await waitFor(() => {
      expect(button.getAttribute("aria-pressed")).toBe("true");
    });

    button.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(button.getAttribute("aria-pressed")).toBe("false");
    });

    await userEvent.keyboard(" ");
    await waitFor(() => {
      expect(button.getAttribute("aria-pressed")).toBe("true");
    });
  },
};
