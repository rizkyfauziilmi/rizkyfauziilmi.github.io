import { useEffect, useRef } from "react";
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
  value,
  catalog: completionCatalog,
  apiRef,
  replaceValue,
}: {
  value: string;
  catalog: CompletionCatalog;
  apiRef: { current: Api | null };
  replaceValue: (value: string, caret: number) => void;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const api = useCommandCompletion({
    value,
    inputRef,
    catalog: completionCatalog,
    replaceValue,
  });

  useEffect(() => {
    apiRef.current = api;
  }, [api, apiRef]);

  return <textarea ref={inputRef} value={value} readOnly />;
}

function setup(value: string, completionCatalog: CompletionCatalog) {
  const apiRef: { current: Api | null } = { current: null };
  const replaceValue = vi.fn();
  const view = render(
    <Harness
      value={value}
      catalog={completionCatalog}
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
    const { textarea, complete, replaceValue } = setup(
      "the",
      catalog(["theme", "shutdown"]),
    );
    textarea.setSelectionRange(3, 3);

    complete();

    expect(replaceValue).toHaveBeenCalledWith("theme ", 6);
  });

  it("exposes ambiguous suggestions and clears them on demand", () => {
    const { textarea, complete, clearSuggestions, getSuggestions } = setup(
      "s",
      catalog(["shutdown", "sudo"]),
    );
    textarea.setSelectionRange(1, 1);

    complete();
    expect(getSuggestions()).toEqual(["shutdown", "sudo"]);

    clearSuggestions();
    expect(getSuggestions()).toEqual([]);
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
});
