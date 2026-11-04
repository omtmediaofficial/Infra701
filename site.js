(() => {
  const root = document.documentElement;
  root.classList.add("js-enabled");

  const nav = document.querySelector("#primary-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const dropdown = document.querySelector(".nav-dropdown");
  const dropdownToggle = document.querySelector(".nav-menu-trigger");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
  }

  function closeDropdown() {
    if (!dropdown || !dropdownToggle) return;
    dropdown.classList.remove("is-open");
    dropdownToggle.setAttribute("aria-expanded", "false");
  }

  navToggle?.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") !== "true";
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    nav?.classList.toggle("is-open", open);
    if (!open) closeDropdown();
  });

  dropdownToggle?.addEventListener("click", () => {
    const open = dropdownToggle.getAttribute("aria-expanded") !== "true";
    dropdownToggle.setAttribute("aria-expanded", String(open));
    dropdown?.classList.toggle("is-open", open);
  });

  document.addEventListener("click", (event) => {
    if (dropdown && !dropdown.contains(event.target)) closeDropdown();
    if (nav && navToggle && !nav.contains(event.target) && !navToggle.contains(event.target)) closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDropdown();
      closeNav();
      navToggle?.focus();
    }
  });

  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    closeDropdown();
    closeNav();
  }));

  const revealItems = [...document.querySelectorAll(".reveal")];
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach((item) => observer.observe(item));
  }
})();

