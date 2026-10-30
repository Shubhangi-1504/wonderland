/* eslint-disable react-refresh/only-export-components */
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { scrollRuntime } from '../sceneStore';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const TRACK_HEIGHT_SVH = 540; // ~5 viewports; scrollable ≈ 4.4 viewports for P 0..4

/**
 * Invisible scroll runway. Scroll progress (0..1) maps to P (0..4) and only
 * drives the camera — nothing else scrolls on the page.
 * Also exposes scrollToScene() for nav links and the button.
 */
export function ScrollStage() {
  useEffect(() => {
    const el = document.getElementById('mv-scroll-stage');
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scrollRuntime.target = self.progress * 4;
      },
      onRefresh: (self) => {
        scrollRuntime.target = self.progress * 4;
      },
    });
    return () => st.kill();
  }, []);

  return <div id="mv-scroll-stage" style={{ height: `${TRACK_HEIGHT_SVH}svh` }} aria-hidden="true" />;
}

/** Animated P jump to a scene (instant when the user prefers reduced motion). */
export function scrollToScene(scene: 0 | 1 | 2 | 3 | 4) {
  const el = document.getElementById('mv-scroll-stage');
  if (!el) return;
  const scrollable = el.offsetHeight - window.innerHeight;
  const top = (scene / 4) * scrollable;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    window.scrollTo({ top, behavior: 'auto' });
  } else {
    gsap.to(window, {
      scrollTo: { y: top },
      duration: 1.6 + scene * 0.35,
      ease: 'power2.inOut',
      overwrite: 'auto',
    });
  }
}
