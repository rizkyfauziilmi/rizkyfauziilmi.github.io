import { ThemeProvider } from "./components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import Topbar from "./components/topbar";
import Dock from "./components/dock";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Topbar />
          <div className="flex-1 relative">
            <p>test</p>
            <Dock />
          </div>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
