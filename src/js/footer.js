//single source of truth for the footer, injected into every page's [data-footer] placeholder
(function () {
  //same convention as navbar.js: fintalo.html <-> fintalo.de.html
  function currentLang() {
    return window.location.pathname.split('/').pop().endsWith('.de.html') ? 'de' : 'en';
  }

  const FOOTER_COPY = {
    en: {
      heading: "You've hit the footer, thanks for stopping by!",
      sub: 'Feel free to reach out for collaborations, questions or just a friendly hello.',
      copyright: 'Copyright 2026 Irina Comsa. All rights reserved.',
      privacy: 'Privacy Notice',
      privacyHref: 'privacy.html',
      backToTop: 'Back to Top',
    },
    de: {
      heading: 'Du hast den Footer erreicht, danke fürs Vorbeischauen!',
      sub: 'Melde dich gerne für Kooperationen, Fragen oder einfach nur zum Hallosagen.',
      copyright: 'Copyright 2026 Irina Comsa. Alle Rechte vorbehalten.',
      privacy: 'Datenschutz',
      privacyHref: 'privacy.de.html',
      backToTop: 'Nach oben',
    },
  };

  function footerHTML() {
    const t = FOOTER_COPY[currentLang()];
    return `
    <section id="footer" class="footer_section">
      <div class="footer_home_container">
        <div class="footer_home_content">
          <img src="public/assets/icons/footer_icon.svg" alt="" class="footer_home_icon" />
          <div class="footer_home_text">
            <h3>${t.heading}</h3>
            <h4>${t.sub}</h4>
            <a
              href="mailto:irinacomsa28@gmail.com"
              class="footer_home_email"
              >irinacomsa28@gmail.com</a
            >
          </div>
        </div>

        <div class="footer_home_bottom">
          <p class="footer_home_copyright">
            ${t.copyright}
            <a href="${t.privacyHref}" class="footer_home_legal_link">${t.privacy}</a>
          </p>
          <a href="#hero" class="footer_home_backtotop" aria-label="${t.backToTop}">
            <span class="footer_home_backtotop_label">${t.backToTop}</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
    `;
  }

  const placeholder = document.querySelector('[data-footer]');
  if (placeholder) {
    placeholder.outerHTML = footerHTML();
  }
})();
