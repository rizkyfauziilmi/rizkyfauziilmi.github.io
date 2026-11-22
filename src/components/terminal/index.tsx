import { TerminalPane } from "./terminal-pane";
import { TitleBar } from "./title-bar";

export default function Terminal() {
  return (
    <div className="min-h-screen">
      <TitleBar />
      <TerminalPane />
    </div>
  );
}
