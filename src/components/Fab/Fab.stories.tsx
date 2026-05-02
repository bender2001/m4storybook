import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { Fab } from "./Fab";

const PlusIcon = () => (
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
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
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
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

const meta: Meta<typeof Fab> = {
  title: "Buttons/Floating Action Button",
  component: Fab,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Expressive Floating Action Button. Three sizes (sm 40dp, md 56dp, lg 96dp) and four color variants (surface, primary, secondary, tertiary). Pass a `label` with size='md' to render the Extended FAB. See https://m3.material.io/components/floating-action-button/specs.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["surface", "primary", "secondary", "tertiary"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    lowered: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    onClick: { action: "clicked" },
  },
  args: {
    variant: "primary",
    size: "md",
    lowered: false,
    disabled: false,
    "aria-label": "Create",
    icon: <PlusIcon />,
  },
};

export default meta;
type Story = StoryObj<typeof Fab>;

export const Default: Story = {
  args: { onClick: fn() },
};

export const Variants: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-row items-center gap-6">
      <Fab variant="surface" icon={<PlusIcon />} aria-label="Surface FAB" />
      <Fab variant="primary" icon={<PlusIcon />} aria-label="Primary FAB" />
      <Fab
        variant="secondary"
        icon={<PlusIcon />}
        aria-label="Secondary FAB"
      />
      <Fab variant="tertiary" icon={<PlusIcon />} aria-label="Tertiary FAB" />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-row items-center gap-6">
      <Fab size="sm" icon={<PlusIcon />} aria-label="Small FAB" />
      <Fab size="md" icon={<PlusIcon />} aria-label="Default FAB" />
      <Fab size="lg" icon={<PlusIcon />} aria-label="Large FAB" />
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-row items-center gap-6">
      <Fab icon={<PlusIcon />} aria-label="Resting" />
      <Fab icon={<PlusIcon />} aria-label="Lowered" lowered />
      <Fab icon={<PlusIcon />} aria-label="Disabled" disabled />
      <Fab
        variant="surface"
        icon={<PlusIcon />}
        aria-label="Surface disabled"
        disabled
      />
    </div>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-row items-center gap-6">
        <Fab icon={<EditIcon />} aria-label="Edit" />
        <Fab variant="secondary" icon={<SearchIcon />} aria-label="Search" />
      </div>
      <Fab
        size="md"
        icon={<PlusIcon />}
        label="Create"
        aria-label="Create"
      />
      <Fab
        variant="tertiary"
        size="md"
        icon={<EditIcon />}
        label="Compose"
        aria-label="Compose"
      />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    onClick: fn(),
  },
};

/**
 * Interaction test: clicks the FAB and asserts the onClick handler
 * fires. Then drives Enter and Space keyboard activations to verify
 * a11y.
 */
export const Interaction: Story = {
  args: {
    onClick: fn(),
    "aria-label": "Create item",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Create item" });

    await userEvent.click(button);
    await waitFor(() => {
      expect(args.onClick).toHaveBeenCalledTimes(1);
    });

    button.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(args.onClick).toHaveBeenCalledTimes(2);
    });

    await userEvent.keyboard(" ");
    await waitFor(() => {
      expect(args.onClick).toHaveBeenCalledTimes(3);
    });
  },
};
