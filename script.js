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
    const controls = document.querySelector(".t-controls");
    const go = (dir) => {
      track.scrollBy({ left: dir * step(), behavior: reduceMotion.matches ? "auto" : "smooth" });
      // Re-check the arrows once the scroll has settled, in case a browser skips the final scroll event
      setTimeout(updateArrows, 450);
    };
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
    track.addEventListener("scrollend", updateArrows);
    window.addEventListener("resize", updateArrows);
    updateArrows();
  }

  // Contact form (contact page only): sends through FormSubmit (formsubmit.co), which emails the message
  // to the address in the form's data-inbox attribute. Falls back to the visitor's mail app if sending fails.
  const form = document.getElementById("contactForm");
  if (form) {
    const status = document.getElementById("formStatus");
    const submitBtn = form.querySelector('button[type="submit"]');
    const inbox = form.dataset.inbox;
    // Only the visible fields (the hidden "_honey" spam trap has no error message and is checked separately)
    const fields = [...form.querySelectorAll("input:not([type=hidden]):not([name=_honey]), select, textarea")];
    const errorFor = (el) => document.getElementById(el.getAttribute("aria-describedby"));
    const check = (el) => {
      const bad = !el.checkValidity();
      el.setAttribute("aria-invalid", String(bad));
      const err = errorFor(el);
      if (err) err.hidden = !bad;
      return !bad;
    };
    const show = (msg, ok) => {
      status.textContent = msg;
      status.classList.toggle("is-error", !ok);
      status.hidden = false;
    };
    fields.forEach((el) => el.addEventListener("input", () => { if (el.getAttribute("aria-invalid") === "true") check(el); }));
    fields.forEach((el) => el.addEventListener("change", () => { if (el.getAttribute("aria-invalid") === "true") check(el); }));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.hidden = true;
      const firstBad = fields.filter((el) => !check(el))[0];
      if (firstBad) { firstBad.focus(); return; }
      if (form.elements["_honey"] && form.elements["_honey"].value) return; // spam bot filled the hidden field

      const data = new FormData(form);
      submitBtn.disabled = true;
      const label = submitBtn.firstChild.textContent;
      submitBtn.firstChild.textContent = "Sending… ";
      try {
        const res = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(inbox), {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data,
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || out.success === "false" || out.success === false) throw new Error(out.message || "send failed");
        form.reset();
        fields.forEach((el) => el.removeAttribute("aria-invalid"));
        show("Thank you! Your message has been sent. We’ll get back to you as soon as possible.", true);
      } catch (err) {
        const subject = `[NeuroSentio] ${data.get("subject")} – ${data.get("name")}`;
        const body = `Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`;
        show(`Sorry, we couldn’t send that just now. Please email us at ${inbox} or try again.`, false);
        status.insertAdjacentHTML("beforeend", ` <a href="mailto:${inbox}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">Open in your email app</a>`);
      } finally {
        submitBtn.disabled = false;
        submitBtn.firstChild.textContent = label;
      }
    });
  }

  // Scroll reveals: sections fade up as they come into view (skipped for reduced-motion users)
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!calm && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-anim");
    const blocks = ".section-head, .t-head, .tools-copy, .about-copy, .mission-copy, .panel-copy, .approach-copy, .download-box, .contact-card, .faq-group > h2, .legal-content > h2, .faq-cta";
    const media = ".about-media, .panel-media, .life-media, .showcase, .fan, .mission-card";
    const groups = ".why-grid, .tool-cards, .phone-grid, .values-grid, .feature-grid, .t-track, .info-list, .faq-group";
    const targets = [];
    document.querySelectorAll(blocks).forEach((el) => { el.classList.add("reveal"); targets.push(el); });
    document.querySelectorAll(media).forEach((el) => { el.classList.add("reveal", "reveal-zoom"); targets.push(el); });
    document.querySelectorAll(groups).forEach((g) => {
      [...g.children].filter((c) => c.matches("li, details")).forEach((c, i) => {
        c.classList.add("reveal"); c.style.setProperty("--d", Math.min(i, 7) * 90 + "ms"); targets.push(c);
      });
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    targets.forEach((el) => io.observe(el));
  }

  // Footer year
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
