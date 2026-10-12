import { vi } from "vitest";

// jsdom has no layout, canvas renderer, or pointer capture implementation.
vi.stubGlobal("ResizeObserver", class {
  observe() {}
  disconnect() {}
});
vi.stubGlobal("PointerEvent", class extends MouseEvent {
  readonly pointerId: number;
  constructor(type: string, options: PointerEventInit = {}) {
    super(type, options);
    this.pointerId = options.pointerId ?? 1;
  }
});
HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
HTMLElement.prototype.setPointerCapture = vi.fn();
HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
HTMLElement.prototype.releasePointerCapture = vi.fn();
