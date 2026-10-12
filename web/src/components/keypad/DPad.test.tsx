import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DPad } from "./DPad";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function mountDPad() {
  const onKeyDown = vi.fn();
  const onKeyUp = vi.fn();
  const rect = { width: 120, height: 120, left: 0, top: 0 } as DOMRect;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(rect);
  const mounted = render(<DPad onKeyDown={onKeyDown} onKeyUp={onKeyUp} />);
  return { ...mounted, pad: mounted.container.querySelector("canvas")!.parentElement!, onKeyDown, onKeyUp };
}

describe("DPad pointer input", () => {
  it.each([40, 60, 80])("sends right key down and up at y=%s", (clientY) => {
    const { pad, onKeyDown, onKeyUp } = mountDPad();
    fireEvent.pointerDown(pad, { clientX: 100, clientY });
    fireEvent.pointerUp(pad);
    expect(onKeyDown).toHaveBeenCalledExactlyOnceWith(7, 2);
    expect(onKeyUp).toHaveBeenCalledExactlyOnceWith(7, 2);
  });

  it("releases a quick tap before React commits the pressed state", () => {
    const { pad, onKeyDown, onKeyUp } = mountDPad();
    act(() => {
      fireEvent.pointerDown(pad, { clientX: 100, clientY: 60 });
      fireEvent.pointerUp(pad);
    });
    expect(onKeyDown).toHaveBeenCalledExactlyOnceWith(7, 2);
    expect(onKeyUp).toHaveBeenCalledExactlyOnceWith(7, 2);
  });

  it.each(["pointerCancel", "lostPointerCapture"] as const)("releases on %s", (event) => {
    const { pad, onKeyUp } = mountDPad();
    fireEvent.pointerDown(pad, { clientX: 100, clientY: 60 });
    fireEvent[event](pad);
    expect(onKeyUp).toHaveBeenCalledExactlyOnceWith(7, 2);
  });

  it("re-enters a segment after dragging across the center", () => {
    const { pad, onKeyDown, onKeyUp } = mountDPad();
    fireEvent.pointerDown(pad, { clientX: 100, clientY: 60 });
    fireEvent.pointerMove(pad, { clientX: 60, clientY: 60 });
    fireEvent.pointerMove(pad, { clientX: 20, clientY: 60 });
    fireEvent.pointerUp(pad);
    expect(onKeyDown.mock.calls).toEqual([[7, 2], [7, 1]]);
    expect(onKeyUp.mock.calls).toEqual([[7, 2], [7, 1]]);
  });

  it("releases on unmount", () => {
    const { pad, onKeyUp, unmount } = mountDPad();
    fireEvent.pointerDown(pad, { clientX: 100, clientY: 60 });
    unmount();
    expect(onKeyUp).toHaveBeenCalledExactlyOnceWith(7, 2);
  });

  it("ignores another pointer while a direction is held", () => {
    const { pad, onKeyDown, onKeyUp } = mountDPad();
    fireEvent.pointerDown(pad, { pointerId: 1, clientX: 100, clientY: 60 });
    fireEvent.pointerDown(pad, { pointerId: 2, clientX: 20, clientY: 60 });
    fireEvent.pointerMove(pad, { pointerId: 2, clientX: 60, clientY: 20 });
    fireEvent.pointerUp(pad, { pointerId: 2 });
    expect(onKeyUp).not.toHaveBeenCalled();
    fireEvent.pointerUp(pad, { pointerId: 1 });
    expect(onKeyDown).toHaveBeenCalledExactlyOnceWith(7, 2);
    expect(onKeyUp).toHaveBeenCalledExactlyOnceWith(7, 2);
  });

  it("does not press on hover and releases only once after capture loss", () => {
    const { pad, onKeyDown, onKeyUp } = mountDPad();
    fireEvent.pointerMove(pad, { clientX: 100, clientY: 60 });
    expect(onKeyDown).not.toHaveBeenCalled();
    fireEvent.pointerDown(pad, { clientX: 100, clientY: 60 });
    fireEvent.pointerUp(pad);
    fireEvent.lostPointerCapture(pad);
    expect(onKeyUp).toHaveBeenCalledExactlyOnceWith(7, 2);
  });
});
