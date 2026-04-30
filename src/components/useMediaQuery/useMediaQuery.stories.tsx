import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useEffect, useState } from "react";
import { MediaQuery } from "./useMediaQuery";
import { useMediaQuery } from "./hook";

/** Inline 24dp glyphs — keeps stories network-free + deterministic. */
const ResponsiveGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M21 6h-7v2h7v9H4V8h7V6H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h7v2H8v2h8v-2h-3v-2h7a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zM7 4h2V2H7v2zm4 0h2V2h-2v2zm-4 6h2V8H7v2zm0 4h2v-2H7v2zm4-4h2V8h-2v2zm0 4h2v-2h-2v2z" />
  </svg>
);

const ContrastGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M12 22q-2.075 0-3.9-.788-1.825-.787-3.175-2.137-1.35-1.35-2.137-3.175Q2 14.075 2 12t.788-3.9q.787-1.825 2.137-3.175 1.35-1.35 3.175-2.137Q9.925 2 12 2t3.9.788q1.825.787 3.175 2.137 1.35 1.35 2.137 3.175Q22 9.925 22 12t-.788 3.9q-.787 1.825-2.137 3.175-1.35 1.35-3.175 2.137Q14.075 22 12 22zm0-2V4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20z" />
  </svg>
);

const Surface = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    data-host="use-media-query-surface"
    className={
      "flex w-[640px] flex-col gap-3 rounded-shape-md bg-surface p-6 " +
      (className ?? "")
    }
  >
    {children}
  </div>
);

const meta: Meta<typeof MediaQuery> = {
  title: "Utils/useMediaQuery",
  component: MediaQuery,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3-tokenized re-skin of MUI's `useMediaQuery` (https://mui.com/material-ui/react-use-media-query/). The hook is a drop-in port that subscribes to `window.matchMedia` through `useSyncExternalStore` for concurrent-mode safety. The companion `<MediaQuery>` panel renders a responsive announcement surface (header + status pill + matched/unmatched body) using M3 surface roles, elevation, shape, and motion tokens. Five variants (text / filled / tonal / outlined / elevated), three densities, full M3 shape scale, and an M3 Expressive open/close spring drive the animation between matched and unmatched states.",
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
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    query: { control: "text" },
  },
  args: {
    variant: "elevated",
    size: "md",
    shape: "lg",
    selected: false,
    disabled: false,
    error: false,
    query: "(min-width: 600px)",
    label: "Viewport",
    leadingIcon: <ResponsiveGlyph />,
    matchedLabel: "wide viewport",
    unmatchedLabel: "compact viewport",
    matchedContent: "Two-column layout fits.",
    unmatchedContent: "Single column only.",
  },
};

export default meta;
type Story = StoryObj<typeof MediaQuery>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <MediaQuery
        query="(min-width: 600px)"
        label="Viewport"
        leadingIcon={<ResponsiveGlyph />}
        matchedLabel="wide viewport"
        unmatchedLabel="compact viewport"
        matchedContent="Two-column layout fits."
        unmatchedContent="Single column only."
      />
    </Surface>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <MediaQuery
        variant="text"
        query="(min-width: 320px)"
        label="Text"
        leadingIcon={<ResponsiveGlyph />}
        matchedContent="Transparent host — wraps an external surface."
      />
      <MediaQuery
        variant="filled"
        query="(min-width: 320px)"
        label="Filled"
        leadingIcon={<ResponsiveGlyph />}
        matchedContent="surface-container-highest panel."
      />
      <MediaQuery
        variant="tonal"
        query="(min-width: 320px)"
        label="Tonal"
        leadingIcon={<ResponsiveGlyph />}
        matchedContent="secondary-container panel."
      />
      <MediaQuery
        variant="outlined"
        query="(min-width: 320px)"
        label="Outlined"
        leadingIcon={<ResponsiveGlyph />}
        matchedContent="outline-variant border, transparent fill."
      />
      <MediaQuery
        variant="elevated"
        query="(min-width: 320px)"
        label="Elevated"
        leadingIcon={<ResponsiveGlyph />}
        matchedContent="surface-container-low + elevation-2 (M3 menu surface)."
      />
    </Surface>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <MediaQuery
        size="sm"
        variant="filled"
        query="(min-width: 320px)"
        label="Small"
        leadingIcon={<ResponsiveGlyph />}
        matchedContent="title-s, 12dp pad, 56dp min-height."
      />
      <MediaQuery
        size="md"
        variant="filled"
        query="(min-width: 320px)"
        label="Medium"
        leadingIcon={<ResponsiveGlyph />}
        matchedContent="title-m, 16dp pad, 72dp min-height."
      />
      <MediaQuery
        size="lg"
        variant="filled"
        query="(min-width: 320px)"
        label="Large"
        leadingIcon={<ResponsiveGlyph />}
        matchedContent="title-l, 24dp pad, 96dp min-height."
      />
    </Surface>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <MediaQuery
        variant="filled"
        query="(min-width: 320px)"
        label="Resting"
        leadingIcon={<ResponsiveGlyph />}
        matchedContent="Default state."
      />
      <MediaQuery
        variant="filled"
        selected
        query="(min-width: 320px)"
        label="Selected"
        leadingIcon={<ResponsiveGlyph />}
        matchedContent="secondary-container fill."
      />
      <MediaQuery
        variant="filled"
        disabled
        query="(min-width: 320px)"
        label="Disabled"
        leadingIcon={<ResponsiveGlyph />}
        matchedContent="opacity-0.38."
      />
      <MediaQuery
        variant="filled"
        error
        query="(min-width: 320px)"
        label="Error"
        leadingIcon={<ResponsiveGlyph />}
        matchedContent="error-container fill."
      />
    </Surface>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <MediaQuery
            key={shape}
            shape={shape}
            variant="filled"
            query="(min-width: 320px)"
            label={`Shape ${shape}`}
            leadingIcon={<ResponsiveGlyph />}
            matchedContent={`rounded-shape-${shape}`}
          />
        ),
      )}
    </Surface>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <MediaQuery
        variant="filled"
        query="(min-width: 320px)"
        label="Leading + trailing icons"
        leadingIcon={<ResponsiveGlyph />}
        trailingIcon={<ContrastGlyph />}
        matchedContent="Both icon slots filled."
      />
      <MediaQuery
        variant="filled"
        query="(min-width: 320px)"
        label="Leading only"
        leadingIcon={<ResponsiveGlyph />}
        matchedContent="Leading icon only."
      />
      <MediaQuery
        variant="filled"
        query="(min-width: 320px)"
        label="Trailing only"
        trailingIcon={<ContrastGlyph />}
        matchedContent="Trailing icon only."
      />
      <MediaQuery
        variant="filled"
        query="(min-width: 320px)"
        matchedContent="No header — body only."
      />
    </Surface>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const ToggleHost = () => {
      const [breakpoint, setBreakpoint] = useState(600);
      return (
        <Surface>
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span className="text-label-l font-medium">min-width:</span>
            <button
              type="button"
              data-testid="motion-narrow"
              className="rounded-shape-md bg-primary px-3 py-1 text-on-primary"
              onClick={() => setBreakpoint(320)}
            >
              320px
            </button>
            <button
              type="button"
              data-testid="motion-wide"
              className="rounded-shape-md bg-primary px-3 py-1 text-on-primary"
              onClick={() => setBreakpoint(99999)}
            >
              99999px
            </button>
          </div>
          <MediaQuery
            variant="elevated"
            query={`(min-width: ${breakpoint}px)`}
            label="Motion preview"
            leadingIcon={<ResponsiveGlyph />}
            matchedLabel="matched"
            unmatchedLabel="no match"
            matchedContent="AnimatePresence morphs body slot through springs.gentle."
            unmatchedContent="emphasized easing, medium2 (300ms) container transition."
          />
        </Surface>
      );
    };
    return <ToggleHost />;
  },
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <MediaQuery
        variant="elevated"
        query="(min-width: 320px)"
        label="Accessible panel"
        aria-label="Viewport announcement"
        leadingIcon={<ResponsiveGlyph />}
        matchedContent="role=status, aria-live=polite, focusable, focus-visible ring."
      />
      <MediaQuery
        variant="elevated"
        disabled
        query="(min-width: 320px)"
        label="Disabled"
        leadingIcon={<ResponsiveGlyph />}
        matchedContent="aria-disabled, tabIndex=-1, opacity-0.38."
      />
    </Surface>
  ),
};

export const HookConsumer: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const HookHost = () => {
      const matches = useMediaQuery("(min-width: 320px)");
      return (
        <Surface>
          <div
            data-testid="hook-consumer"
            data-matches={matches ? "true" : "false"}
            className="rounded-shape-md bg-surface-container-highest p-4 text-on-surface"
          >
            <strong>useMediaQuery("(min-width: 320px)") =</strong>{" "}
            <span data-slot="hook-result">{String(matches)}</span>
          </div>
        </Surface>
      );
    };
    return <HookHost />;
  },
};

export const Playground: Story = {
  args: {
    variant: "elevated",
    size: "md",
    shape: "lg",
    selected: false,
    disabled: false,
    error: false,
    query: "(prefers-color-scheme: dark)",
    label: "Color scheme",
    leadingIcon: <ContrastGlyph />,
    matchedLabel: "dark mode",
    unmatchedLabel: "light mode",
    matchedContent: "User prefers dark.",
    unmatchedContent: "User prefers light.",
  },
  render: (args) => (
    <Surface>
      <MediaQuery {...args} />
    </Surface>
  ),
};

/**
 * @storybook/test interaction spec. Verifies that the hook flips its
 * boolean as the query changes and that the panel surfaces both states.
 */
export const InteractionSpec: Story = {
  args: { onMatchChange: fn() },
  render: (args) => {
    const InteractiveHost = () => {
      const [breakpoint, setBreakpoint] = useState(320);
      // Re-render when the toggle flips so the hook subscription
      // re-evaluates immediately for the play function.
      useEffect(() => {}, [breakpoint]);
      return (
        <Surface>
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="ia-narrow"
              className="rounded-shape-md bg-primary px-3 py-1 text-on-primary"
              onClick={() => setBreakpoint(99999)}
            >
              Set 99999px
            </button>
            <button
              type="button"
              data-testid="ia-wide"
              className="rounded-shape-md bg-primary px-3 py-1 text-on-primary"
              onClick={() => setBreakpoint(320)}
            >
              Set 320px
            </button>
          </div>
          <MediaQuery
            {...args}
            query={`(min-width: ${breakpoint}px)`}
            label="Interactive panel"
            leadingIcon={<ResponsiveGlyph />}
            matchedLabel="matched"
            unmatchedLabel="no match"
            matchedContent="Wide viewport active."
            unmatchedContent="Narrow viewport active."
          />
        </Surface>
      );
    };
    return <InteractiveHost />;
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const panel = canvasElement.querySelector(
      "[data-component='use-media-query']",
    ) as HTMLElement | null;
    expect(panel).toBeTruthy();

    await step("starts matched at the lowest breakpoint", async () => {
      expect(panel?.getAttribute("data-matches")).toBe("true");
    });

    await step(
      "switching to an impossible breakpoint flips data-matches to false",
      async () => {
        const narrow = await canvas.findByTestId("ia-narrow");
        await userEvent.click(narrow);
        expect(panel?.getAttribute("data-matches")).toBe("false");
        expect(args.onMatchChange).toHaveBeenCalledWith(false);
      },
    );

    await step("switching back flips data-matches to true", async () => {
      const wide = await canvas.findByTestId("ia-wide");
      await userEvent.click(wide);
      expect(panel?.getAttribute("data-matches")).toBe("true");
      expect(args.onMatchChange).toHaveBeenCalledWith(true);
    });
  },
};
