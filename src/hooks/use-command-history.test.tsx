import { act, render } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { describe, expect, it } from "vitest";

import { useCommandHistory } from "./use-command-history";

let api!: ReturnType<typeof useCommandHistory>;

function Harness({ commands }: { commands: string[] }) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const history = useCommandHistory(commands, inputRef);

  // Expose the hook result to tests after commit instead of during render.
  useEffect(() => {
    api = history;
  }, [history]);

  return (
    <textarea
      ref={inputRef}
      value={history.value}
      onChange={(event) => history.changeValue(event.target.value)}
    />
  );
}

function setup(commands: string[]) {
  const view = render(<Harness commands={commands} />);
  return {
    textarea: view.container.querySelector("textarea") as HTMLTextAreaElement,
  };
}

describe("useCommandHistory", () => {
  it("filters by the original draft while walking history", () => {
    setup(["theme dark", "theme light", "help"]);

    act(() => api.changeValue("th"));
    act(() => {
      expect(api.navigate("previous")).toBe(true);
    });
    expect(api.value).toBe("theme light");

    act(() => api.navigate("previous"));
    expect(api.value).toBe("theme dark");

    act(() => api.navigate("next"));
    expect(api.value).toBe("theme light");

    act(() => api.navigate("next"));
    expect(api.value).toBe("th");
  });

  it("returns false when no command matches the draft", () => {
    setup(["help"]);

    act(() => api.changeValue("xyz"));
    act(() => {
      expect(api.navigate("previous")).toBe(false);
    });
    expect(api.value).toBe("xyz");
  });

  it("does nothing on next before browsing history", () => {
    setup(["help"]);
    act(() => {
      expect(api.navigate("next")).toBe(false);
    });
  });

  it("moves the caret to the end after a recall", () => {
    const { textarea } = setup(["theme dark"]);

    act(() => api.changeValue("th"));
    act(() => api.navigate("previous"));

    expect(textarea.value).toBe("theme dark");
    expect(textarea.selectionStart).toBe(textarea.value.length);
    expect(textarea.selectionEnd).toBe(textarea.value.length);
  });

  it("resets value and draft", () => {
    setup(["help"]);

    act(() => api.changeValue("help"));
    act(() => api.reset());

    expect(api.value).toBe("");
    act(() => {
      expect(api.navigate("previous")).toBe(true);
    });
    expect(api.value).toBe("help");
  });
});
