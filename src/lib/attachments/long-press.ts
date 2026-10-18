export const LONG_PRESS_MS = 650;

export function longPress(onHold: () => void) {
  return (element: HTMLAnchorElement) => {
    const document = element.ownerDocument;
    const view = document.defaultView;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pointer: { id: number; x: number; y: number } | undefined;
    let held = false;

    function cancel() {
      clearTimeout(timer);
      timer = undefined;
      pointer = undefined;
    }

    function down(event: PointerEvent) {
      cancel();
      held = false;
      if (
        !event.isPrimary ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey
      )
        return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      timer = setTimeout(() => {
        held = true;
        onHold();
      }, LONG_PRESS_MS);
    }

    function move(event: PointerEvent) {
      if (pointer?.id !== event.pointerId) return;
      if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 10) cancel();
    }

    function up(event: PointerEvent) {
      if (pointer?.id === event.pointerId) cancel();
    }

    function click(event: MouseEvent) {
      if (!held || event.detail === 0) return;
      held = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    function contextMenu(event: MouseEvent) {
      if (pointer || held) event.preventDefault();
    }

    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') cancel();
      if (event.key === 'Enter' && event.altKey) {
        event.preventDefault();
        if (!event.repeat) onHold();
      }
    }

    element.addEventListener('pointerdown', down);
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
    document.addEventListener('scroll', cancel, true);
    view?.addEventListener('blur', cancel);
    element.addEventListener('click', click, true);
    element.addEventListener('contextmenu', contextMenu);
    element.addEventListener('keydown', keydown);
    return () => {
      cancel();
      element.removeEventListener('pointerdown', down);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
      document.removeEventListener('scroll', cancel, true);
      view?.removeEventListener('blur', cancel);
      element.removeEventListener('click', click, true);
      element.removeEventListener('contextmenu', contextMenu);
      element.removeEventListener('keydown', keydown);
    };
  };
}
