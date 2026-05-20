import type { Action } from 'svelte/action';

type RevealParams = {
  delay?: number;
  distance?: number;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
};

const DEFAULT_PARAMS: Required<RevealParams> = {
  delay: 0,
  distance: 26,
  once: true,
  threshold: 0.16,
  rootMargin: '0px 0px -10% 0px'
};

function applyHiddenState(node: HTMLElement, params: Required<RevealParams>) {
  node.style.setProperty('--reveal-delay', `${params.delay}ms`);
  node.style.setProperty('--reveal-distance', `${params.distance}px`);
  node.dataset.reveal = 'idle';
}

export const reveal: Action<HTMLElement, RevealParams> = (node, params = {}) => {
  let current = { ...DEFAULT_PARAMS, ...params };
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const setup = () => {
    if (mediaQuery.matches) {
      node.dataset.reveal = 'visible';
      return () => {};
    }

    applyHiddenState(node, current);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (entry.isIntersecting) {
          node.dataset.reveal = 'visible';
          if (current.once) observer.unobserve(node);
        } else if (!current.once) {
          node.dataset.reveal = 'idle';
        }
      },
      {
        threshold: current.threshold,
        rootMargin: current.rootMargin
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  };

  let cleanup = setup();

  return {
    update(nextParams = {}) {
      current = { ...DEFAULT_PARAMS, ...nextParams };
      cleanup();
      cleanup = setup();
    },
    destroy() {
      cleanup();
    }
  };
};
