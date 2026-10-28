export function horizontalSwipe(onSwipe: (direction: 'left' | 'right') => void) {
  return (element: HTMLElement) => {
    const document = element.ownerDocument;
    const view = document.defaultView;
    let pointer: { id: number; x: number; y: number; startedAt: number } | undefined;
    let suppressClick = false;

    function cancel() {
      pointer = undefined;
    }

    function down(event: PointerEvent) {
      cancel();
      suppressClick = false;
      if (
        !event.isPrimary ||
        event.button !== 0 ||
        !['touch', 'pen'].includes(event.pointerType) ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey
      )
        return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, startedAt: Date.now() };
    }

    function move(event: PointerEvent) {
      if (pointer?.id !== event.pointerId) return;
      const x = Math.abs(event.clientX - pointer.x);
      const y = Math.abs(event.clientY - pointer.y);
      if (y > 12 && y > x) cancel();
      else if (x > 12 && x > y * 1.5) suppressClick = true;
    }

    function up(event: PointerEvent) {
      if (pointer?.id !== event.pointerId) return;
      const x = Math.abs(event.clientX - pointer.x);
      const y = Math.abs(event.clientY - pointer.y);
      const elapsed = Date.now() - pointer.startedAt;
      const direction = event.clientX < pointer.x ? 'left' : 'right';
      cancel();
      // Finish before a book's 650 ms PDF-download hold can fire.
      if (x >= 48 && x > y * 1.5 && elapsed < 600) {
        suppressClick = true;
        onSwipe(direction);
      }
    }

    function click(event: MouseEvent) {
      if (!suppressClick || event.detail === 0) return;
      suppressClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    element.addEventListener('pointerdown', down);
    element.addEventListener('click', click, true);
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', cancel);
    document.addEventListener('scroll', cancel, true);
    view?.addEventListener('blur', cancel);

    return () => {
      cancel();
      element.removeEventListener('pointerdown', down);
      element.removeEventListener('click', click, true);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', cancel);
      document.removeEventListener('scroll', cancel, true);
      view?.removeEventListener('blur', cancel);
    };
  };
}
