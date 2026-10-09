

/* NARA: Close other dropdowns when one is opened */
/* NARA: Sync dropdown state and close other dropdowns */
document.querySelectorAll(".main-nav .nav-dropdown").forEach((dropdown) => {
    const summary = dropdown.querySelector(":scope > summary");

    if (!summary) return;

    summary.setAttribute("aria-expanded", String(dropdown.open));

    dropdown.addEventListener("toggle", () => {
        summary.setAttribute("aria-expanded", String(dropdown.open));

        if (!dropdown.open) return;

        document.querySelectorAll(".main-nav .nav-dropdown").forEach((other) => {
            if (other !== dropdown) {
                other.open = false;
            }
        });
    });
});

/* Close dropdowns when clicking outside the navigation */
document.addEventListener("click", (event) => {
    if (event.target.closest(".main-nav")) return;

    document
        .querySelectorAll(".main-nav .nav-dropdown")
        .forEach((dropdown) => {
            dropdown.open = false;
        });
});

/* Close dropdowns with the Escape key */
document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    document
        .querySelectorAll(".main-nav .nav-dropdown")
        .forEach((dropdown) => {
            dropdown.open = false;
        });
});

/* NARA — Responsive navigation toggle */
document.querySelectorAll(".site-header").forEach((header) => {
    const toggle = header.querySelector(".mobile-menu-toggle");
    const nav = header.querySelector("#main-navigation");

    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";

        toggle.setAttribute("aria-expanded", String(!isOpen));
        toggle.setAttribute(
            "aria-label",
            isOpen ? "Open navigation menu" : "Close navigation menu"
        );

        nav.classList.toggle("is-open", !isOpen);
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Open navigation menu");
            nav.classList.remove("is-open");
        });
    });
});


/* =========================================
   NARA — HOME PAGE ANIMATIONS
   Only runs on the Home page
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const homePage = document.querySelector(".home-page");

    // Do not affect Blog, Products, or Company pages.
    if (!homePage) return;

    // Respect the user's reduced-motion preference.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    // Elements that appear as the visitor scrolls.
    const animatedElements = [
        ".intro-text",
        ".feature-card",
        ".section-heading",
        ".product-card",
        ".quality-image",
        ".quality-content",
        ".packaging-image",
        ".packaging-content",
        ".oem-content",
        ".oem-image",
        ".export-image",
        ".export-content",
        ".quote-box"
    ];

    const elements = homePage.querySelectorAll(
        animatedElements.join(", ")
    );

    elements.forEach((element) => {
        element.classList.add("home-reveal");
    });

    // Reveal elements when they enter the viewport.
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries, currentObserver) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("is-visible");
                    currentObserver.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        elements.forEach((element) => {
            observer.observe(element);
        });
    } else {
        elements.forEach((element) => {
            element.classList.add("is-visible");
        });
    }

    // Animate the Hero when the page opens.
    const hero = homePage.querySelector(".hero");
    if (hero) {
        hero.classList.add("home-hero-ready");
    }

    // Add a subtle stagger to the feature and product cards.
    [".feature-card", ".product-card"].forEach((selector) => {
        homePage.querySelectorAll(selector).forEach((card, index) => {
            card.style.setProperty(
                "--reveal-delay",
                `${(index % 4) * 120}ms`
            );
        });
    });
});