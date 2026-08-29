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
    const progress = document.querySelector(".scroll-progress");
    const pointerGlow = document.querySelector(".pointer-glow");
    let progressTarget = 0;

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

        if (progress) {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progressTarget = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        }

        updateNavIndicator();

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
                if (match && !prefersReducedMotion) {
                    card.classList.remove("is-filtering");
                    void card.offsetWidth;
                    card.classList.add("is-filtering");
                }
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

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const cursor = document.querySelector(".cursor");
    const cursorDot = document.querySelector(".cursor-dot");
    const cursorRing = document.querySelector(".cursor-ring");
    const indicator = document.querySelector(".nav-indicator");
    const intro = document.querySelector(".page-intro");

    let progressCurrent = 0;
    let glowX = -400;
    let glowY = -400;
    let glowTX = -400;
    let glowTY = -400;
    let cursorX = 0;
    let cursorY = 0;
    let ringX = 0;
    let ringY = 0;

    const updateNavIndicator = () => {
        if (!indicator || window.innerWidth <= 768) return;
        const wrap = document.querySelector(".nav-links-wrap");
        const active = document.querySelector(".nav-links a.active") || document.querySelector(".nav-links a");
        if (!wrap || !active) return;
        const wrapBox = wrap.getBoundingClientRect();
        const box = active.getBoundingClientRect();
        indicator.style.width = `${box.width}px`;
        indicator.style.transform = `translateX(${box.left - wrapBox.left}px)`;
    };

    const splitTitle = () => {
        const title = document.querySelector(".hero-title");
        if (!title) return;
        const lines = ["Fuanjia", "Akemfua Ryan"];
        title.innerHTML = lines.map((line, lineIndex) => {
            const chars = [...line].map((char, index) => {
                const delay = index + lineIndex * 8;
                const glyph = char === " " ? "&nbsp;" : char;
                return `<span class="split-char" style="--i:${delay}">${glyph}</span>`;
            }).join("");
            return `<span class="split-line${lineIndex === 1 ? " is-muted" : ""}">${chars}</span>`;
        }).join("");
    };

    const splitWords = () => {
        document.querySelectorAll(".js-words").forEach((el) => {
            const words = el.textContent.trim().split(/\s+/);
            el.innerHTML = words.map((word, index) => (
                `<span class="split-word" style="--i:${index}">${word}</span>`
            )).join(" ");
        });
    };

    const animateCount = (el) => {
        const target = Number(el.dataset.count);
        if (Number.isNaN(target)) return;
        const start = performance.now();
        const duration = 1400;
        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = String(Math.round(target * eased));
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    const enableMagnetic = () => {
        document.querySelectorAll(".btn").forEach((btn) => {
            btn.addEventListener("pointermove", (event) => {
                const rect = btn.getBoundingClientRect();
                const x = event.clientX - rect.left - rect.width / 2;
                const y = event.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.22}px, ${y * 0.28}px)`;
            });
            btn.addEventListener("pointerleave", () => {
                btn.style.transform = "";
            });
            btn.addEventListener("click", (event) => {
                const rect = btn.getBoundingClientRect();
                const ripple = document.createElement("span");
                ripple.className = "ripple";
                ripple.style.left = `${event.clientX - rect.left}px`;
                ripple.style.top = `${event.clientY - rect.top}px`;
                btn.appendChild(ripple);
                window.setTimeout(() => ripple.remove(), 650);
            });
        });
    };

    const enableTilt = () => {
        document.querySelectorAll("[data-tilt], [data-tilt-soft]").forEach((el) => {
            const strength = el.hasAttribute("data-tilt-soft") ? 6 : 9;
            el.addEventListener("pointermove", (event) => {
                const rect = el.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;
                const rx = (0.5 - y) * strength;
                const ry = (x - 0.5) * strength;
                el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
            });
            el.addEventListener("pointerleave", () => {
                el.style.transform = "";
            });
        });
    };

    const loop = () => {
        progressCurrent += (progressTarget - progressCurrent) * 0.12;
        if (progress) {
            progress.style.transform = `scaleX(${progressCurrent})`;
        }
        if (pointerGlow && finePointer) {
            glowX += (glowTX - glowX) * 0.1;
            glowY += (glowTY - glowY) * 0.1;
            pointerGlow.style.transform = `translate(${glowX}px, ${glowY}px)`;
        }
        if (cursorDot && cursorRing && finePointer) {
            ringX += (cursorX - ringX) * 0.16;
            ringY += (cursorY - ringY) * 0.16;
            cursorDot.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
            cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)${document.body.classList.contains("is-hovering") ? " scale(1.7)" : ""}`;
        }
        requestAnimationFrame(loop);
    };

    if (!prefersReducedMotion) {
        splitTitle();
        splitWords();
        if (finePointer) {
            document.body.classList.add("has-cursor");
            enableMagnetic();
            enableTilt();
        }
        const skipIntro = window.innerWidth <= 768;
        if (skipIntro) {
            document.body.classList.add("is-loaded");
            intro?.remove();
        } else {
            window.setTimeout(() => {
                document.body.classList.add("is-loaded");
                intro?.remove();
            }, 1900);
        }
        requestAnimationFrame(loop);
    } else {
        document.querySelectorAll("[data-count]").forEach((el) => {
            el.textContent = el.dataset.count;
        });
        document.body.classList.add("is-loaded");
        intro?.remove();
    }

    if (!prefersReducedMotion && finePointer) {
        window.addEventListener("pointermove", (event) => {
            glowTX = event.clientX - 230;
            glowTY = event.clientY - 230;
            cursorX = event.clientX;
            cursorY = event.clientY;
            const hoverable = event.target.closest("a, button, .certificate-thumb, .filter-btn");
            document.body.classList.toggle("is-hovering", Boolean(hoverable));
        }, { passive: true });
        document.addEventListener("mouseleave", () => cursor?.style.setProperty("opacity", "0"));
        document.addEventListener("mouseenter", () => cursor?.style.setProperty("opacity", "1"));
    }

    if (!prefersReducedMotion && "IntersectionObserver" in window) {
        document.querySelectorAll(".section-header").forEach((el) => {
            el.dataset.reveal = "up";
        });
        document.querySelectorAll(".about-intro").forEach((el) => {
            el.dataset.reveal = "left";
        });
        document.querySelectorAll(".contact-item").forEach((el, index) => {
            el.dataset.reveal = "left";
            el.style.setProperty("--d", `${index * 70}ms`);
        });
        document.querySelectorAll(".info-card").forEach((el, index) => {
            el.dataset.reveal = index % 2 === 0 ? "right" : "up";
        });
        document.querySelectorAll(".contact-form").forEach((el) => {
            el.dataset.reveal = "right";
        });
        document.querySelectorAll(".skill-group").forEach((el, index) => {
            el.dataset.reveal = index % 2 === 0 ? "left" : "right";
            el.style.setProperty("--d", `${index * 80}ms`);
        });
        document.querySelectorAll(".project-card").forEach((el, index) => {
            el.dataset.reveal = index % 2 === 0 ? "left" : "right";
            el.style.setProperty("--d", `${(index % 2) * 80}ms`);
        });
        document.querySelectorAll(".achievement-card").forEach((el, index) => {
            el.dataset.reveal = index % 2 === 0 ? "left" : "right";
        });
        document.querySelectorAll(".stat-strip article").forEach((el, index) => {
            el.dataset.reveal = "up";
            el.style.setProperty("--d", `${index * 90}ms`);
        });
        document.querySelectorAll(".social-links a").forEach((el, index) => {
            el.dataset.reveal = "up";
            el.style.setProperty("--d", `${index * 70}ms`);
        });

        const revealTargets = document.querySelectorAll("[data-reveal]");
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-in");
                    entry.target.querySelectorAll("[data-count]").forEach(animateCount);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

        revealTargets.forEach((el) => observer.observe(el));
    }

    window.addEventListener("resize", updateNavIndicator);
    onScroll();
})();
