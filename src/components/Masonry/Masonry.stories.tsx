import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { type ReactElement } from "react";
import { Masonry, MasonryItem } from "./Masonry";

/**
 * Inline SVG tile so the layout renders deterministically offline +
 * for visual regression. We generate a coloured gradient + numeric
 * label keyed off the index so each tile differs in a stable way.
 * Heights vary per index to demonstrate the masonry flow.
 */
const tileSrc = (index: number, w = 240, h = 240): string => {
  const palette = [
    ["#7C5DFA", "#37C9F4"],
    ["#FA7C5D", "#F4D637"],
    ["#5DFA7C", "#37F4C9"],
    ["#FA5DAB", "#9B37F4"],
    ["#5D8AFA", "#37F47C"],
    ["#FAB85D", "#F44537"],
    ["#5DF4D6", "#7C5DFA"],
    ["#F45DAB", "#FAB85D"],
  ];
  const [a, b] = palette[index % palette.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'>
    <defs>
      <linearGradient id='g${index}' x1='0' x2='1' y1='0' y2='1'>
        <stop offset='0' stop-color='${a}'/>
        <stop offset='1' stop-color='${b}'/>
      </linearGradient>
    </defs>
    <rect width='${w}' height='${h}' fill='url(#g${index})'/>
    <text x='50%' y='52%' fill='#FFFFFF' font-family='sans-serif' font-size='${Math.min(w, h) / 4}' font-weight='700' text-anchor='middle'>${index + 1}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/** Heights chosen so the layout shows obvious column re-flow. */
const HEIGHTS = [320, 200, 260, 360, 220, 280, 240, 200];

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

const InfoGlyph = (): ReactElement => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M11 9h2V7h-2v2zm1 13c-5.5 0-10-4.5-10-10S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10zm0-18a8 8 0 100 16 8 8 0 000-16zm-1 13h2v-6h-2v6z" />
  </svg>
);

const meta: Meta<typeof Masonry> = {
  title: "Advanced/Masonry",
  component: Masonry,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Masonry. Token-aware Pinterest-style multi-column layout that re-skins MUI's Masonry with the M3 surface / shape / elevation / motion scales. Items flow at their natural height inside CSS multi-columns and never split across columns. Supports balanced and sequential packing on top of five surface variants on the host, three densities, the full shape token scale, and tiles that can be made interactive (paints the M3 state-layer, morphs the corner shape one notch up on hover/focus/press).",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["text", "filled", "tonal", "outlined", "elevated"],
    },
    packing: {
      control: "inline-radio",
      options: ["balanced", "sequential"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    elevation: { control: { type: "number", min: 0, max: 5, step: 1 } },
    columns: { control: { type: "number", min: 1, max: 6, step: 1 } },
    spacing: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl"],
    },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
  },
  args: {
    variant: "filled",
    packing: "balanced",
    size: "md",
    shape: "md",
    elevation: 0,
    columns: 3,
    spacing: "sm",
    selected: false,
    disabled: false,
    error: false,
  },
};

export default meta;
type Story = StoryObj<typeof Masonry>;

const StandardTiles = ({ count = 6 }: { count?: number }): ReactElement => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <MasonryItem key={i}>
        <img
          src={tileSrc(i, 240, HEIGHTS[i % HEIGHTS.length])}
          alt={`Sample tile ${i + 1}`}
          draggable={false}
          loading="lazy"
        />
      </MasonryItem>
    ))}
  </>
);

export const Default: Story = {
  render: (args) => (
    <div className="w-[640px]">
      <Masonry {...args}>
        <StandardTiles />
      </Masonry>
    </div>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-6">
      {(
        ["text", "filled", "tonal", "outlined", "elevated"] as const
      ).map((variant) => (
        <Masonry
          key={variant}
          variant={variant}
          shape="md"
          packing="balanced"
          columns={3}
          spacing="sm"
          label={`variant=${variant}`}
        >
          <StandardTiles count={3} />
        </Masonry>
      ))}
    </div>
  ),
};

export const Packing: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-6">
      <Masonry
        variant="outlined"
        shape="md"
        packing="balanced"
        columns={3}
        spacing="sm"
        label="packing=balanced"
      >
        <StandardTiles count={6} />
      </Masonry>
      <Masonry
        variant="outlined"
        shape="md"
        packing="sequential"
        columns={3}
        spacing="sm"
        label="packing=sequential"
      >
        <StandardTiles count={6} />
      </Masonry>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Masonry
          key={size}
          variant="filled"
          shape="md"
          size={size}
          columns={3}
          label={`size=${size}`}
        >
          <StandardTiles count={4} />
        </Masonry>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-6">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <Masonry
            key={shape}
            variant="outlined"
            shape={shape}
            columns={3}
            spacing="sm"
            label={`shape=${shape}`}
          >
            <StandardTiles count={3} />
          </Masonry>
        ),
      )}
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[720px] grid-cols-2 gap-4">
      <Masonry variant="filled" shape="md" columns={2} label="Resting">
        <StandardTiles count={2} />
      </Masonry>
      <Masonry
        variant="filled"
        shape="md"
        columns={2}
        label="Interactive"
      >
        <MasonryItem interactive aria-label="Interactive 1">
          <img
            src={tileSrc(0, 240, 220)}
            alt="Interactive 1"
            draggable={false}
          />
        </MasonryItem>
        <MasonryItem interactive aria-label="Interactive 2">
          <img
            src={tileSrc(1, 240, 260)}
            alt="Interactive 2"
            draggable={false}
          />
        </MasonryItem>
      </Masonry>
      <Masonry variant="filled" shape="md" columns={2} label="Selected">
        <MasonryItem interactive selected aria-label="Selected 1">
          <img
            src={tileSrc(0, 240, 200)}
            alt="Selected 1"
            draggable={false}
          />
        </MasonryItem>
        <MasonryItem interactive aria-label="Plain 1">
          <img src={tileSrc(1, 240, 240)} alt="Plain 1" draggable={false} />
        </MasonryItem>
      </Masonry>
      <Masonry
        variant="filled"
        shape="md"
        columns={2}
        label="Disabled"
        disabled
      >
        <StandardTiles count={2} />
      </Masonry>
      <Masonry
        variant="filled"
        shape="md"
        columns={2}
        label="Error"
        error
      >
        <StandardTiles count={2} />
      </Masonry>
      <Masonry
        variant="elevated"
        shape="md"
        columns={2}
        elevation={3}
        label="Elevation 3"
      >
        <StandardTiles count={2} />
      </Masonry>
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-6">
      <Masonry
        variant="outlined"
        shape="md"
        columns={3}
        spacing="sm"
        leadingIcon={<StarGlyph />}
        trailingIcon={<InfoGlyph />}
        label="Masonry — leading + trailing icons + label"
      >
        <StandardTiles count={4} />
      </Masonry>
      <Masonry
        variant="outlined"
        shape="md"
        columns={3}
        spacing="sm"
        label="Tiles with caption content"
      >
        {[0, 1, 2, 3].map((i) => (
          <MasonryItem key={i} interactive aria-label={`Captioned ${i + 1}`}>
            <img
              src={tileSrc(i, 240, HEIGHTS[i])}
              alt={`Captioned ${i + 1}`}
              draggable={false}
            />
            <span
              data-slot="caption"
              className="block px-3 py-2 text-title-s text-on-surface"
            >
              Photo {i + 1}
            </span>
          </MasonryItem>
        ))}
      </Masonry>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[640px]">
      <Masonry
        variant="filled"
        shape="md"
        columns={3}
        spacing="sm"
        label="Hover / focus to morph the tile (md → lg)"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <MasonryItem
            key={i}
            interactive
            aria-label={`Motion tile ${i + 1}`}
          >
            <img
              src={tileSrc(i, 240, HEIGHTS[i])}
              alt={`Motion ${i + 1}`}
              draggable={false}
            />
          </MasonryItem>
        ))}
      </Masonry>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-6">
      <Masonry
        as="section"
        variant="outlined"
        shape="md"
        columns={3}
        spacing="sm"
        label="Polymorphic <section>"
        aria-label="Polymorphic masonry"
      >
        <StandardTiles count={3} />
      </Masonry>
      <Masonry
        variant="filled"
        shape="md"
        columns={3}
        spacing="sm"
        label="Tiles with descriptive aria-labels"
      >
        {[0, 1, 2].map((i) => (
          <MasonryItem key={i} interactive aria-label={`Tile ${i + 1}`}>
            <img
              src={tileSrc(i, 240, HEIGHTS[i])}
              alt={`Tile ${i + 1}`}
              draggable={false}
            />
          </MasonryItem>
        ))}
      </Masonry>
      <Masonry
        variant="outlined"
        shape="md"
        columns={3}
        spacing="sm"
        label="Error masonry (aria-invalid)"
        error
      >
        <StandardTiles count={3} />
      </Masonry>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "filled",
    packing: "balanced",
    size: "md",
    shape: "md",
    columns: 3,
    spacing: "sm",
  },
  render: (args) => (
    <div className="w-[640px]">
      <Masonry {...args}>
        <StandardTiles count={6} />
      </Masonry>
    </div>
  ),
};

/**
 * @storybook/test interaction spec. Mounts an interactive Masonry,
 * activates a tile via mouse + keyboard, and asserts the documented
 * data-* + ARIA wiring stays in place.
 */
type InteractionArgs = { tileClick: () => void };

export const InteractionSpec: StoryObj<InteractionArgs> = {
  args: { tileClick: fn() },
  render: (args) => (
    <Masonry
      variant="filled"
      shape="md"
      columns={3}
      spacing="sm"
      aria-label="Interactive masonry"
    >
      <MasonryItem
        interactive
        aria-label="Interactive tile"
        onClick={args.tileClick}
      >
        <img
          src={tileSrc(0, 240, 220)}
          alt="Interactive tile"
          draggable={false}
        />
      </MasonryItem>
      <MasonryItem aria-label="Plain tile">
        <img src={tileSrc(1, 240, 280)} alt="Plain tile" draggable={false} />
      </MasonryItem>
      <MasonryItem aria-label="Plain tile two">
        <img
          src={tileSrc(2, 240, 200)}
          alt="Plain tile two"
          draggable={false}
        />
      </MasonryItem>
    </Masonry>
  ),
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const tile = canvas.getByRole("button", { name: "Interactive tile" });

    await step("Tile mounts as a focusable button", async () => {
      expect(tile).toBeInTheDocument();
      expect(tile.getAttribute("data-component")).toBe("masonry-item");
      expect(tile.getAttribute("data-interactive")).toBe("true");
      expect(tile.getAttribute("tabindex")).toBe("0");
    });

    await step("Click fires the onClick handler", async () => {
      await userEvent.click(tile);
      expect(args.tileClick).toHaveBeenCalledTimes(1);
    });

    await step("Enter key activates the tile", async () => {
      tile.focus();
      await userEvent.keyboard("{Enter}");
      expect(args.tileClick).toHaveBeenCalledTimes(2);
    });

    await step("Space key activates the tile", async () => {
      tile.focus();
      await userEvent.keyboard(" ");
      expect(args.tileClick).toHaveBeenCalledTimes(3);
    });

    await step(
      "Masonry exposes the M3 packing role description + column count",
      async () => {
        const layout = canvasElement.querySelector("[data-component='masonry']");
        expect(layout?.getAttribute("aria-roledescription")).toBe(
          "masonry layout",
        );
        expect(layout?.getAttribute("data-columns")).toBe("3");
      },
    );
  },
};
