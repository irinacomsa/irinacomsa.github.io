(function () {
  const previews = document.querySelectorAll('.paper_preview[data-page-count]');

  //page 1 is in the markup; the rest are added from data-page-count/data-page-dir
  previews.forEach((preview) => {
    const first = preview.querySelector('img');
    const count = Number(preview.dataset.pageCount);
    for (let page = 2; page <= count; page++) {
      const img = document.createElement('img');
      img.src = `${preview.dataset.pageDir}page-${String(page).padStart(2, '0')}.webp`;
      img.alt = ''; //the region's aria-label names the preview
      //attributes, not .width (rendered size): reserves space before load
      img.setAttribute('width', first.getAttribute('width'));
      img.setAttribute('height', first.getAttribute('height'));
      img.loading = 'lazy';
      img.decoding = 'async';
      preview.appendChild(img);
    }
  });

  //LOUPE: magnified reading band that follows the mouse vertically, like Reading Focus; desktop only
  const ZOOM = 1.5; //~9px paper text becomes ~14px
  const EDGE = 16; //min gap between the band and the window edge
  const root = document.documentElement;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const label = root.lang === 'de' ? 'Lupe' : 'Magnifier';
  //redrawn on a 24px grid so the thin ring stays crisp at button size
  const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" aria-hidden="true"><circle cx="10" cy="10" r="6.5" stroke-width="2.25"/><path d="M15 15l5.25 5.25" stroke-width="3.5"/></svg>';
  const loupes = [];

  previews.forEach((preview) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'paper_loupe_toggle';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', 'false');
    button.title = label;
    button.innerHTML = ICON;

    const lens = document.createElement('div');
    lens.className = 'paper_loupe';
    lens.setAttribute('aria-hidden', 'true');
    lens.hidden = true;

    preview.parentElement.append(button, lens);

    let on = false;
    let mouseX = null;
    let mouseY = null;

    function hideLens() {
      lens.hidden = true;
    }

    //elementFromPoint (not the event target) so it also follows content scrolling under a still mouse
    function render() {
      if (!on || mouseX === null) return;
      const img = document.elementFromPoint(mouseX, mouseY);
      if (!img || img.tagName !== 'IMG' || !preview.contains(img)) return hideLens();
      lens.hidden = false;
      const rect = img.getBoundingClientRect();
      const box = preview.getBoundingClientRect();
      //whole magnified line fits in the band, so reading needs no sideways panning
      const zoom = Math.min(ZOOM, (window.innerWidth - 2 * EDGE) / rect.width);
      const width = rect.width * zoom;
      const left = Math.min(Math.max(rect.left - (width - rect.width) / 2, EDGE), window.innerWidth - EDGE - width);
      //never above the button's bottom edge, so the button stays visible and clickable
      const minTop = button.getBoundingClientRect().bottom;
      const top = Math.min(Math.max(mouseY - lens.offsetHeight / 2, minTop), box.bottom - lens.offsetHeight);
      lens.style.left = `${left}px`;
      lens.style.top = `${top}px`;
      lens.style.width = `${width}px`;
      lens.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
      lens.style.backgroundSize = `${width}px ${rect.height * zoom}px`;
      //the line under the mouse stays at the mouse's height
      lens.style.backgroundPosition = `0 ${mouseY - top - (mouseY - rect.top) * zoom}px`;
    }

    function setOn(value) {
      on = value && finePointer.matches && !root.classList.contains('touch');
      button.setAttribute('aria-pressed', String(on));
      preview.classList.toggle('is-magnifying', on);
      if (!on) hideLens();
    }

    button.addEventListener('click', () => setOn(!on));
    preview.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      render();
    });
    preview.addEventListener('mouseleave', () => {
      mouseX = null;
      hideLens();
    });
    preview.addEventListener('scroll', render, { passive: true });
    loupes.push(setOn);
  });

  const turnAllOff = () => loupes.forEach((setOn) => setOn(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') turnAllOff();
  });
  document.addEventListener('touchstart', turnAllOff, { passive: true });
  finePointer.addEventListener('change', turnAllOff);
})();
