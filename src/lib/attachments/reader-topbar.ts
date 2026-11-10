/** Keep navigation within reach while giving mobile reading more space. */
export function autoHideReaderTopbar(pathname: string) {
  if (!/^\/books\/[^/]+\/?$/.test(pathname)) return;

  return (header: HTMLElement) => {
    const scroller = header.closest<HTMLElement>('[data-slot="sidebar-inset"]');
    const mobile = header.ownerDocument.defaultView?.matchMedia('(max-width: 767px)');
    if (!scroller || !mobile) return;

    const scrollPosition = () =>
      Math.max(0, Math.min(scroller.scrollTop, scroller.scrollHeight - scroller.clientHeight));
    let previousTop = scrollPosition();
    let distance = 0;
    let skipNextScroll = false;

    function reveal() {
      header.removeAttribute('data-scroll-hidden');
      previousTop = scrollPosition();
      distance = 0;
    }

    function handleFocus() {
      reveal();
      // Section selection focuses its heading before scrolling it into view.
      skipNextScroll = true;
    }

    function handleScroll() {
      const top = scrollPosition();
      const delta = top - previousTop;
      previousTop = top;

      if (
        !mobile?.matches ||
        top <= header.offsetHeight ||
        header.querySelector('[aria-expanded="true"]')
      ) {
        reveal();
        skipNextScroll = false;
        return;
      }
      if (skipNextScroll) {
        skipNextScroll = false;
        return;
      }
      if (!delta) return;

      distance = Math.sign(delta) === Math.sign(distance) ? distance + delta : delta;
      if (Math.abs(distance) < 12) return;

      header.toggleAttribute('data-scroll-hidden', distance > 0);
      distance = 0;
    }

    scroller.addEventListener('scroll', handleScroll, { passive: true });
    scroller.addEventListener('focusin', handleFocus);
    mobile.addEventListener('change', reveal);

    return () => {
      scroller.removeEventListener('scroll', handleScroll);
      scroller.removeEventListener('focusin', handleFocus);
      mobile.removeEventListener('change', reveal);
      header.removeAttribute('data-scroll-hidden');
    };
  };
}
