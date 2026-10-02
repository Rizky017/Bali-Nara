
/* NARA: Close other dropdowns when one is opened */
document.querySelectorAll(".main-nav .nav-dropdown").forEach((dropdown) => {
    dropdown.addEventListener("toggle", () => {
        if (!dropdown.open) return;

        document
            .querySelectorAll(".main-nav .nav-dropdown")
            .forEach((otherDropdown) => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.open = false;
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