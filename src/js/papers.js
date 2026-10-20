//page 1 is in the markup; the rest are added from data-page-count/data-page-dir
(function () {
  document.querySelectorAll('.paper_preview[data-page-count]').forEach((preview) => {
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
})();
