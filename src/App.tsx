import { ThemeProvider } from "./components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import Topbar from "./components/topbar";

function App() {
    return (
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <TooltipProvider>
                <Topbar />
            </TooltipProvider>
        </ThemeProvider>
    );
}

export default App;
