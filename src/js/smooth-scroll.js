//eased wheel scrolling like cuberto.com (Lenis, their defaults); touch, keyboard and reduced motion keep native scroll
(function () {
  if (typeof Lenis === 'undefined') return;

  const root = document.documentElement;
  const pointerFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  let lenis = null;

  //prefersReducedMotion() from main.js also covers the a11y panel's Reduce Motion toggle
  function isEligible() {
    return pointerFine.matches && !prefersReducedMotion();
  }

  function sync() {
    if (isEligible() && !lenis) {
      //allowNestedScroll: scrollable boxes (paper previews, a11y panel) keep their own wheel scrolling
      lenis = new Lenis({ autoRaf: true, allowNestedScroll: true });
    } else if (!isEligible() && lenis) {
      lenis.destroy();
      lenis = null;
    }
  }

  //lets main.js's anchor links glide with the same easing; false when native scroll should handle it
  window.smoothScrollTo = (top) => {
    if (!lenis) return false;
    lenis.scrollTo(top);
    return true;
  };

  sync();
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] });
  pointerFine.addEventListener('change', sync);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', sync);
})();
