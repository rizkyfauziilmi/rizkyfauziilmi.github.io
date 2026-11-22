import { ThemeProvider } from "./components/theme-provider";
import { Terminal } from "./components/terminal";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Terminal />
    </ThemeProvider>
  );
}

export default App;
