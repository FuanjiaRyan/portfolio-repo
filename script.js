(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const headerOffset = 76;

    const menuToggle = document.querySelector(".menu-toggle");
    const navPanel = document.querySelector(".nav-panel");
    const navBackdrop = document.querySelector(".nav-backdrop");
    const navLinks = document.querySelectorAll(".nav-links a, .btn-nav");
    const navbar = document.querySelector(".navbar");
    const backToTop = document.querySelector(".back-to-top");
    const yearEl = document.getElementById("current-year");
    const contactForm = document.getElementById("contactForm");
    const formStatus = document.getElementById("formStatus");
    const submitBtn = document.getElementById("submitBtn");
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const lightboxClose = document.querySelector(".lightbox-close");

    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }

    const scrollToHash = (hash) => {
        const target = document.querySelector(hash);
        if (!target) return;
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
    };

    const closeMenu = () => {
        if (!menuToggle || !navPanel) return;
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
        navPanel.classList.remove("is-open");
        navBackdrop.hidden = true;
        document.body.classList.remove("no-scroll");
    };

    const openMenu = () => {
        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute("aria-label", "Close menu");
        navPanel.classList.add("is-open");
        navBackdrop.hidden = false;
        document.body.classList.add("no-scroll");
        const firstLink = navPanel.querySelector("a");
        firstLink?.focus();
    };

    menuToggle?.addEventListener("click", () => {
        const expanded = menuToggle.getAttribute("aria-expanded") === "true";
        if (expanded) closeMenu();
        else openMenu();
    });

    navBackdrop?.addEventListener("click", closeMenu);
    navLinks.forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
            closeLightbox();
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const hash = anchor.getAttribute("href");
            if (!hash || hash === "#") return;
            const target = document.querySelector(hash);
            if (!target) return;
            event.preventDefault();
            closeMenu();
            scrollToHash(hash);
            history.replaceState(null, "", hash);
        });
    });

    const onScroll = () => {
        navbar?.classList.toggle("scrolled", window.scrollY > 12);
        backToTop?.classList.toggle("is-visible", window.scrollY > 420);

        const sections = [...document.querySelectorAll("main section[id]")];
        const scrollPos = window.scrollY + headerOffset + 24;
        let current = sections[0]?.id || "";

        sections.forEach((section) => {
            if (scrollPos >= section.offsetTop) current = section.id;
        });

        document.querySelectorAll(".nav-links a").forEach((link) => {
            const isActive = link.getAttribute("href") === `#${current}`;
            link.classList.toggle("active", isActive);
            if (isActive) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
        });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    backToTop?.addEventListener("click", (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
        history.replaceState(null, "", "#home");
    });

    document.querySelectorAll(".filter-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;
            document.querySelectorAll(".filter-btn").forEach((btn) => {
                btn.classList.toggle("is-active", btn === button);
            });
            document.querySelectorAll(".project-card").forEach((card) => {
                const match = filter === "all" || card.dataset.category === filter;
                card.classList.toggle("is-hidden", !match);
            });
        });
    });

    document.querySelectorAll("[data-copy]").forEach((button) => {
        button.addEventListener("click", async () => {
            const value = button.getAttribute("data-copy");
            try {
                await navigator.clipboard.writeText(value);
                const original = button.textContent;
                button.textContent = "Copied";
                button.classList.add("is-copied");
                setTimeout(() => {
                    button.textContent = original;
                    button.classList.remove("is-copied");
                }, 1600);
            } catch {
                button.textContent = "Copy failed";
            }
        });
    });

    const showFieldError = (field, message) => {
        const group = field.closest(".form-group");
        const error = group?.querySelector(".field-error");
        group?.classList.add("is-invalid");
        if (error) {
            error.hidden = false;
            error.textContent = message;
        }
        field.setAttribute("aria-invalid", "true");
    };

    const clearFieldError = (field) => {
        const group = field.closest(".form-group");
        const error = group?.querySelector(".field-error");
        group?.classList.remove("is-invalid");
        if (error) {
            error.hidden = true;
            error.textContent = "";
        }
        field.removeAttribute("aria-invalid");
    };

    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    contactForm?.querySelectorAll("input, textarea").forEach((field) => {
        field.addEventListener("input", () => clearFieldError(field));
    });

    const showFormStatus = (message, type) => {
        formStatus.hidden = false;
        formStatus.textContent = message;
        formStatus.classList.remove("is-success", "is-error");
        formStatus.classList.add(type === "success" ? "is-success" : "is-error");
    };

    contactForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        if (submitBtn.disabled) return;

        const name = contactForm.name;
        const email = contactForm.email;
        const subject = contactForm.subject;
        const message = contactForm.message;
        let valid = true;

        [name, email, subject, message].forEach(clearFieldError);

        if (name.value.trim().length < 2) {
            showFieldError(name, "Please enter your name.");
            valid = false;
        }
        if (!validateEmail(email.value.trim())) {
            showFieldError(email, "Please enter a valid email address.");
            valid = false;
        }
        if (subject.value.trim().length < 3) {
            showFieldError(subject, "Please add a short subject.");
            valid = false;
        }
        if (message.value.trim().length < 10) {
            showFieldError(message, "Please write a message of at least 10 characters.");
            valid = false;
        }

        if (!valid) {
            showFormStatus("Please fix the highlighted fields.", "error");
            contactForm.querySelector(".is-invalid input, .is-invalid textarea")?.focus();
            return;
        }

        const body = [
            message.value.trim(),
            "",
            `From: ${name.value.trim()}`,
            `Email: ${email.value.trim()}`
        ].join("\n");

        const mailto = `mailto:fuanjiaakemfua@gmail.com?subject=${encodeURIComponent(subject.value.trim())}&body=${encodeURIComponent(body)}`;

        submitBtn.disabled = true;
        submitBtn.textContent = "Opening email...";
        showFormStatus("Your email app should open with this message. If it doesn't, email me directly at fuanjiaakemfua@gmail.com.", "success");
        window.location.href = mailto;

        window.setTimeout(() => {
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = "Send message";
        }, 1200);
    });

    const openLightbox = (src, caption, alt) => {
        lightboxImage.src = src;
        lightboxImage.alt = alt || caption || "";
        lightboxCaption.textContent = caption || "";
        lightbox.hidden = false;
        document.body.classList.add("no-scroll");
        lightboxClose.focus();
    };

    const closeLightbox = () => {
        if (!lightbox || lightbox.hidden) return;
        lightbox.hidden = true;
        lightboxImage.src = "";
        document.body.classList.remove("no-scroll");
    };

    document.querySelectorAll("[data-lightbox]").forEach((button) => {
        button.addEventListener("click", () => {
            openLightbox(
                button.getAttribute("data-lightbox"),
                button.getAttribute("data-caption"),
                button.querySelector("img")?.alt
            );
        });
    });

    lightboxClose?.addEventListener("click", closeLightbox);
    lightbox?.addEventListener("click", (event) => {
        if (event.target === lightbox) closeLightbox();
    });

    if (!prefersReducedMotion && "IntersectionObserver" in window) {
        const revealTargets = document.querySelectorAll(
            ".hero-copy, .hero-portrait, .about-intro, .info-card, .skill-group, .project-card, .achievement-card, .contact-info, .contact-form"
        );
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("reveal");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

        revealTargets.forEach((el) => observer.observe(el));
    }
})();
