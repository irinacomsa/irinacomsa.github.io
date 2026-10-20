//covers OS-level pref + the a11y panel's Reduce Motion toggle; checked live since JS-driven
//motion (setTimeout, scrollTo) doesn't stop just because a CSS rule says none
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
        || document.documentElement.classList.contains('a11y-reduce-motion');
}

const navLinks = document.querySelectorAll(".nav_link");
const sections = document.querySelectorAll(".section");
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  let current = "";

  // Find which section is in view
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 150) {
      current = section.id;
    }
  });

  // Update classes
  navLinks.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });

  // Fade the navbar's background/blur in once the page has scrolled past the hero
  if (navbar) {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  }
}, { passive: true });


//figures out, at the current width, which words the browser would wrap onto which line for
//each phrase (via each word's offsetTop), plus the tallest phrase's height. Typing then fills
//within those pre-assigned lines instead of relying on live reflow — a word can't jump to the
//next line mid-type if it was already assigned there before typing started.
function measurePhrases(heading, target, phrases) {
    heading.style.minHeight = '0'; //don't let a stale reservation skew this measurement
    const measured = phrases.map((phrase) => {
        const words = phrase.split(' ');
        const wordEls = words.map((word) => {
            const span = document.createElement('span');
            span.textContent = word;
            return span;
        });
        target.innerHTML = '';
        wordEls.forEach((el, i) => {
            target.appendChild(el);
            if (i < wordEls.length - 1) target.appendChild(document.createTextNode(' '));
        });

        const lines = [];
        let currentLine = [];
        let lastTop = null;
        wordEls.forEach((el, i) => {
            const top = el.offsetTop;
            if (lastTop !== null && top > lastTop) {
                lines.push(currentLine.join(' '));
                currentLine = [];
            }
            currentLine.push(words[i]);
            lastTop = top;
        });
        lines.push(currentLine.join(' '));

        return { lines, height: heading.getBoundingClientRect().height };
    });

    target.innerHTML = '';
    heading.style.minHeight = Math.max(...measured.map((m) => m.height)) + 'px';
    return measured.map((m) => m.lines);
}

//renders `count` characters of a phrase already split into lines (see measurePhrases), joining
//completed/partial lines with <br> so a line only ever shows a prefix of its own final content
function renderTypedLines(target, lines, count) {
    let remaining = count;
    const parts = [];
    for (let i = 0; i < lines.length && remaining > 0; i++) {
        const line = lines[i];
        if (remaining >= line.length) {
            parts.push(line);
            remaining -= line.length + (i < lines.length - 1 ? 1 : 0); //+1 consumes the space collapsed into the <br>
        } else {
            parts.push(line.slice(0, remaining));
            remaining = 0;
        }
    }
    target.innerHTML = parts.join('<br>');
}

//cycles the hero heading's tail through phrases: type, pause, delete, next phrase, repeat
window.addEventListener('DOMContentLoaded', async () => {
    const target = document.querySelector('[data-typewriter-phrases]');
    if (!target) return;

    const heading = target.closest('h1');
    const phrases = JSON.parse(target.dataset.typewriterPhrases);

    //Jost has no font-display:swap, so it can still be loading here — measuring against the
    //fallback font first would bake in wrong line breaks that never correct themselves
    if (document.fonts && document.fonts.ready) await document.fonts.ready;

    let linesByPhrase = measurePhrases(heading, target, phrases);

    if (prefersReducedMotion()) {
        target.textContent = phrases[0];
        target.classList.add('typewriter-done');
        window.addEventListener('resize', () => measurePhrases(heading, target, phrases));
        return;
    }

    const typeSpeedMs = 55;
    const deleteSpeedMs = 30;
    const pauseAfterTypeMs = 1800;
    const pauseAfterDeleteMs = 400;

    let phraseIndex = 0;
    let charIndex = 0;

    window.addEventListener('resize', () => {
        linesByPhrase = measurePhrases(heading, target, phrases);
        if (!target.classList.contains('typewriter-done')) {
            renderTypedLines(target, linesByPhrase[phraseIndex], charIndex);
        }
    });

    //checked every tick so toggling Reduce Motion mid-animation stops it instead of finishing the cycle
    function stopIfMotionNowReduced() {
        if (!prefersReducedMotion()) return false;
        target.textContent = phrases[phraseIndex];
        target.classList.add('typewriter-done');
        return true;
    }

    function typeNextChar() {
        if (stopIfMotionNowReduced()) return;
        charIndex++;
        renderTypedLines(target, linesByPhrase[phraseIndex], charIndex);
        if (charIndex < phrases[phraseIndex].length) {
            setTimeout(typeNextChar, typeSpeedMs);
        } else {
            setTimeout(deletePhrase, pauseAfterTypeMs);
        }
    }

    function deletePhrase() {
        if (stopIfMotionNowReduced()) return;
        charIndex--;
        renderTypedLines(target, linesByPhrase[phraseIndex], charIndex);
        if (charIndex > 0) {
            setTimeout(deletePhrase, deleteSpeedMs);
        } else {
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(typeNextChar, pauseAfterDeleteMs);
        }
    }

    typeNextChar();
});



//reveals about_imageAndText on scroll; also stands in for :hover on touch (see html.touch rules in layout.css)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, { threshold: 0.2 });

const aboutImageAndText = document.querySelector('.about_imageAndText');
if (aboutImageAndText) observer.observe(aboutImageAndText);

//project cards use a lower threshold + rootMargin below the viewport so the reveal fires just before they're fully in view
const projectCards = document.querySelectorAll('.project_card');
const projectObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px 150px 0px' });

projectCards.forEach((card) => projectObserver.observe(card));

//LAZY VIDEO LOAD: autoplay demo videos are several MB each and sit below the fold on project
//pages — loading data-src only once scrolled near view keeps them from downloading on every visit
const lazyVideos = document.querySelectorAll('video[data-src]');
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const video = entry.target;
    video.src = video.dataset.src;
    video.removeAttribute('data-src');
    video.load();
    video.play().catch(() => {}); //autoplay can still be blocked by browser policy; muted+playsinline covers most cases
    videoObserver.unobserve(video);
  });
}, { rootMargin: '200px 0px' });

lazyVideos.forEach((video) => videoObserver.observe(video));

//"hover:none" misfires on hybrid touchscreen+mouse devices, so touchstart is the reliable signal
document.addEventListener('touchstart', function onFirstTouch() {
  document.documentElement.classList.add('touch');
  document.removeEventListener('touchstart', onFirstTouch);
}, { passive: true });

//tapping a card reveals it immediately instead of waiting on scroll position
projectCards.forEach((card) => card.addEventListener('touchstart', () => card.classList.add('is-visible'), { passive: true }));

//SWIPE NAVIGATION (project pages only): swipe left/right anywhere to go to the next/previous project
const sideNav = document.querySelector('.side-nav');
if (sideNav) {
  const prevLink = sideNav.querySelector('.side-nav_prev');
  const nextLink = sideNav.querySelector('.side-nav_next');
  const SWIPE_MIN_DISTANCE = 60; //px
  const SWIPE_MIN_RATIO = 1.5; //horizontal must dominate over vertical, so scrolling isn't mistaken for a swipe
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < SWIPE_MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * SWIPE_MIN_RATIO) return;
    const link = dx < 0 ? nextLink : prevLink;
    if (link) window.location.href = link.getAttribute('href');
  }, { passive: true });
}


//gives #about a "stuck" range long enough to reveal its own overflow before releasing
function sizeHeroAboutSpacer() {
    const about = document.querySelector('#about');
    const spacer = document.querySelector('.hero_about_spacer');
    if (!about || !spacer) return;
    spacer.style.height = '0px'; // reset before measuring
    const overflow = about.scrollHeight - window.innerHeight;
    spacer.style.height = Math.max(0, overflow) + 'px';
}
window.addEventListener('DOMContentLoaded', sizeHeroAboutSpacer);
window.addEventListener('load', sizeHeroAboutSpacer);
window.addEventListener('resize', sizeHeroAboutSpacer);


//native #hash jumps miscalculate against sticky sections; unstick elements before measuring their rect
function trueOffsetTop(el) {
    const prevPosition = el.style.position;
    el.style.position = 'static';
    const top = el.getBoundingClientRect().top + window.scrollY;
    el.style.position = prevPosition;
    return top;
}

document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: trueOffsetTop(target), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    history.pushState(null, '', link.getAttribute('href'));
});

//same native-jump bug applies when a page loads directly with a #hash (e.g. a cross-page nav link)
window.addEventListener('load', () => {
    if (!window.location.hash) return;
    sizeHeroAboutSpacer();
    const target = document.getElementById(window.location.hash.slice(1));
    if (target) window.scrollTo({ top: trueOffsetTop(target) });
});


//blocking chrome feature
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

//don't fight an intentional #about / #projects link (e.g. from another page's nav) with a forced scroll-to-top
if (!window.location.hash) {
    window.scrollTo(0, 0);

    window.addEventListener('load', () => {
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 0);
    });
}


//CUSTOM CURSOR: trailing dot that stretches along its direction of travel (same mechanic as
//Cuberto's mouse-follower, reimplemented without GSAP): a tween lags behind the real cursor,
//and the lag distance each frame drives a skew/scale/rotation on the dot. Off on touch/reduced
//motion, and suspended while the a11y "Big Cursor" toggle or the a11y dialog is active — waits
//for DOMContentLoaded since both of those live in accessibility.js, which runs after this file.
window.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const dialog = document.getElementById('a11yPanel');
    const pointerFine = window.matchMedia('(hover: hover) and (pointer: fine)');

    const cursor = document.createElement('div');
    cursor.className = 'custom_cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<div class="custom_cursor_inner"><div class="custom_cursor_icon"></div></div>';
    document.body.appendChild(cursor);
    const inner = cursor.querySelector('.custom_cursor_inner');

    //tween-lag-driven skew, matching mouse-follower's render(): vel is how far behind the
    //eased position still is, not raw mouse speed — big right after a flick, settles to 0
    const EASE = 0.22; //~= their speed:0.5s expo.out, tuned for a per-frame lerp instead
    const SKEWING = 1.5;
    const SKEW_DELTA = 0.001;
    const SKEW_DELTA_MAX = 0.15;

    let active = false;
    let hasMoved = false;
    let targetX = 0, targetY = 0, posX = 0, posY = 0;
    let rafId = null;

    function isEligible() {
        return pointerFine.matches
            && !prefersReducedMotion()
            && !root.classList.contains('a11y-big-cursor')
            && !(dialog && dialog.open);
    }

    function onMouseMove(e) {
        targetX = e.clientX;
        targetY = e.clientY;
        if (!hasMoved) {
            hasMoved = true;
            posX = targetX;
            posY = targetY;
            cursor.classList.add('custom_cursor--visible');
            onHover(e); //pointer may already be on a card
        }
    }

    function onMouseLeaveWindow() {
        cursor.classList.remove('custom_cursor--visible');
    }
    function onMouseEnterWindow() {
        if (hasMoved) cursor.classList.add('custom_cursor--visible');
    }

    function loop() {
        posX += (targetX - posX) * EASE;
        posY += (targetY - posY) * EASE;
        const velX = targetX - posX;
        const velY = targetY - posY;
        const speed = Math.sqrt(velX * velX + velY * velY);
        const skew = Math.min(speed * SKEW_DELTA, SKEW_DELTA_MAX) * SKEWING;
        const angle = Math.atan2(velY, velX) * (180 / Math.PI);
        cursor.style.transform = `translate(${posX}px, ${posY}px) translate(-50%, -50%) rotate(${angle}deg) scale(${1 + skew}, ${1 - skew})`;
        inner.style.transform = `rotate(${-angle}deg)`;
        rafId = requestAnimationFrame(loop);
    }

    //derived from the hovered element, so it can't get stuck
    const hoverSelector = 'a, button, [data-cursor-icon]';
    function onHover(e) {
        if (!active || !(e.target instanceof Element)) return;
        const isIcon = !!e.target.closest('[data-cursor-icon]');
        cursor.classList.toggle('custom_cursor--icon', isIcon);
        cursor.classList.toggle('custom_cursor--pointer', !isIcon && !!e.target.closest(hoverSelector));
    }
    function onMouseDown() {
        if (active) cursor.classList.add('custom_cursor--active');
    }
    function onMouseUp() {
        if (active) cursor.classList.remove('custom_cursor--active');
    }

    //new tab (blur) or bfcache return skip mouseout/mouseup and left the arrow stuck
    function resetInteraction() {
        hasMoved = false;
        cursor.classList.remove('custom_cursor--visible', 'custom_cursor--pointer', 'custom_cursor--icon', 'custom_cursor--active');
    }

    function activate() {
        if (active) return;
        active = true;
        root.classList.add('custom-cursor-active');
        document.addEventListener('mousemove', onMouseMove);
        document.documentElement.addEventListener('mouseleave', onMouseLeaveWindow);
        document.documentElement.addEventListener('mouseenter', onMouseEnterWindow);
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);
        loop();
    }

    function deactivate() {
        if (!active) return;
        active = false;
        resetInteraction();
        root.classList.remove('custom-cursor-active');
        document.removeEventListener('mousemove', onMouseMove);
        document.documentElement.removeEventListener('mouseleave', onMouseLeaveWindow);
        document.documentElement.removeEventListener('mouseenter', onMouseEnterWindow);
        document.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mouseup', onMouseUp);
        if (rafId) cancelAnimationFrame(rafId);
    }

    function sync() {
        if (isEligible()) activate(); else deactivate();
    }

    document.addEventListener('mouseover', onHover);
    window.addEventListener('blur', resetInteraction);
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) resetInteraction();
    });

    sync();
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] });
    if (dialog) new MutationObserver(sync).observe(dialog, { attributes: true, attributeFilter: ['open'] });
    pointerFine.addEventListener('change', sync); //e.g. a mouse plugged into/unplugged from a touch device mid-session
});










