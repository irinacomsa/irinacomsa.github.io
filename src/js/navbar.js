//single source of truth for the navbar; keeps markup identical instead of duplicating across 5 HTML files
(function () {
  //language pages are named as siblings (fintalo.html <-> fintalo.de.html), so lang/labels derive from the URL
  function currentLangInfo() {
    const file = window.location.pathname.split('/').pop() || 'index.html';
    const isDe = file.endsWith('.de.html');
    const base = isDe ? file.slice(0, -'.de.html'.length) : file.replace(/\.html$/, '');
    return { lang: isDe ? 'de' : 'en', enHref: `${base}.html`, deHref: `${base}.de.html` };
  }

  const NAV_LABELS = {
    en: { home: 'Home', about: 'About', projects: 'Projects', contact: 'Contact' },
    de: { home: 'Start', about: 'Über mich', projects: 'Projekte', contact: 'Kontakt' },
  };

  //inlined (not <img>) so icon color follows currentColor/CSS instead of being baked into the file
  const SUN_ICON = `<svg class="icon-sun" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M256 127.762C185.288 127.762 127.762 185.3 127.762 256.011C127.762 326.723 185.288 384.261 256 384.261C326.7 384.261 384.238 326.734 384.238 256.011C384.238 185.288 326.7 127.762 256 127.762ZM256 90.0648C249.366 90.0648 243.003 87.4302 238.311 82.7401C233.619 78.0501 230.981 71.6886 230.978 65.0544V25.0218C230.978 18.3856 233.614 12.0212 238.307 7.32871C242.999 2.63622 249.364 0 256 0C262.636 0 269 2.63622 273.693 7.32871C278.385 12.0212 281.022 18.3856 281.022 25.0218V65.0544C281.019 71.6886 278.381 78.0501 273.689 82.7401C268.997 87.4302 262.634 90.0648 256 90.0648ZM256 421.924C252.714 421.924 249.46 422.571 246.424 423.829C243.389 425.086 240.63 426.929 238.307 429.253C235.983 431.576 234.14 434.334 232.883 437.37C231.625 440.406 230.978 443.66 230.978 446.946V486.967C230.978 493.603 233.614 499.967 238.307 504.66C242.999 509.352 249.364 511.989 256 511.989C262.636 511.989 269 509.352 273.693 504.66C278.385 499.967 281.022 493.603 281.022 486.967V446.946C281.013 440.312 278.374 433.953 273.683 429.263C268.992 424.572 262.633 421.933 256 421.924ZM373.32 138.669C368.636 133.972 366.006 127.609 366.006 120.976C366.006 114.343 368.636 107.981 373.32 103.284L401.63 74.9747C403.944 72.6114 406.704 70.7306 409.75 69.4409C412.796 68.1512 416.068 67.4783 419.376 67.461C422.684 67.4438 425.962 68.0826 429.021 69.3405C432.081 70.5984 434.86 72.4504 437.199 74.7894C439.538 77.1284 441.39 79.908 442.648 82.9673C443.906 86.0266 444.545 89.305 444.527 92.6128C444.51 95.9206 443.837 99.1922 442.548 102.238C441.258 105.284 439.377 108.044 437.014 110.359L408.704 138.669C404.012 143.36 397.648 145.996 391.012 145.996C384.376 145.996 378.012 143.36 373.32 138.669ZM138.668 373.343C136.346 371.017 133.589 369.172 130.553 367.913C127.517 366.654 124.263 366.006 120.976 366.006C117.69 366.006 114.436 366.654 111.4 367.913C108.364 369.172 105.606 371.017 103.284 373.343L74.9745 401.641C70.3628 406.35 67.7952 412.688 67.8295 419.279C67.8638 425.87 70.4973 432.181 75.1579 436.842C79.8185 441.503 86.1297 444.136 92.7206 444.17C99.3116 444.205 105.65 441.637 110.359 437.025L138.668 408.704C140.992 406.384 142.836 403.627 144.094 400.594C145.352 397.56 145.999 394.308 145.999 391.024C145.999 387.739 145.352 384.487 144.094 381.454C142.836 378.42 140.992 375.664 138.668 373.343ZM421.924 256C421.924 242.18 433.125 230.978 446.945 230.978H486.978C490.308 230.907 493.619 231.502 496.716 232.727C499.813 233.953 502.634 235.784 505.014 238.114C507.395 240.444 509.286 243.226 510.577 246.296C511.867 249.366 512.532 252.664 512.532 255.994C512.532 259.325 511.867 262.622 510.577 265.693C509.286 268.763 507.395 271.545 505.014 273.875C502.634 276.205 499.813 278.036 496.716 279.261C493.619 280.487 490.308 281.081 486.978 281.01H446.945C443.66 281.012 440.407 280.366 437.371 279.11C434.335 277.854 431.577 276.012 429.253 273.689C426.929 271.367 425.086 268.609 423.829 265.574C422.571 262.539 421.924 259.285 421.924 256ZM90.0647 256C90.0647 252.714 89.4175 249.46 88.16 246.425C86.9026 243.389 85.0595 240.63 82.736 238.307C80.4125 235.983 77.6541 234.14 74.6184 232.883C71.5826 231.625 68.3288 230.978 65.0429 230.978H25.0217C21.6917 230.907 18.3811 231.502 15.2839 232.727C12.1868 233.953 9.36542 235.784 6.98531 238.114C4.60519 240.444 2.71421 243.226 1.42324 246.296C0.132267 249.366 -0.532715 252.664 -0.532715 255.994C-0.532715 259.325 0.132267 262.622 1.42324 265.693C2.71421 268.763 4.60519 271.545 6.98531 273.875C9.36542 276.205 12.1868 278.036 15.2839 279.261C18.3811 280.487 21.6917 281.081 25.0217 281.01H65.0543C71.6874 281.01 78.049 278.375 82.7393 273.685C87.4297 268.995 90.0647 262.633 90.0647 256ZM373.32 373.343C378.017 368.659 384.379 366.029 391.012 366.029C397.645 366.029 404.007 368.659 408.704 373.343L437.014 401.652C441.705 406.345 444.339 412.708 444.338 419.343C444.337 425.978 441.7 432.34 437.008 437.031C434.685 439.354 431.927 441.196 428.891 442.453C425.856 443.709 422.603 444.356 419.318 444.355C412.683 444.354 406.32 441.718 401.63 437.025L373.32 408.716C370.996 406.394 369.152 403.637 367.894 400.602C366.636 397.567 365.989 394.314 365.989 391.029C365.989 387.744 366.636 384.491 367.894 381.456C369.152 378.422 370.996 375.665 373.32 373.343ZM138.668 138.669C143.36 133.976 145.996 127.612 145.996 120.976C145.996 114.341 143.36 107.977 138.668 103.284L110.359 74.986C105.636 70.4531 99.324 67.9517 92.7779 68.0184C86.2318 68.0852 79.9725 70.7147 75.3428 75.343C70.713 79.9713 68.0814 86.2297 68.0126 92.7758C67.9438 99.3219 70.4431 105.634 74.9745 110.359L103.284 138.669C105.606 140.994 108.364 142.84 111.4 144.099C114.436 145.358 117.69 146.006 120.976 146.006C124.263 146.006 127.517 145.358 130.553 144.099C133.589 142.84 136.346 140.994 138.668 138.669Z" fill="currentColor"/></svg>`;
  const MOON_ICON = `<svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M504.754 306.327C498.93 302.733 491.41 303.394 486.367 308.003C449.641 341.315 402.133 359.671 352.621 359.671C242.727 359.671 153.316 270.261 153.316 160.366C153.316 110.851 171.672 63.3463 204.984 26.6203C207.222 24.153 208.596 21.0244 208.898 17.7072C209.2 14.39 208.415 11.0646 206.66 8.23333C203.05 2.42533 195.984 -0.270674 189.457 1.57333C77.898 33.1633 0 136.289 0 252.351C0 396.069 116.918 512.983 260.633 512.983C376.695 512.983 479.824 435.085 511.414 323.53C512.325 320.329 512.168 316.917 510.966 313.813C509.764 310.709 507.583 308.081 504.754 306.327Z" fill="currentColor"/><path d="M253.883 203.319L290.203 221.464L308.348 257.788C309.621 260.336 311.579 262.478 314.001 263.975C316.424 265.471 319.216 266.263 322.063 266.261C327.875 266.261 333.172 262.983 335.777 257.788L353.941 221.464L390.246 203.319C392.792 202.045 394.933 200.087 396.429 197.664C397.925 195.242 398.718 192.451 398.718 189.604C398.718 186.757 397.925 183.966 396.429 181.544C394.933 179.122 392.792 177.164 390.246 175.889L353.941 157.741L335.777 121.421C330.567 111.031 313.531 111.031 308.347 121.421L290.203 157.741L253.883 175.89C251.335 177.162 249.192 179.12 247.695 181.542C246.198 183.965 245.405 186.756 245.406 189.604C245.405 192.452 246.197 195.245 247.695 197.667C249.192 200.09 251.335 202.047 253.883 203.319ZM413.945 83.7063H429.277V99.0383C429.277 107.511 436.137 114.37 444.609 114.37C453.081 114.37 459.941 107.51 459.941 99.0383V83.7063H475.273C483.746 83.7063 490.605 76.8513 490.605 68.3743C490.605 59.9013 483.746 53.0463 475.273 53.0463H459.941V37.7143C459.941 29.2373 453.082 22.3823 444.609 22.3823C436.136 22.3823 429.277 29.2373 429.277 37.7143V53.0463H413.945C405.473 53.0463 398.617 59.9013 398.617 68.3743C398.617 76.8513 405.473 83.7063 413.945 83.7063Z" fill="currentColor"/></svg>`;

  function navbarHTML(homeHref, sectionPrefix) {
    const { lang, enHref, deHref } = currentLangInfo();
    const t = NAV_LABELS[lang];
    return `
    <nav class="navbar">
      <div class="navbar_container">

        <div class="navbar_brand">
          <a href="index.html" class="navbar_logo">Irina Comsa</a>
          <button type="button" class="theme_toggle" aria-label="Toggle light/dark mode">
            ${SUN_ICON}
          </button>
        </div>

        <button type="button" class="navbar_toggle" aria-label="Toggle navigation menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>

        <div class="navbar_nav">
          <a class="nav_link" href="${homeHref}" data-target="home">${t.home}</a>
          <a class="nav_link" href="${sectionPrefix}#about" data-target="about">${t.about}</a>
          <a class="nav_link" href="${sectionPrefix}#projects" data-target="projects">${t.projects}</a>
          <div class="lang_switch" role="group" aria-label="Language">
            <a href="${enHref}" class="lang_link${lang === 'en' ? ' active' : ''}"${lang === 'en' ? ' aria-current="page"' : ''}>EN</a>
            <span class="lang_divider" aria-hidden="true">|</span>
            <a href="${deHref}" class="lang_link${lang === 'de' ? ' active' : ''}"${lang === 'de' ? ' aria-current="page"' : ''}>DE</a>
          </div>
          <a
            href="mailto:irinacomsa28@gmail.com"
            aria-label="${t.contact}"
            >${t.contact}</a
          >
        </div>
      </div>
    </nav>
    `;
  }

  const placeholder = document.querySelector('[data-navbar]');
  if (placeholder) {
    const homeHref = placeholder.dataset.homeHref || 'index.html';
    //on index.html, About/Projects scroll in-page; elsewhere they need index.html#about or clicking does nothing
    const sectionPrefix = homeHref === '#hero' ? '' : 'index.html';
    placeholder.outerHTML = navbarHTML(homeHref, sectionPrefix);

    //mobile hamburger toggle: opens/closes the dropdown, closes again once a link is picked
    const toggle = document.querySelector('.navbar_toggle');
    const nav = document.querySelector('.navbar_nav');
    if (toggle && nav) {
      const setOpen = (open) => {
        nav.classList.toggle('open', open);
        toggle.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('nav-open', open);
      };

      toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
      nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));

      //switching from mobile to desktop width shouldn't leave the dropdown stuck open
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768) setOpen(false);
      });
    }

    //theme lives on <html data-theme>, keyed by CSS via html[data-theme]; same localStorage pattern as accessibility.js
    const THEME_KEY = 'theme';
    //storage throws when blocked; theme then just won't persist
    const loadTheme = () => {
      try {
        return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
      } catch (e) {
        return 'light';
      }
    };
    const applyTheme = (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (e) {}
    };

    const themeToggle = document.querySelector('.theme_toggle');
    if (themeToggle) {
      let theme = loadTheme();
      const render = () => { themeToggle.innerHTML = theme === 'dark' ? MOON_ICON : SUN_ICON; };
      applyTheme(theme);
      render();
      themeToggle.addEventListener('click', () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        applyTheme(theme);
        render();
      });
    }
  }
})();
