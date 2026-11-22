import Terminal from "./components/terminal";
import { ThemeProvider } from "./components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Terminal />
    </ThemeProvider>
  );
}

export default App;
