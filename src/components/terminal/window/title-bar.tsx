import { AppIcon } from "./app-icon";
import { AppTitle } from "./app-title";
import { TERMINAL_TITLE } from "../constants";
import { WindowDecoration } from "./window-decoration";

export function TitleBar() {
  return (
    <div className="border-b flex shrink-0 items-center justify-between px-4 py-2">
      <AppIcon />
      <AppTitle title={TERMINAL_TITLE} />
      <WindowDecoration />
    </div>
  );
}
