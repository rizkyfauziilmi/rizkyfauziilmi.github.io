import { ThemeProvider } from "./components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import Topbar from "./components/topbar";
import Dock from "./components/dock";
import wallpaper from "@/assets/wallpaper.jpg";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <div
          className="flex flex-col min-h-screen bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${wallpaper})` }}
        >
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
