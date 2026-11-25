import { useCallback, useEffect, useRef, useState } from "react";
import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  CommandDefinition,
  CompletionCatalog,
} from "@/components/terminal/commands";
import { useCommandCompletion } from "./use-command-completion";

type Api = ReturnType<typeof useCommandCompletion>;

const command = (
  overrides: Partial<CommandDefinition> & Pick<CommandDefinition, "name">,
): CommandDefinition => ({
  description: "A command",
  run: () => ({ type: "blank" }),
  ...overrides,
});

function catalog(
  names: string[],
  commands: CommandDefinition[] = [],
): CompletionCatalog {
  return {
    commandNames: new Set(names),
    commands: new Map(commands.map((item) => [item.name, item])),
    flagsFor: (item, isFirstArgument) =>
      isFirstArgument && item.name !== "echo" ? ["-h", "--help"] : [],
  };
}

function Harness({
  initialValue,
  catalog: completionCatalog,
  apiRef,
  replaceValue,
}: {
  initialValue: string;
  catalog: CompletionCatalog;
  apiRef: { current: Api | null };
  replaceValue: (value: string, caret: number) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nextCaret = useRef<number | null>(null);
  const updateValue = useCallback(
    (next: string, caret: number) => {
      replaceValue(next, caret);
      nextCaret.current = caret;
      setValue(next);
    },
    [replaceValue],
  );
  const api = useCommandCompletion({
    value,
    inputRef,
    catalog: completionCatalog,
    replaceValue: updateValue,
  });

  useEffect(() => {
    apiRef.current = api;
  }, [api, apiRef]);

  useEffect(() => {
    if (nextCaret.current === null) return;
    inputRef.current?.setSelectionRange(nextCaret.current, nextCaret.current);
    nextCaret.current = null;
  }, [value]);

  return <textarea ref={inputRef} value={value} readOnly />;
}

function setup(value: string, completionCatalog: CompletionCatalog) {
  const apiRef: { current: Api | null } = { current: null };
  const replaceValue = vi.fn();
  const view = render(
    <Harness
      initialValue={value}
      catalog={completionCatalog}
      apiRef={apiRef}
      replaceValue={replaceValue}
    />,
  );
  const api = () => {
    if (!apiRef.current) throw new Error("hook result is not ready");
    return apiRef.current;
  };
  const textarea = view.container.querySelector(
    "textarea",
  ) as HTMLTextAreaElement;
  const complete = (backward?: boolean) =>
    act(() => {
      api().complete(backward);
    });
  const accept = () => {
    let result = false;
    act(() => {
      result = api().acceptCompletion();
    });
    return result;
  };

  return {
    textarea,
    replaceValue,
    complete,
    accept,
    clear: () => act(() => api().clearSuggestions()),
    getSuggestions: () => api().suggestions,
    getActiveSuggestion: () => api().activeSuggestion,
    getHasSelection: () => api().hasSelection,
  };
}

describe("useCommandCompletion", () => {
  it("uses the textarea caret and replaces the value with the completion", () => {
    const { textarea, complete, replaceValue, getHasSelection } = setup(
      "the",
      catalog(["theme", "shutdown"]),
    );
    textarea.setSelectionRange(3, 3);

    complete();

    expect(replaceValue).toHaveBeenCalledWith("theme ", 6);
    expect(getHasSelection()).toBe(false);
  });

  it("completes an argument value from the catalog", () => {
    const theme = command({
      name: "theme",
      arguments: [
        { name: "dark", description: "Dark", values: ["dark"] },
        { name: "light", description: "Light", values: ["light"] },
      ],
    });
    const { textarea, complete, replaceValue } = setup(
      "theme d",
      catalog(["theme"], [theme]),
    );
    textarea.setSelectionRange(7, 7);

    complete();

    expect(replaceValue).toHaveBeenCalledWith("theme dark ", 11);
  });

  it("cycles ambiguous matches from the original text and wraps", () => {
    const {
      textarea,
      complete,
      replaceValue,
      getSuggestions,
      getActiveSuggestion,
    } = setup("s", catalog(["shutdown", "sudo"]));
    textarea.setSelectionRange(1, 1);

    complete();
    expect(replaceValue).toHaveBeenLastCalledWith("s", 1);
    expect(getSuggestions()).toEqual(["shutdown", "sudo"]);
    expect(getActiveSuggestion()).toBe(0);

    complete();
    expect(getActiveSuggestion()).toBe(1);
    expect(replaceValue).toHaveBeenCalledTimes(1);

    complete();
    expect(getActiveSuggestion()).toBe(0);

    complete(true);
    expect(getActiveSuggestion()).toBe(1);
    expect(replaceValue).toHaveBeenCalledTimes(1);
  });

  it("accepts the highlighted match without changing the candidate set", () => {
    const { textarea, complete, accept, replaceValue, getSuggestions } = setup(
      "s",
      catalog(["shutdown", "sudo"]),
    );
    textarea.setSelectionRange(1, 1);

    complete();
    complete();
    expect(accept()).toBe(true);

    expect(replaceValue).toHaveBeenLastCalledWith("sudo ", 5);
    expect(getSuggestions()).toEqual([]);
  });

  it("does nothing when accepting without an active selection", () => {
    const { accept, replaceValue } = setup("the", catalog(["theme"]));

    expect(accept()).toBe(false);
    expect(replaceValue).not.toHaveBeenCalled();
  });

  it("clears the selection on demand", () => {
    const { textarea, complete, clear, getSuggestions, getHasSelection } =
      setup("s", catalog(["shutdown", "sudo"]));
    textarea.setSelectionRange(1, 1);

    complete();
    expect(getHasSelection()).toBe(true);

    clear();
    expect(getSuggestions()).toEqual([]);
    expect(getHasSelection()).toBe(false);
  });

  it("starts over when the caret no longer matches the selection", () => {
    const { textarea, complete, getSuggestions, getHasSelection } = setup(
      "s dark",
      catalog(["shutdown", "sudo"]),
    );
    textarea.setSelectionRange(1, 1);

    complete();
    expect(getSuggestions()).toEqual(["shutdown", "sudo"]);

    textarea.setSelectionRange(6, 6);
    complete();

    expect(getSuggestions()).toEqual([]);
    expect(getHasSelection()).toBe(false);
  });
});
