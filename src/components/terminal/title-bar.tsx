import { AppIcon } from "./app-icon";
import { AppTitle } from "./app-title";
import { WindowDecoration } from "./window-decoration";

export function TitleBar() {
  return (
    <div className="border-b flex items-center justify-between px-4 py-2">
      <AppIcon />
      <AppTitle title="rizkyfauziilmi@portofolio" />
      <WindowDecoration />
    </div>
  );
}
