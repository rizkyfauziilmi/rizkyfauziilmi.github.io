import { ThemeProvider } from "./components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import Topbar from "./components/topbar";

function App() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <TooltipProvider>
              <div className="flex flex-col min-h-screen">
                  <Topbar />
                  <div className="bg-primary flex-1">ok</div>
              </div>
            </TooltipProvider>
        </ThemeProvider>
    );
}

export default App;
