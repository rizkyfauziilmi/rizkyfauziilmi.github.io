import { TopbarClock } from "./topbar-clock";
import { TopbarAppIndicator } from "./topbar-app-indicator";
import { TopbarQuickSettings } from "./topbar-quick-settings";

export default function Topbar() {
    return (
        <div className="py-1 px-3 flex items-center justify-between bg-primary text-background">
            <TopbarAppIndicator />
            <TopbarClock />
            <TopbarQuickSettings />
        </div>
    );
}
