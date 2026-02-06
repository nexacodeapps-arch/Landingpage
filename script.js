/* =========================================================
  Cozinha do Chef — JS (sem frameworks)
  - Smooth scroll
  - Navbar blur/shadow sichtbar ao rolar
  - IntersectionObserver (reveal)
  - CTA microinteração
  - FAQ accordion
  - Form validation (nome 2 palavras, email válido, WhatsApp opcional)
========================================================= */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Footer year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Navbar scroll state
  const topbar = $("#topbar");
  const setTopbarState = () => {
    if (!topbar) return;
    const scrolled = window.scrollY > 8;
    topbar.classList.toggle("is-scrolled", scrolled);
  };
  setTopbarState();
  window.addEventListener("scroll", setTopbarState, { passive: true });

  // Mobile menu
  const menuBtn = $("#menuBtn");
  const mobileMenu = $("#mobileMenu");
  const toggleMenu = (open) => {
    if (!menuBtn || !mobileMenu) return;
    const willOpen =
      typeof open === "boolean" ? open : mobileMenu.hasAttribute("hidden");
    menuBtn.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) mobileMenu.removeAttribute("hidden");
    else mobileMenu.setAttribute("hidden", "");
  };

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => toggleMenu());
    // Close menu when clicking a link
    $$(".mobile-link", mobileMenu).forEach((a) => {
      a.addEventListener("click", () => toggleMenu(false));
    });
  }

  // Smooth scroll (for anchor links and data-scrollto buttons)
  const headerOffset = () => {
    // sticky header height dynamic
    const h = topbar ? topbar.getBoundingClientRect().height : 0;
    return Math.round(h + 10);
  };

  const smoothScrollTo = (targetSelector) => {
    const target = $(targetSelector);
    if (!target) return;

    const y =
      window.scrollY + target.getBoundingClientRect().top - headerOffset();
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // Anchor links
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = $(href);
      if (!target) return;

      e.preventDefault();
      smoothScrollTo(href);

      // Close mobile menu if open
      if (mobileMenu && !mobileMenu.hasAttribute("hidden")) toggleMenu(false);
    });
  });

  // Buttons with data-scrollto
  $$("[data-scrollto]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const to = btn.getAttribute("data-scrollto");
      if (to) smoothScrollTo(to);
    });
  });

  // CTA microinteractions (press)
  const pressable = $$(".btn--cta");
  const pressOn = (el) => el.classList.add("is-pressed");
  const pressOff = (el) => el.classList.remove("is-pressed");

  pressable.forEach((btn) => {
    btn.addEventListener("pointerdown", () => pressOn(btn));
    btn.addEventListener("pointerup", () => pressOff(btn));
    btn.addEventListener("pointercancel", () => pressOff(btn));
    btn.addEventListener("mouseleave", () => pressOff(btn));
  });

  // Reveal on scroll
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    // fallback
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // FAQ accordion
  const faqItems = $$(".faq__item");
  faqItems.forEach((item) => {
    const q = $(".faq__q", item);
    const a = $(".faq__a", item);
    const icon = $(".faq__icon", item);

    if (!q || !a) return;

    const close = () => {
      q.setAttribute("aria-expanded", "false");
      a.setAttribute("hidden", "");
      if (icon) icon.textContent = "+";
    };

    const open = () => {
      q.setAttribute("aria-expanded", "true");
      a.removeAttribute("hidden");
      if (icon) icon.textContent = "–";
    };

    close();

    q.addEventListener("click", () => {
      const expanded = q.getAttribute("aria-expanded") === "true";

      // fecha os outros (comportamento mais “CRO-friendly”)
      faqItems.forEach((other) => {
        if (other === item) return;
        const oq = $(".faq__q", other);
        const oa = $(".faq__a", other);
        const oi = $(".faq__icon", other);
        if (oq && oa) {
          oq.setAttribute("aria-expanded", "false");
          oa.setAttribute("hidden", "");
          if (oi) oi.textContent = "+";
        }
      });

      expanded ? close() : open();
    });
  });

  // Buy button (simulado)
  const buyBtn = $("#buyBtn");
  if (buyBtn) {
    buyBtn.addEventListener("click", () => {
      // Em produção: redirecionar para checkout
      alert(
        "Compra simulada. Integre este botão ao seu checkout (Hotmart/Mercado Pago/Stripe etc.).",
      );
    });
  }

  // Form validation
  const form = $("#leadForm");
  const nome = $("#nome");
  const email = $("#email");
  const whats = $("#whats");
  const consent = $("#consent");

  const errNome = $("#errNome");
  const errEmail = $("#errEmail");
  const errWhats = $("#errWhats");
  const errConsent = $("#errConsent");
  const successBox = $("#formSuccess");

  const setError = (el, msg) => {
    if (el) el.textContent = msg || "";
  };

  const isEmailValid = (value) => {
    // Simples e eficiente (sem exagero)
    const v = String(value || "").trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  };

  const hasTwoWords = (value) => {
    const v = String(value || "")
      .trim()
      .replace(/\s+/g, " ");
    const parts = v.split(" ").filter(Boolean);
    // mínimo 2 palavras com 2+ caracteres cada (evita "A B")
    if (parts.length < 2) return false;
    return parts[0].length >= 2 && parts[1].length >= 2;
  };

  const isWhatsValidIfProvided = (value) => {
    const v = String(value || "").trim();
    if (!v) return true; // opcional
    // mantém dígitos; aceita +55, parênteses, hífen e espaço
    const digits = v.replace(/\D/g, "");
    // Brasil: 10 ou 11 dígitos (DDD + número) e também pode vir com 55 (12/13)
    return (
      digits.length === 10 ||
      digits.length === 11 ||
      digits.length === 12 ||
      digits.length === 13
    );
  };

  const resetStatus = () => {
    setError(errNome, "");
    setError(errEmail, "");
    setError(errWhats, "");
    setError(errConsent, "");
    if (successBox) successBox.setAttribute("hidden", "");
  };

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      resetStatus();

      let ok = true;

      const nomeVal = nome ? nome.value : "";
      const emailVal = email ? email.value : "";
      const whatsVal = whats ? whats.value : "";
      const consentVal = consent ? consent.checked : false;

      if (!hasTwoWords(nomeVal)) {
        ok = false;
        setError(errNome, "Digite seu nome completo (pelo menos 2 palavras).");
        if (nome) nome.focus();
      }

      if (!isEmailValid(emailVal)) {
        ok = false;
        setError(errEmail, "Digite um email válido (ex.: voce@exemplo.com).");
        if (ok === false && email && document.activeElement !== nome)
          email.focus();
      }

      if (!isWhatsValidIfProvided(whatsVal)) {
        ok = false;
        setError(
          errWhats,
          "WhatsApp inválido. Use DDD + número (ex.: 11999999999).",
        );
      }

      if (!consentVal) {
        ok = false;
        setError(errConsent, "Para continuar, marque o consentimento (LGPD).");
      }

      if (!ok) return;

      // Simulação de sucesso (em produção: enviar ao backend/CRM)
      if (successBox) {
        successBox.removeAttribute("hidden");
        // limpa campos (opcional)
        form.reset();
      }
    });
  }
})();
