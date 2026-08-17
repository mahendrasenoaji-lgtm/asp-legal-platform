/* ASP prototype behaviour. No dependencies, no tracking, no storage. */
(function () {
  "use strict";

  document.documentElement.classList.add("is-ready");

  /* ---- Mobile drawer ---------------------------------------------------- */
  var toggle = document.querySelector("[data-menu-toggle]");
  var drawer = document.querySelector("[data-drawer]");
  if (toggle && drawer) {
    var lastFocus = null;
    var setOpen = function (open) {
      drawer.dataset.open = open ? "true" : "false";
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
      document.body.style.overflow = open ? "hidden" : "";
      if (open) { lastFocus = document.activeElement; var f = drawer.querySelector("a, button"); if (f) f.focus(); }
      else if (lastFocus) { lastFocus.focus(); }
    };
    setOpen(false);
    toggle.addEventListener("click", function () { setOpen(drawer.dataset.open !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.dataset.open === "true") setOpen(false);
    });
  }

  /* ---- Scroll reveal ---------------------------------------------------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = document.querySelectorAll("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---- Filter chips ----------------------------------------------------- */
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var key = group.dataset.filterGroup;
    var items = document.querySelectorAll("[data-filterable='" + key + "']");
    var count = document.querySelector("[data-filter-count='" + key + "']");
    group.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      group.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      var value = chip.dataset.value;
      var shown = 0;
      items.forEach(function (item) {
        var match = value === "all" || (item.dataset.tags || "").split(" ").indexOf(value) > -1;
        item.hidden = !match;
        if (match) shown++;
      });
      if (count) count.textContent = shown + (shown === 1 ? " result" : " results");
    });
  });

  /* ---- Intake form (client-side only; no submission in the prototype) ---- */
  var form = document.querySelector("[data-intake]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (input) {
        var field = input.closest(".field");
        var err = field.querySelector(".field__error");
        var valid = input.checkValidity() && String(input.value).trim() !== "";
        field.classList.toggle("field--error", !valid);
        if (err) err.textContent = valid ? "" : (input.dataset.error || "This field is required.");
        input.setAttribute("aria-invalid", valid ? "false" : "true");
        if (!valid && ok) { input.focus(); ok = false; }
      });
      var note = form.querySelector("[data-intake-note]");
      if (note) {
        note.textContent = ok
          ? "Prototype only — no data was sent. Wiring the endpoint is Phase 4."
          : "Check the highlighted fields.";
        note.hidden = false;
      }
    });
  }

  /* ---- Footer year ------------------------------------------------------ */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
