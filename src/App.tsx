import Terminal from "./components/terminal";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toast";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Terminal />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
