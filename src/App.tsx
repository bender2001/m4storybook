export function App() {
  return (
    <main className="min-h-screen bg-surface text-on-surface flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-4">
        <h1 className="text-display-m">M3 Expressive Storybook</h1>
        <p className="text-body-l text-on-surface-variant">
          A Material Design 3 Expressive component library. Run{" "}
          <code className="font-mono">pnpm storybook</code> to explore the components.
        </p>
      </div>
    </main>
  );
}
