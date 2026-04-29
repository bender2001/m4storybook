import type { Decorator, Preview } from "@storybook/react";
import { useEffect } from "react";
import { ThemeProvider } from "../src/theme/ThemeProvider";
import "../src/index.css";

function ThemedStory({
  theme,
  reducedMotion,
  Story,
}: {
  theme: "light" | "dark";
  reducedMotion: boolean;
  Story: React.ComponentType;
}) {
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    if (reducedMotion) root.setAttribute("data-reduced-motion", "true");
    else root.removeAttribute("data-reduced-motion");
  }, [theme, reducedMotion]);

  return (
    <ThemeProvider defaultTheme={theme}>
      <div className="bg-background text-on-background min-h-[200px] p-6">
        <Story />
      </div>
    </ThemeProvider>
  );
}

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === "dark" ? "dark" : "light";
  const reducedMotion = context.globals.reducedMotion === "reduce";
  return (
    <ThemedStory theme={theme} reducedMotion={reducedMotion} Story={Story} />
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          "Foundations",
          "Inputs",
          "Data Display",
          "Feedback",
          "Surfaces",
          "Navigation",
          "Layout",
          "Utils",
          "Advanced",
        ],
      },
    },
  },
  globalTypes: {
    theme: {
      description: "M3 theme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
    reducedMotion: {
      description: "Reduced motion",
      defaultValue: "no-preference",
      toolbar: {
        title: "Motion",
        icon: "play",
        items: [
          { value: "no-preference", title: "Normal", icon: "play" },
          { value: "reduce", title: "Reduced", icon: "stop" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
};

export default preview;
