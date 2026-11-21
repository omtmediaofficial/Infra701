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

  // OMT credit and secure lead submission
  const footerBottom = document.querySelector(".footer-bottom");
  if (footerBottom && !footerBottom.querySelector(".omt-credit")) {
    const credit = document.createElement("span");
    credit.className = "omt-credit";
    credit.innerHTML = 'Built with love by <a href="https://www.omtmediaagency.com/" target="_blank" rel="noopener noreferrer">OMT MEDIA</a>';
    footerBottom.append(credit);
  }
  const leadForm = document.querySelector("#lead-form");
  leadForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = document.querySelector("#lead-form-status");
    const submit = leadForm.querySelector('button[type="submit"]');
    const values = new FormData(leadForm);
    if (values.get("company_website")) return;
    if (!leadForm.reportValidity()) return;
    const config = window.INFRA701_SUPABASE;
    const api = window.supabase?.createClient(config?.url || "", config?.anonKey || "");
    if (!api) { status.textContent = "The form is temporarily unavailable. Please call the office."; return; }
    submit.disabled = true; status.textContent = "Sending your inquiry…";
    const payload = { full_name:String(values.get("full_name")||"").trim(), email:String(values.get("email")||"").trim(), phone:String(values.get("phone")||"").trim()||null, service:String(values.get("service")||""), preferred_contact:String(values.get("preferred_contact")||"Either"), message:String(values.get("message")||"").trim(), status:"new", admin_notes:"", source:"website" };
    const { error } = await api.from("lead_submissions").insert(payload);
    submit.disabled = false;
    if (error) { status.textContent = "We couldn’t send this just now. Please call (844) 463-7277."; return; }
    leadForm.reset(); status.textContent = "Thank you — your inquiry has been received. The office will follow up about next steps.";
  });

})();

