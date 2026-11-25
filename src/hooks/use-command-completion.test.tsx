import { useEffect, useRef } from "react";
import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCommandCompletion } from "./use-command-completion";

type Api = ReturnType<typeof useCommandCompletion>;

function Harness({
  value,
  candidates,
  apiRef,
  replaceValue,
}: {
  value: string;
  candidates: ReadonlySet<string>;
  apiRef: { current: Api | null };
  replaceValue: (value: string, caret: number) => void;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const api = useCommandCompletion({ value, inputRef, candidates, replaceValue });

  useEffect(() => {
    apiRef.current = api;
  }, [api, apiRef]);

  return <textarea ref={inputRef} value={value} readOnly />;
}

function setup(value: string, candidates: string[]) {
  const apiRef: { current: Api | null } = { current: null };
  const replaceValue = vi.fn();
  const view = render(
    <Harness
      value={value}
      candidates={new Set(candidates)}
      apiRef={apiRef}
      replaceValue={replaceValue}
    />,
  );
  const api = () => {
    if (!apiRef.current) throw new Error("hook result is not ready");
    return apiRef.current;
  };
  const textarea = view.container.querySelector("textarea") as HTMLTextAreaElement;

  return {
    textarea,
    replaceValue,
    complete: () => act(() => api().complete()),
    clearSuggestions: () => act(() => api().clearSuggestions()),
    getSuggestions: () => api().suggestions,
  };
}

describe("useCommandCompletion", () => {
  it("uses the textarea caret and replaces the value with the completion", () => {
    const { textarea, complete, replaceValue } = setup("the", [
      "theme",
      "shutdown",
    ]);
    textarea.setSelectionRange(3, 3);

    complete();

    expect(replaceValue).toHaveBeenCalledWith("theme ", 6);
  });

  it("exposes ambiguous suggestions and clears them on demand", () => {
    const { textarea, complete, clearSuggestions, getSuggestions } = setup(
      "s",
      ["shutdown", "sudo"],
    );
    textarea.setSelectionRange(1, 1);

    complete();
    expect(getSuggestions()).toEqual(["shutdown", "sudo"]);

    clearSuggestions();
    expect(getSuggestions()).toEqual([]);
  });
});
