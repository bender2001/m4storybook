import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { type ReactElement } from "react";
import { ImageList, ImageListItem, ImageListItemBar } from "./ImageList";

/**
 * Inline SVG tile so the gallery renders deterministically offline +
 * for visual regression. We generate a coloured gradient + numeric
 * label keyed off the index so each tile differs in a stable way.
 */
const tileSrc = (index: number, w = 240, h = 240): string => {
  const palette = [
    ["#7C5DFA", "#37C9F4"],
    ["#FA7C5D", "#F4D637"],
    ["#5DFA7C", "#37F4C9"],
    ["#FA5DAB", "#9B37F4"],
    ["#5D8AFA", "#37F47C"],
    ["#FAB85D", "#F44537"],
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

const HeartGlyph = (): ReactElement => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const meta: Meta<typeof ImageList> = {
  title: "Layout/ImageList",
  component: ImageList,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 ImageList. Token-aware 2D image gallery primitive that re-skins MUI's ImageList with the M3 surface / shape / elevation / motion scales. Supports the four MUI arrangements (standard / quilted / woven / masonry), five surface variants on the host, three densities, the full shape token scale, and tiles that can be made interactive (paints the M3 state-layer, morphs the corner shape one notch up on hover/focus/press) and decorated with `<ImageListItemBar>` overlays.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["text", "filled", "tonal", "outlined", "elevated"],
    },
    arrangement: {
      control: "inline-radio",
      options: ["standard", "quilted", "woven", "masonry"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    elevation: { control: { type: "number", min: 0, max: 5, step: 1 } },
    cols: { control: { type: "number", min: 1, max: 6, step: 1 } },
    rowHeight: { control: { type: "number", min: 80, max: 320, step: 10 } },
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
    arrangement: "standard",
    size: "md",
    shape: "md",
    elevation: 0,
    cols: 3,
    rowHeight: 160,
    spacing: "sm",
    selected: false,
    disabled: false,
    error: false,
  },
};

export default meta;
type Story = StoryObj<typeof ImageList>;

const StandardTiles = ({ count = 6 }: { count?: number }): ReactElement => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <ImageListItem key={i} src={tileSrc(i)} alt={`Sample image ${i + 1}`} />
    ))}
  </>
);

export const Default: Story = {
  render: (args) => (
    <div className="w-[640px]">
      <ImageList {...args}>
        <StandardTiles />
      </ImageList>
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
        <ImageList
          key={variant}
          variant={variant}
          shape="md"
          arrangement="standard"
          cols={3}
          rowHeight={120}
          spacing="sm"
          label={`variant=${variant}`}
        >
          <StandardTiles count={3} />
        </ImageList>
      ))}
    </div>
  ),
};

export const Arrangements: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-6">
      <ImageList
        variant="outlined"
        shape="md"
        arrangement="standard"
        cols={3}
        rowHeight={120}
        spacing="sm"
        label="arrangement=standard"
      >
        <StandardTiles count={6} />
      </ImageList>
      <ImageList
        variant="outlined"
        shape="md"
        arrangement="quilted"
        cols={4}
        rowHeight={80}
        spacing="sm"
        label="arrangement=quilted"
      >
        <ImageListItem src={tileSrc(0)} alt="Hero" cols={2} rows={2} />
        <ImageListItem src={tileSrc(1)} alt="A" />
        <ImageListItem src={tileSrc(2)} alt="B" />
        <ImageListItem src={tileSrc(3)} alt="Wide" cols={2} />
        <ImageListItem src={tileSrc(4)} alt="C" />
        <ImageListItem src={tileSrc(5)} alt="D" />
      </ImageList>
      <ImageList
        variant="outlined"
        shape="md"
        arrangement="woven"
        cols={3}
        rowHeight={100}
        spacing="sm"
        label="arrangement=woven"
      >
        <StandardTiles count={6} />
      </ImageList>
      <ImageList
        variant="outlined"
        shape="md"
        arrangement="masonry"
        cols={3}
        spacing="sm"
        label="arrangement=masonry"
      >
        <ImageListItem src={tileSrc(0, 240, 320)} alt="Tall A" />
        <ImageListItem src={tileSrc(1, 240, 180)} alt="Wide A" />
        <ImageListItem src={tileSrc(2, 240, 240)} alt="Square" />
        <ImageListItem src={tileSrc(3, 240, 360)} alt="Tall B" />
        <ImageListItem src={tileSrc(4, 240, 200)} alt="Wide B" />
        <ImageListItem src={tileSrc(5, 240, 280)} alt="Tall C" />
      </ImageList>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <ImageList
          key={size}
          variant="filled"
          shape="md"
          arrangement="standard"
          size={size}
          label={`size=${size}`}
        >
          <StandardTiles count={4} />
        </ImageList>
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
          <ImageList
            key={shape}
            variant="outlined"
            shape={shape}
            arrangement="standard"
            cols={3}
            rowHeight={100}
            spacing="sm"
            label={`shape=${shape}`}
          >
            <StandardTiles count={3} />
          </ImageList>
        ),
      )}
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[720px] grid-cols-2 gap-4">
      <ImageList
        variant="filled"
        shape="md"
        cols={2}
        rowHeight={120}
        label="Resting"
      >
        <ImageListItem src={tileSrc(0)} alt="Resting 1" />
        <ImageListItem src={tileSrc(1)} alt="Resting 2" />
      </ImageList>
      <ImageList
        variant="filled"
        shape="md"
        cols={2}
        rowHeight={120}
        label="Interactive"
      >
        <ImageListItem src={tileSrc(0)} alt="Interactive 1" interactive />
        <ImageListItem src={tileSrc(1)} alt="Interactive 2" interactive />
      </ImageList>
      <ImageList
        variant="filled"
        shape="md"
        cols={2}
        rowHeight={120}
        label="Selected"
      >
        <ImageListItem
          src={tileSrc(0)}
          alt="Selected 1"
          interactive
          selected
        />
        <ImageListItem src={tileSrc(1)} alt="Selected 2" interactive />
      </ImageList>
      <ImageList
        variant="filled"
        shape="md"
        cols={2}
        rowHeight={120}
        label="Disabled"
        disabled
      >
        <ImageListItem src={tileSrc(0)} alt="Disabled 1" />
        <ImageListItem src={tileSrc(1)} alt="Disabled 2" disabled />
      </ImageList>
      <ImageList
        variant="filled"
        shape="md"
        cols={2}
        rowHeight={120}
        label="Error"
        error
      >
        <ImageListItem src={tileSrc(0)} alt="Error 1" />
        <ImageListItem src={tileSrc(1)} alt="Error 2" />
      </ImageList>
      <ImageList
        variant="elevated"
        shape="md"
        cols={2}
        rowHeight={120}
        elevation={3}
        label="Elevation 3"
      >
        <ImageListItem src={tileSrc(0)} alt="Elevation 1" />
        <ImageListItem src={tileSrc(1)} alt="Elevation 2" />
      </ImageList>
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-6">
      <ImageList
        variant="outlined"
        shape="md"
        cols={3}
        rowHeight={140}
        spacing="sm"
        leadingIcon={<StarGlyph />}
        trailingIcon={<InfoGlyph />}
        label="Gallery — leading + trailing icons + label"
      >
        <StandardTiles count={3} />
      </ImageList>
      <ImageList
        variant="outlined"
        shape="md"
        cols={3}
        rowHeight={160}
        spacing="sm"
        label="Tiles with overlay bar (bottom)"
      >
        {[0, 1, 2].map((i) => (
          <ImageListItem
            key={i}
            src={tileSrc(i)}
            alt={`Captioned ${i + 1}`}
            interactive
          >
            <ImageListItemBar
              title={`Photo ${i + 1}`}
              subtitle="Sample subtitle"
              actionIcon={
                <span className="block h-5 w-5 text-on-surface">
                  <HeartGlyph />
                </span>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
      <ImageList
        variant="outlined"
        shape="md"
        cols={3}
        rowHeight={160}
        spacing="sm"
        label="Tiles with overlay bar (top + left action)"
      >
        {[0, 1, 2].map((i) => (
          <ImageListItem key={i} src={tileSrc(i)} alt={`Top ${i + 1}`}>
            <ImageListItemBar
              title={`Top ${i + 1}`}
              position="top"
              actionPosition="left"
              actionIcon={
                <span className="block h-5 w-5 text-on-surface">
                  <StarGlyph />
                </span>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[640px]">
      <ImageList
        variant="filled"
        shape="md"
        cols={3}
        rowHeight={140}
        spacing="sm"
        label="Hover / focus to morph the tile (md → lg)"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ImageListItem
            key={i}
            src={tileSrc(i)}
            alt={`Motion ${i + 1}`}
            interactive
          />
        ))}
      </ImageList>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[720px] flex-col gap-6">
      <ImageList
        as="section"
        variant="outlined"
        shape="md"
        cols={3}
        rowHeight={120}
        spacing="sm"
        label="Polymorphic <section>"
        aria-label="Polymorphic gallery"
      >
        <StandardTiles count={3} />
      </ImageList>
      <ImageList
        variant="filled"
        shape="md"
        cols={3}
        rowHeight={120}
        spacing="sm"
        label="Tiles with descriptive alt text"
      >
        <ImageListItem
          src={tileSrc(0)}
          alt="Sunrise gradient image one"
          interactive
          aria-label="Tile one"
        />
        <ImageListItem
          src={tileSrc(1)}
          alt="Sunset gradient image two"
          interactive
          aria-label="Tile two"
        />
        <ImageListItem
          src={tileSrc(2)}
          alt="Forest gradient image three"
          interactive
          aria-label="Tile three"
        />
      </ImageList>
      <ImageList
        variant="outlined"
        shape="md"
        cols={3}
        rowHeight={120}
        spacing="sm"
        label="Error tile (aria-invalid)"
        error
      >
        <StandardTiles count={3} />
      </ImageList>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "filled",
    arrangement: "standard",
    size: "md",
    shape: "md",
    cols: 3,
    rowHeight: 140,
    spacing: "sm",
  },
  render: (args) => (
    <div className="w-[640px]">
      <ImageList {...args}>
        <StandardTiles count={6} />
      </ImageList>
    </div>
  ),
};

/**
 * @storybook/test interaction spec. Mounts an interactive ImageList,
 * activates a tile via mouse + keyboard, and asserts the documented
 * data-* + ARIA wiring stays in place.
 */
type InteractionArgs = { tileClick: () => void };

export const InteractionSpec: StoryObj<InteractionArgs> = {
  args: { tileClick: fn() },
  render: (args) => (
    <ImageList
      variant="filled"
      shape="md"
      cols={3}
      rowHeight={120}
      spacing="sm"
      aria-label="Interactive gallery"
    >
      <ImageListItem
        src={tileSrc(0)}
        alt="Interactive tile"
        interactive
        aria-label="Interactive tile"
        onClick={args.tileClick}
      />
      <ImageListItem src={tileSrc(1)} alt="Plain tile" />
      <ImageListItem src={tileSrc(2)} alt="Plain tile two" />
    </ImageList>
  ),
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const tile = canvas.getByRole("button", { name: "Interactive tile" });

    await step("Tile mounts as a focusable button", async () => {
      expect(tile).toBeInTheDocument();
      expect(tile.getAttribute("data-component")).toBe("image-list-item");
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

    await step("Gallery exposes the M3 arrangement role description", async () => {
      const gallery = canvasElement.querySelector(
        "[data-component='image-list']",
      );
      expect(gallery?.getAttribute("aria-roledescription")).toBe(
        "image gallery",
      );
      expect(gallery?.getAttribute("data-cols")).toBe("3");
    });
  },
};
