import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { Avatar } from "./Avatar";

/**
 * Inline SVG avatar so the story works offline + deterministically
 * for visual regression. Encoded as a data URI to skip a network
 * round-trip in Playwright.
 */
const SAMPLE_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'>
     <defs>
       <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
         <stop offset='0' stop-color='#7C5DFA'/>
         <stop offset='1' stop-color='#37C9F4'/>
       </linearGradient>
     </defs>
     <rect width='80' height='80' fill='url(#g)'/>
     <circle cx='40' cy='32' r='14' fill='#FFFFFF' opacity='0.95'/>
     <path d='M14 76 C18 58 30 50 40 50 C50 50 62 58 66 76 Z' fill='#FFFFFF' opacity='0.95'/>
   </svg>`,
)}`;

const PersonGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="58%"
    height="58%"
    fill="currentColor"
  >
    <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.3 0-8 1.7-8 5v2h16v-2c0-3.3-4.7-5-8-5z" />
  </svg>
);

const meta: Meta<typeof Avatar> = {
  title: "Data Display/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "MUI-fallback Avatar re-skinned with M3 Expressive tokens. Renders an image, initials, or icon and supports four color variants, three shapes (circular/rounded/square), three sizes, an interactive (button) mode with state layer + shape morph on hover, and an optional contact-status dot.",
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
      options: ["circular", "rounded", "square"],
    },
    status: {
      control: "select",
      options: [undefined, "online", "away", "busy", "offline"],
    },
    interactive: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    variant: "filled",
    size: "md",
    shape: "circular",
    alt: "Ada Lovelace",
    children: "AL",
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar variant="filled" alt="Ada Lovelace">
        AL
      </Avatar>
      <Avatar variant="tonal" alt="Grace Hopper">
        GH
      </Avatar>
      <Avatar variant="outlined" alt="Alan Turing">
        AT
      </Avatar>
      <Avatar variant="elevated" alt="Marie Curie">
        MC
      </Avatar>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm" alt="Small">
        S
      </Avatar>
      <Avatar size="md" alt="Medium">
        M
      </Avatar>
      <Avatar size="lg" alt="Large">
        L
      </Avatar>
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar shape="circular" alt="Circular">
        C
      </Avatar>
      <Avatar shape="rounded" alt="Rounded">
        R
      </Avatar>
      <Avatar shape="square" alt="Square">
        S
      </Avatar>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar interactive alt="Interactive rest">
        IR
      </Avatar>
      <Avatar interactive disabled alt="Interactive disabled">
        ID
      </Avatar>
      <Avatar disabled alt="Static disabled">
        SD
      </Avatar>
      <Avatar variant="elevated" alt="Elevated rest">
        ER
      </Avatar>
    </div>
  ),
};

export const WithImage: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar src={SAMPLE_IMAGE} alt="With image" />
      <Avatar
        size="lg"
        src={SAMPLE_IMAGE}
        alt="Large image"
        status="online"
      />
      <Avatar src="https://invalid.example/missing.png" alt="Image fallback">
        FB
      </Avatar>
    </div>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar variant="filled" aria-label="User icon filled">
        <PersonGlyph />
      </Avatar>
      <Avatar variant="tonal" aria-label="User icon tonal">
        <PersonGlyph />
      </Avatar>
      <Avatar variant="outlined" aria-label="User icon outlined">
        <PersonGlyph />
      </Avatar>
    </div>
  ),
};

export const WithStatus: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar status="online" alt="Online">
        ON
      </Avatar>
      <Avatar status="away" alt="Away">
        AW
      </Avatar>
      <Avatar status="busy" alt="Busy">
        BS
      </Avatar>
      <Avatar status="offline" alt="Offline">
        OF
      </Avatar>
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    interactive: true,
    onClick: fn(),
    alt: "Open profile",
    children: "AL",
  },
};

export const Playground: Story = {
  args: {
    alt: "Playground",
    children: "AL",
  },
};

/**
 * Storybook interaction test: focuses the interactive avatar, fires
 * Enter, asserts onClick fired.
 */
export const InteractionSpec: Story = {
  args: {
    interactive: true,
    onClick: fn(),
    alt: "Open profile",
    children: "AL",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole("button", { name: "Open profile" });
    await userEvent.click(avatar);
    await waitFor(() => {
      expect(args.onClick).toHaveBeenCalledTimes(1);
    });
    avatar.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(args.onClick).toHaveBeenCalledTimes(2);
    });
  },
};
