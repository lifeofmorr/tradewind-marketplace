import "@testing-library/jest-dom";

// Edge-function tests run under `@vitest-environment node`, where there is
// no window — the DOM shims below only apply to jsdom suites.
if (typeof window !== "undefined") {

if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

if (!window.IntersectionObserver) {
  class StubIO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  Object.defineProperty(window, "IntersectionObserver", { value: StubIO });
  Object.defineProperty(global, "IntersectionObserver", { value: StubIO });
}

}
