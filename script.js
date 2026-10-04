// NeuroSentio – shared page behaviour (used by every page)
(() => {
  const header = document.querySelector(".site-header");
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("menuToggle");
  const navLinks = [...document.querySelectorAll(".nav ul a")];

  // Header turns solid once you scroll past the top.
  // Inner pages have no full-bleed hero, so they mark the header with data-solid to keep it solid.
  const alwaysSolid = header.hasAttribute("data-solid");
  const onScroll = () => header.classList.toggle("is-scrolled", alwaysSolid || window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.matchMedia("(min-width: 861px)").addEventListener("change", () => setMenu(false));

  // Home page only: highlight the nav link for the section in view.
  // Other pages set their own is-active link in the HTML.
  if (document.body.dataset.page === "home" && "IntersectionObserver" in window) {
    const spyLinks = navLinks.filter((a) => a.getAttribute("href").startsWith("#"));
    const sections = spyLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          spyLinks.forEach((a) =>
            a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }

  // Testimonial carousel (home page only)
  const track = document.getElementById("tTrack");
  const prev = document.getElementById("tPrev");
  const next = document.getElementById("tNext");
  if (track && prev && next) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // One step = one card (card width + the 20px gap)
    const step = () => {
      const card = track.querySelector(".t-card");
      return card ? card.getBoundingClientRect().width + 20 : 320;
    };
    const go = (dir) =>
      track.scrollBy({ left: dir * step(), behavior: reduceMotion.matches ? "auto" : "smooth" });
    const controls = document.querySelector(".t-controls");
    const updateArrows = () => {
      const max = track.scrollWidth - track.clientWidth;
      // Nothing to scroll (all cards fit): hide the arrows instead of showing two dead buttons
      if (controls) controls.hidden = max <= 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
    };
    prev.addEventListener("click", () => go(-1));
    next.addEventListener("click", () => go(1));
    track.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    updateArrows();
  }

  // Contact form (contact page only).
  // The site is static, so a valid form opens the visitor's email app with the message filled in.
  // Swap the submit handler for a fetch() to a form service (Formspree, Netlify Forms, ...) to send directly.
  const form = document.getElementById("contactForm");
  if (form) {
    const status = document.getElementById("formStatus");
    const to = form.getAttribute("action").replace("mailto:", "");
    const fields = [...form.querySelectorAll("input, select, textarea")];
    const errorFor = (el) => document.getElementById(el.getAttribute("aria-describedby"));
    const check = (el) => {
      const bad = !el.checkValidity();
      el.setAttribute("aria-invalid", String(bad));
      errorFor(el).hidden = !bad;
      return !bad;
    };
    fields.forEach((el) => el.addEventListener("input", () => { if (el.getAttribute("aria-invalid") === "true") check(el); }));
    fields.forEach((el) => el.addEventListener("change", () => { if (el.getAttribute("aria-invalid") === "true") check(el); }));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      status.hidden = true;
      const firstBad = fields.filter((el) => !check(el))[0];
      if (firstBad) { firstBad.focus(); return; }

      const data = new FormData(form);
      const subject = `[NeuroSentio] ${data.get("subject")} – ${data.get("name")}`;
      const body = `Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`;
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      status.textContent = `Thanks! Your email app should open with your message ready to send. If it doesn't, write to us at ${to}.`;
      status.hidden = false;
    });
  }

  // Footer year
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
