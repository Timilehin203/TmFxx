/* =========================================================
   TIMIFXX MARKETING
   Telegram Ads Marketing Website
   Main JavaScript
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       SMOOTH SCROLLING
       ===================================================== */

    const internalLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    internalLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId =
                link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }

            const target =
                document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            const navbar =
                document.querySelector(".navbar");

            const navbarHeight =
                navbar
                    ? navbar.offsetHeight
                    : 0;

            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                navbarHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

        });

    });


    /* =====================================================
       NAVBAR SCROLL EFFECT
       ===================================================== */

    const navbar =
        document.querySelector(".navbar");

    function updateNavbar() {

        if (!navbar) {
            return;
        }

        if (window.scrollY > 30) {

            navbar.style.background =
                "rgba(3, 9, 18, 0.95)";

            navbar.style.boxShadow =
                "0 10px 40px rgba(0, 0, 0, 0.22)";

        } else {

            navbar.style.background =
                "rgba(5, 11, 22, 0.82)";

            navbar.style.boxShadow =
                "none";
        }

    }

    window.addEventListener(
        "scroll",
        updateNavbar,
        {
            passive: true
        }
    );

    updateNavbar();


    /* =====================================================
       ACTIVE NAVIGATION
       ===================================================== */

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );

    const navLinks =
        document.querySelectorAll(
            '.nav-menu a[href^="#"]'
        );

    function updateActiveNavigation() {

        if (
            !sections.length ||
            !navLinks.length
        ) {
            return;
        }

        const scrollPosition =
            window.scrollY +
            window.innerHeight * 0.35;

        let currentSection = "";

        sections.forEach((section) => {

            const top =
                section.offsetTop;

            const bottom =
                top + section.offsetHeight;

            if (
                scrollPosition >= top &&
                scrollPosition < bottom
            ) {
                currentSection =
                    section.id;
            }

        });

        navLinks.forEach((link) => {

            const target =
                link.getAttribute("href");

            link.classList.remove("active");

            if (
                currentSection &&
                target ===
                    `#${currentSection}`
            ) {
                link.classList.add("active");
            }

        });

    }

    window.addEventListener(
        "scroll",
        updateActiveNavigation,
        {
            passive: true
        }
    );

    updateActiveNavigation();


    /* =====================================================
       SCROLL REVEAL
       ===================================================== */

    const revealElements =
        document.querySelectorAll(
            ".service-card, " +
            ".feature, " +
            ".about-card, " +
            ".contact-box"
        );

    if (
        "IntersectionObserver" in window
    ) {

        const observer =
            new IntersectionObserver(
                (entries, observerInstance) => {

                    entries.forEach((entry) => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }

                        entry.target.classList.add(
                            "visible"
                        );

                        observerInstance.unobserve(
                            entry.target
                        );

                    });

                },
                {
                    threshold: 0.12
                }
            );

        revealElements.forEach((element) => {

            element.classList.add(
                "scroll-reveal"
            );

            observer.observe(element);

        });

    } else {

        revealElements.forEach((element) => {

            element.classList.add(
                "visible"
            );

        });

    }


    /* =====================================================
       TELEGRAM BUTTON FEEDBACK
       ===================================================== */

    const telegramLinks =
        document.querySelectorAll(
            'a[href*="t.me/timifxx203"]'
        );

    telegramLinks.forEach((link) => {

        link.addEventListener("click", () => {

            try {

                sessionStorage.setItem(
                    "lastTelegramVisit",
                    new Date().toISOString()
                );

            } catch (error) {

                console.log(
                    "Session storage unavailable."
                );

            }

        });

    });


    /* =====================================================
       BUTTON RIPPLE
       ===================================================== */

    const buttons =
        document.querySelectorAll(
            ".primary-button, " +
            ".secondary-button, " +
            ".service-button, " +
            ".contact-button, " +
            ".nav-button, " +
            ".card-button"
        );

    buttons.forEach((button) => {

        button.addEventListener(
            "pointerdown",
            (event) => {

                const ripple =
                    document.createElement("span");

                ripple.className =
                    "button-ripple";

                const rect =
                    button.getBoundingClientRect();

                const size =
                    Math.max(
                        rect.width,
                        rect.height
                    );

                ripple.style.width =
                    `${size}px`;

                ripple.style.height =
                    `${size}px`;

                ripple.style.left =
                    `${event.clientX - rect.left - size / 2}px`;

                ripple.style.top =
                    `${event.clientY - rect.top - size / 2}px`;

                button.appendChild(ripple);

                window.setTimeout(() => {

                    ripple.remove();

                }, 600);

            }
        );

    });


    /* =====================================================
       CURRENT YEAR
       ===================================================== */

    const yearElements =
        document.querySelectorAll(
            "[data-current-year]"
        );

    yearElements.forEach((element) => {

        element.textContent =
            new Date().getFullYear();

    });


    /* =====================================================
       PAGE LOADED
       ===================================================== */

    document.body.classList.add(
        "page-loaded"
    );


    /* =====================================================
       BRAND CONSOLE MESSAGE
       ===================================================== */

    console.log(
        "%c TimiFxx Marketing ",
        "background:#229ed9;" +
        "color:#ffffff;" +
        "padding:8px 12px;" +
        "border-radius:6px;" +
        "font-weight:bold;"
    );

    console.log(
        "Telegram Ads Marketing Website"
    );

});
