import { useEffect, useState, type RefObject } from 'react';

/**
 * Maps scroll through a tall sticky section to 0–1 progress.
 * Container should be taller than the viewport; sticky child pins inside.
 */
export function useScrollProgress(containerRef: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) {
        setProgress(1);
        return;
      }
      const scrolled = -rect.top;
      const p = Math.min(1, Math.max(0, scrolled / total));
      setProgress(p);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [containerRef]);

  return progress;
}

export function beatFromProgress(progress: number, beatCount: number): number {
  const idx = Math.min(beatCount - 1, Math.floor(progress * beatCount));
  return idx;
}
