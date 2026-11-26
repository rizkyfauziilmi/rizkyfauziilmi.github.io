import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

type MediaListener = (event: MediaQueryListEvent) => void;

// jsdom has no matchMedia, which ThemeProvider needs for theme="system".
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string): MediaQueryList => {
      const listeners = new Set<MediaListener>();
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: (listener: MediaListener | null) => {
          if (listener) listeners.add(listener);
        },
        removeListener: (listener: MediaListener | null) => {
          if (listener) listeners.delete(listener);
        },
        addEventListener: (
          _type: string,
          listener: EventListenerOrEventListenerObject | null,
        ) => {
          if (listener) listeners.add(listener as MediaListener);
        },
        removeEventListener: (
          _type: string,
          listener: EventListenerOrEventListenerObject | null,
        ) => {
          if (listener) listeners.delete(listener as MediaListener);
        },
        dispatchEvent: (_event: Event) => false,
      } as MediaQueryList;
    },
  });
}

// TerminalPane and the fake caret measure layout changes through ResizeObserver.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// Base UI ScrollArea checks running animations after a deferred timeout.
if (!Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => [];
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
});
