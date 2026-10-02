
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