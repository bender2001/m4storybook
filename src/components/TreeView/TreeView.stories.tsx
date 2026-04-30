import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { TreeView } from "./TreeView";
import type { TreeNode } from "./types";

/* -------------------------------------------------------------------------- */
/* Inline glyphs                                                              */
/* -------------------------------------------------------------------------- */

const FolderGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8z" />
  </svg>
);

const FileGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
  </svg>
);

const DotGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <circle cx="12" cy="12" r="6" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/* Sample data                                                                */
/* -------------------------------------------------------------------------- */

const fileTree: TreeNode[] = [
  {
    id: "src",
    label: "src",
    icon: <FolderGlyph />,
    children: [
      {
        id: "components",
        label: "components",
        icon: <FolderGlyph />,
        children: [
          {
            id: "Button.tsx",
            label: "Button.tsx",
            icon: <FileGlyph />,
            secondary: "atom · 4.2 kb",
          },
          {
            id: "TreeView.tsx",
            label: "TreeView.tsx",
            icon: <FileGlyph />,
            secondary: "organism · 18.1 kb",
          },
        ],
      },
      {
        id: "tokens",
        label: "tokens",
        icon: <FolderGlyph />,
        children: [
          { id: "color.ts", label: "color.ts", icon: <FileGlyph /> },
          { id: "shape.ts", label: "shape.ts", icon: <FileGlyph /> },
          { id: "motion.ts", label: "motion.ts", icon: <FileGlyph /> },
        ],
      },
      {
        id: "main.tsx",
        label: "main.tsx",
        icon: <FileGlyph />,
        secondary: "entry · 0.4 kb",
      },
    ],
  },
  {
    id: "tests",
    label: "tests",
    icon: <FolderGlyph />,
    children: [
      {
        id: "tree-view.spec.ts",
        label: "tree-view.spec.ts",
        icon: <FileGlyph />,
        secondary: "playwright",
      },
      {
        id: "tree-view.visual.spec.ts",
        label: "tree-view.visual.spec.ts",
        icon: <FileGlyph />,
        secondary: "visual baseline",
      },
    ],
  },
  {
    id: "package.json",
    label: "package.json",
    icon: <FileGlyph />,
    secondary: "manifest",
  },
];

const stateTree: TreeNode[] = [
  {
    id: "default",
    label: "Default item",
    secondary: "no state applied",
  },
  {
    id: "selected",
    label: "Selected item",
    secondary: "secondary-container fill",
  },
  {
    id: "disabled",
    label: "Disabled item",
    secondary: "opacity-0.38, no pointer events",
    disabled: true,
  },
  {
    id: "error",
    label: "Error item",
    secondary: "error foreground role",
    error: true,
  },
  {
    id: "with-children",
    label: "Folder with leaves",
    secondary: "expand-collapse caret",
    children: [
      { id: "child-a", label: "Child A" },
      { id: "child-b", label: "Child B" },
    ],
  },
];

const slotsTree: TreeNode[] = [
  {
    id: "leading-only",
    label: "Leading icon only",
    icon: <FolderGlyph />,
  },
  {
    id: "trailing-only",
    label: "Trailing icon only",
    endIcon: <DotGlyph />,
  },
  {
    id: "both",
    label: "Leading + trailing",
    secondary: "Two icon slots filled",
    icon: <FolderGlyph />,
    endIcon: <DotGlyph />,
  },
  {
    id: "label-only",
    label: "Label only — bare row",
  },
];

/* -------------------------------------------------------------------------- */
/* Stage helper                                                               */
/* -------------------------------------------------------------------------- */

const Stage = ({
  children,
  width = "w-[480px]",
  className,
}: {
  children?: React.ReactNode;
  width?: string;
  className?: string;
}) => (
  <div
    data-host="tree-view-stage"
    className={
      "relative " +
      width +
      " rounded-shape-md bg-surface p-6 " +
      (className ?? "")
    }
  >
    {children}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Meta + stories                                                             */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof TreeView> = {
  title: "Advanced/Tree View",
  component: TreeView,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3-tokenized TreeView. Re-skins MUI X TreeView (https://mui.com/x/react-tree-view/) onto M3 tokens — Material 3 has no formal Tree View spec, so this follows the project's MUI fallback rule. The selection cursor is a 3dp leading bar that springs between focused rows via a shared `layoutId` and morphs from `shape-xs` to the selected `shape` token via motion/react springs. 5 variants (text / filled / tonal / outlined / elevated), 3 densities (32 / 40 / 56 dp rows), 7 shapes, single + multiple selection, hover 0.08 / focus 0.10 / pressed 0.10 state-layers, roving-tabindex keyboard nav (Arrow / Home / End / Enter / Space / `*`). Expand / collapse rides springs.springy on a height + opacity morph; collapses under reduced motion.",
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
    selectionMode: {
      control: "inline-radio",
      options: ["none", "single", "multiple"],
    },
    disabled: { control: "boolean" },
    showCursor: { control: "boolean" },
  },
  args: {
    variant: "text",
    size: "md",
    shape: "md",
    selectionMode: "single",
    disabled: false,
    showCursor: true,
  },
};

export default meta;
type Story = StoryObj<typeof TreeView>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <TreeView
        nodes={fileTree}
        defaultExpanded={["src", "components"]}
        defaultSelected={["TreeView.tsx"]}
        defaultFocusedId="TreeView.tsx"
        ariaLabel="Project file tree"
      />
    </Stage>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["text", "filled", "tonal", "outlined", "elevated"] as const).map(
        (variant) => (
          <Stage key={variant}>
            <span className="mb-3 block text-label-l text-on-surface">
              {variant}
            </span>
            <TreeView
              variant={variant}
              nodes={fileTree.slice(0, 1)}
              defaultExpanded={["src"]}
              defaultSelected={["main.tsx"]}
              defaultFocusedId="main.tsx"
              ariaLabel={`${variant} tree`}
            />
          </Stage>
        ),
      )}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Stage key={size}>
          <span className="mb-3 block text-label-l text-on-surface">
            {size}
          </span>
          <TreeView
            variant="filled"
            size={size}
            nodes={fileTree.slice(0, 1)}
            defaultExpanded={["src", "components"]}
            defaultSelected={["TreeView.tsx"]}
            defaultFocusedId="TreeView.tsx"
            ariaLabel={`${size} tree`}
          />
        </Stage>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <Stage key={shape}>
            <span className="mb-3 block text-label-l text-on-surface">
              shape: {shape}
            </span>
            <TreeView
              variant="filled"
              shape={shape}
              nodes={fileTree.slice(0, 1)}
              defaultExpanded={["src"]}
              defaultSelected={["main.tsx"]}
              defaultFocusedId="main.tsx"
              ariaLabel={`shape-${shape} tree`}
            />
          </Stage>
        ),
      )}
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <TreeView
        variant="filled"
        nodes={stateTree}
        defaultSelected={["selected"]}
        defaultFocusedId="selected"
        defaultExpanded={["with-children"]}
        ariaLabel="State matrix"
      />
    </Stage>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <TreeView
        variant="filled"
        nodes={slotsTree}
        defaultFocusedId="leading-only"
        ariaLabel="Slot matrix"
      />
    </Stage>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const Host = () => {
      const [expanded, setExpanded] = useState<string[]>([]);
      return (
        <Stage>
          <div className="mb-3 flex items-center gap-3 text-on-surface-variant">
            <button
              type="button"
              data-testid="motion-expand"
              className="rounded-shape-md bg-primary px-3 py-1 text-on-primary"
              onClick={() => setExpanded(["src", "components", "tokens"])}
            >
              Expand all
            </button>
            <button
              type="button"
              data-testid="motion-collapse"
              className="rounded-shape-md bg-secondary px-3 py-1 text-on-secondary"
              onClick={() => setExpanded([])}
            >
              Collapse
            </button>
          </div>
          <TreeView
            variant="elevated"
            nodes={fileTree}
            expanded={expanded}
            onExpansionChange={setExpanded}
            defaultFocusedId="src"
            ariaLabel="Motion preview"
          />
        </Stage>
      );
    };
    return <Host />;
  },
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <TreeView
        variant="elevated"
        nodes={fileTree}
        defaultExpanded={["src"]}
        defaultSelected={["main.tsx"]}
        defaultFocusedId="main.tsx"
        ariaLabel="Accessible project tree"
      />
    </Stage>
  ),
};

export const MultipleSelection: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const Host = () => {
      const [picked, setPicked] = useState<string[]>(["TreeView.tsx", "shape.ts"]);
      return (
        <Stage>
          <div
            data-testid="picked-out"
            className="mb-3 rounded-shape-md bg-surface-container-highest p-3 text-on-surface"
          >
            <strong>Selected:</strong> {picked.join(", ") || "(none)"}
          </div>
          <TreeView
            variant="outlined"
            nodes={fileTree}
            selectionMode="multiple"
            selected={picked}
            onSelectionChange={setPicked}
            defaultExpanded={["src", "components", "tokens"]}
            defaultFocusedId="TreeView.tsx"
            ariaLabel="Multi-select tree"
          />
        </Stage>
      );
    };
    return <Host />;
  },
};

export const Playground: Story = {
  args: {
    variant: "filled",
    size: "md",
    shape: "md",
    selectionMode: "single",
    disabled: false,
    showCursor: true,
  },
  render: (args) => (
    <Stage>
      <TreeView
        {...args}
        nodes={fileTree}
        defaultExpanded={["src"]}
        defaultSelected={["main.tsx"]}
        defaultFocusedId="main.tsx"
        ariaLabel="Playground tree"
      />
    </Stage>
  ),
};

/**
 * @storybook/test interaction spec. Verifies row activation toggles
 * selection + expansion, the keyboard nav steps between rows, and
 * arrow keys expand/collapse subtrees.
 */
export const InteractionSpec: Story = {
  args: {
    onSelectionChange: fn(),
    onExpansionChange: fn(),
  },
  render: (args) => (
    <Stage>
      <TreeView
        {...args}
        nodes={fileTree}
        defaultExpanded={["src"]}
        defaultFocusedId="src"
        ariaLabel="Interactive tree"
      />
    </Stage>
  ),
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step("renders root tree with role=tree", async () => {
      const tree = canvasElement.querySelector(
        "[data-component='tree-view-tree']",
      );
      expect(tree).toBeTruthy();
      expect(tree?.getAttribute("role")).toBe("tree");
    });

    await step("activating a leaf flips its selected state", async () => {
      const target = canvas.getByText("main.tsx");
      const row = target.closest(
        "[data-component='tree-view-row']",
      ) as HTMLElement;
      expect(row).toBeTruthy();
      await userEvent.click(row);
      expect(row.getAttribute("aria-selected")).toBe("true");
      expect(args.onSelectionChange).toHaveBeenCalled();
    });

    await step(
      "ArrowRight on a collapsed folder expands it",
      async () => {
        const tests = canvasElement.querySelector(
          "[data-component='tree-view-row'][data-id='tests']",
        ) as HTMLElement | null;
        expect(tests).toBeTruthy();
        tests?.focus();
        await userEvent.keyboard("{ArrowRight}");
        expect(tests?.getAttribute("aria-expanded")).toBe("true");
        expect(args.onExpansionChange).toHaveBeenCalled();
      },
    );

    await step(
      "ArrowLeft on an expanded folder collapses it",
      async () => {
        const tests = canvasElement.querySelector(
          "[data-component='tree-view-row'][data-id='tests']",
        ) as HTMLElement | null;
        tests?.focus();
        await userEvent.keyboard("{ArrowLeft}");
        expect(tests?.getAttribute("aria-expanded")).toBe("false");
      },
    );
  },
};
