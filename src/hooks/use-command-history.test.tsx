import { act, render } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { describe, expect, it } from "vitest";

import { useCommandHistory, type HistoryDirection } from "./use-command-history";

type Api = ReturnType<typeof useCommandHistory>;

function Harness({
  commands,
  apiRef,
}: {
  commands: string[];
  apiRef: { current: Api | null };
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const history = useCommandHistory(commands, inputRef);

  // Expose the hook result to tests after commit instead of during render.
  useEffect(() => {
    apiRef.current = history;
  }, [history, apiRef]);

  return (
    <textarea
      ref={inputRef}
      value={history.value}
      onChange={(event) => history.changeValue(event.target.value)}
    />
  );
}

function setup(commands: string[]) {
  const apiRef: { current: Api | null } = { current: null };
  const view = render(<Harness commands={commands} apiRef={apiRef} />);
  const api = () => {
    if (!apiRef.current) throw new Error("hook result is not ready");
    return apiRef.current;
  };

  return {
    textarea: view.container.querySelector("textarea") as HTMLTextAreaElement,
    changeValue: (value: string) => act(() => api().changeValue(value)),
    navigate: (direction: HistoryDirection) => {
      let handled = false;
      act(() => {
        handled = api().navigate(direction);
      });
      return handled;
    },
    reset: () => act(() => api().reset()),
    getValue: () => api().value,
  };
}

describe("useCommandHistory", () => {
  it("filters by the original draft while walking history", () => {
    const { changeValue, navigate, getValue } = setup([
      "theme dark",
      "theme light",
      "help",
    ]);

    changeValue("th");
    expect(navigate("previous")).toBe(true);
    expect(getValue()).toBe("theme light");

    navigate("previous");
    expect(getValue()).toBe("theme dark");

    navigate("next");
    expect(getValue()).toBe("theme light");

    navigate("next");
    expect(getValue()).toBe("th");
  });

  it("returns false when no command matches the draft", () => {
    const { changeValue, navigate, getValue } = setup(["help"]);

    changeValue("xyz");
    expect(navigate("previous")).toBe(false);
    expect(getValue()).toBe("xyz");
  });

  it("does nothing on next before browsing history", () => {
    const { navigate } = setup(["help"]);

    expect(navigate("next")).toBe(false);
  });

  it("moves the caret to the end after a recall", () => {
    const { textarea, changeValue, navigate } = setup(["theme dark"]);

    changeValue("th");
    navigate("previous");

    expect(textarea.value).toBe("theme dark");
    expect(textarea.selectionStart).toBe(textarea.value.length);
    expect(textarea.selectionEnd).toBe(textarea.value.length);
  });

  it("moves the caret even when the recalled text is unchanged", () => {
    const { textarea, changeValue, navigate } = setup(["theme dark"]);

    changeValue("theme dark");
    textarea.setSelectionRange(0, 0);
    navigate("previous");

    expect(textarea.value).toBe("theme dark");
    expect(textarea.selectionStart).toBe(textarea.value.length);
  });

  it("resets value and draft", () => {
    const { changeValue, reset, navigate, getValue } = setup(["help"]);

    changeValue("help");
    reset();

    expect(getValue()).toBe("");
    expect(navigate("previous")).toBe(true);
    expect(getValue()).toBe("help");
  });
});
