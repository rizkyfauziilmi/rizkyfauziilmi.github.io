import { TopbarClock } from "./topbar-clock";
import { TopbarAppIndicator } from "./topbar-app-indicator";
import { TopbarQuickSettings } from "./topbar-quick-settings";

export default function Topbar() {
  return (
    <div className="grid grid-cols-3 items-center px-3 py-1 border-b">
      <div className="justify-self-start">
        <TopbarAppIndicator />
      </div>
      <div className="justify-self-center">
        <TopbarClock />
      </div>
      <div className="justify-self-end">
        <TopbarQuickSettings />
      </div>
    </div>
  );
}
