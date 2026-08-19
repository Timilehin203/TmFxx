/* =========================================================
   TIMIFXX MARKETING
   Telegram Ads Marketing Website
   Main JavaScript
   Version: 2.0.0
   ========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE_URL =
    "https://tmfxx-production.up.railway.app";


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       LOAD SERVICES FROM RAILWAY
    ===================================================== */

    loadServices();


    /* =====================================================
       SMOOTH SCROLLING
    ===================================================== */

    initializeSmoothScrolling();


    /* =====================================================
       NAVBAR
    ===================================================== */

    initializeNavbar();


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    initializeActiveNavigation();


    /* =====================================================
       GENERAL SCROLL REVEAL
    ===================================================== */

    initializeGeneralReveal();


    /* =====================================================
       TELEGRAM TRACKING
    ===================================================== */

    initializeTelegramTracking();


    /* =====================================================
       BUTTON RIPPLE
    ===================================================== */

    initializeButtonRipples();


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    initializeCurrentYear();


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


/* =========================================================
   LOAD SERVICES
========================================================= */

async function loadServices() {

    const servicesGrid =
        document.querySelector(
            ".services-grid"
        );


    if (!servicesGrid) {

        console.warn(
            "Services grid was not found."
        );

        return;

    }


    try {

        console.log(
            "Loading services from Railway..."
        );


        const response =
            await fetch(
                `${API_BASE_URL}/api/services`,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Services request failed with status ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            !data ||
            data.success !== true ||
            !Array.isArray(data.services)
        ) {

            throw new Error(
                "Invalid services response from API."
            );

        }


        /*
         Only display active services.
        */

        const activeServices =
            data.services.filter(
                service =>
                    service.active === true
            );


        console.log(
            `Services loaded successfully: ${data.services.length}`
        );


        console.log(
            `Active services displayed: ${activeServices.length}`
        );


        renderServices(
            activeServices
        );


    } catch (error) {

        console.error(
            "Unable to load services:",
            error
        );


        /*
         Do not destroy the existing HTML
         if the Railway API is temporarily unavailable.
        */

        console.warn(
            "Using the services already present in index.html."
        );

    }

}


/* =========================================================
   RENDER SERVICES
========================================================= */

function renderServices(
    services
) {

    const servicesGrid =
        document.querySelector(
            ".services-grid"
        );


    if (!servicesGrid) {

        return;

    }


    if (!services.length) {

        servicesGrid.innerHTML = `
            <div class="services-empty">
                <p>
                    No services are currently available.
                </p>
            </div>
        `;

        return;

    }


    /*
     Convert database services into
     website service cards.
    */

    servicesGrid.innerHTML =
        services
            .map(
                (service, index) => {

                    return createServiceCard(
                        service,
                        index
                    );

                }
            )
            .join("");


    /*
     Re-enable scroll reveal for
     newly created service cards.
    */

    initializeServiceReveal();


    /*
     Re-enable Telegram tracking.
    */

    initializeTelegramTracking();


    /*
     Re-enable button ripple effects.
    */

    initializeButtonRipples();

}


/* =========================================================
   CREATE SERVICE CARD
========================================================= */

function createServiceCard(
    service,
    index
) {

    const id =
        service.id;


    const name =
        service.name ||
        service.title ||
        "Telegram Service";


    const description =
        service.description ||
        "Telegram advertising solution ready for your needs.";


    /*
     Convert database price into
     a clean two-decimal format.
    */

    const numericPrice =
        Number(
            service.price || 0
        );


    const price =
        Number.isFinite(
            numericPrice
        )
            ? numericPrice.toFixed(2)
            : "0.00";


    const icon =
        service.icon ||
        getServiceIcon(name);


    /*
     First active service is featured
     unless the database explicitly
     provides a popular flag.
    */

    const isPopular =
        Boolean(
            service.is_popular ||
            service.popular ||
            index === 0
        );


    /*
     Telegram order message uses
     the CURRENT database price.
    */

    const orderMessage =
        encodeURIComponent(
            `Hello TimiFxx Marketing 👋

I'd like to order your ${name} ($${price}).

I'm contacting you from your website and would like to proceed with the order.`
        );


    const telegramUrl =
        `https://t.me/timifxx203?text=${orderMessage}`;


    return `

        <article
            class="service-card ${isPopular ? "featured" : ""}"
            data-service-id="${escapeHtml(id)}"
        >

            <div class="service-top">

                <div class="service-icon">
                    ${escapeHtml(icon)}
                </div>

                ${
                    isPopular
                        ? `
                            <span class="popular-badge">
                                POPULAR
                            </span>
                          `
                        : ""
                }

            </div>


            <h3>
                ${escapeHtml(name)}
            </h3>


            <p>
                ${escapeHtml(description)}
            </p>


            <div class="service-price">

                <span class="currency">
                    $
                </span>

                <span class="amount">
                    ${escapeHtml(price)}
                </span>

            </div>


            <ul>

                <li>
                    <span>✓</span>
                    Already approved
                </li>

                <li>
                    <span>✓</span>
                    Ready for advertising
                </li>

                <li>
                    <span>✓</span>
                    Direct Telegram ordering
                </li>

            </ul>


            <a
                href="${telegramUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="service-button"
            >

                Order on Telegram

                <span>
                    →
                </span>

            </a>

        </article>

    `;

}


/* =========================================================
   SERVICE ICON HELPER
========================================================= */

function getServiceIcon(
    name
) {

    const serviceName =
        String(name)
            .toLowerCase();


    if (
        serviceName.includes(
            "channel"
        )
    ) {

        return "📢";

    }


    if (
        serviceName.includes(
            "bot"
        )
    ) {

        return "🤖";

    }


    if (
        serviceName.includes(
            "miniapp"
        ) ||
        serviceName.includes(
            "mini app"
        )
    ) {

        return "📱";

    }


    if (
        serviceName.includes(
            "ads"
        ) ||
        serviceName.includes(
            "advert"
        )
    ) {

        return "📣";

    }


    return "🚀";

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   SMOOTH SCROLLING
========================================================= */

function initializeSmoothScrolling() {

    const internalLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    internalLinks.forEach(
        (link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {

                        return;

                    }


                    event.preventDefault();


                    const navbar =
                        document.querySelector(
                            ".navbar"
                        );


                    const navbarHeight =
                        navbar
                            ? navbar.offsetHeight
                            : 0;


                    const targetPosition =
                        target
                            .getBoundingClientRect()
                            .top +
                        window.scrollY -
                        navbarHeight;


                    window.scrollTo({

                        top:
                            targetPosition,

                        behavior:
                            "smooth"

                    });

                }
            );

        }
    );

}


/* =========================================================
   NAVBAR SCROLL EFFECT
========================================================= */

function initializeNavbar() {

    const navbar =
        document.querySelector(
            ".navbar"
        );


    if (!navbar) {

        return;

    }


    function updateNavbar() {

        if (
            window.scrollY > 30
        ) {

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

}


/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

function initializeActiveNavigation() {

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );


    const navLinks =
        document.querySelectorAll(
            '.nav-menu a[href^="#"]'
        );


    if (
        !sections.length ||
        !navLinks.length
    ) {

        return;

    }


    function updateActiveNavigation() {

        const scrollPosition =
            window.scrollY +
            window.innerHeight * 0.35;


        let currentSection = "";


        sections.forEach(
            (section) => {

                const top =
                    section.offsetTop;


                const bottom =
                    top +
                    section.offsetHeight;


                if (
                    scrollPosition >= top &&
                    scrollPosition < bottom
                ) {

                    currentSection =
                        section.id;

                }

            }
        );


        navLinks.forEach(
            (link) => {

                const target =
                    link.getAttribute(
                        "href"
                    );


                link.classList.remove(
                    "active"
                );


                if (
                    currentSection &&
                    target ===
                        `#${currentSection}`
                ) {

                    link.classList.add(
                        "active"
                    );

                }

            }
        );

    }


    window.addEventListener(
        "scroll",
        updateActiveNavigation,
        {
            passive: true
        }
    );


    updateActiveNavigation();

}


/* =========================================================
   GENERAL SCROLL REVEAL
========================================================= */

function initializeGeneralReveal() {

    const revealElements =
        document.querySelectorAll(
            ".feature, " +
            ".about-card, " +
            ".contact-box"
        );


    if (
        !("IntersectionObserver" in window)
    ) {

        revealElements.forEach(
            (element) => {

                element.classList.add(
                    "visible"
                );

            }
        );

        return;

    }


    const observer =
        new IntersectionObserver(
            (
                entries,
                observerInstance
            ) => {

                entries.forEach(
                    (entry) => {

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

                    }
                );

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(
        (element) => {

            element.classList.add(
                "scroll-reveal"
            );


            observer.observe(
                element
            );

        }
    );

}


/* =========================================================
   SERVICE REVEAL
========================================================= */

function initializeServiceReveal() {

    const revealElements =
        document.querySelectorAll(
            ".service-card"
        );


    if (
        !("IntersectionObserver" in window)
    ) {

        revealElements.forEach(
            (element) => {

                element.classList.add(
                    "visible"
                );

            }
        );

        return;

    }


    const observer =
        new IntersectionObserver(
            (
                entries,
                observerInstance
            ) => {

                entries.forEach(
                    (entry) => {

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

                    }
                );

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(
        (element) => {

            element.classList.add(
                "scroll-reveal"
            );


            observer.observe(
                element
            );

        }
    );

}


/* =========================================================
   TELEGRAM TRACKING
========================================================= */

function initializeTelegramTracking() {

    const telegramLinks =
        document.querySelectorAll(
            'a[href*="t.me/timifxx203"]'
        );


    telegramLinks.forEach(
        (link) => {

            /*
             Prevent duplicate listeners.
            */

            if (
                link.dataset.telegramTracked ===
                "true"
            ) {

                return;

            }


            link.dataset.telegramTracked =
                "true";


            link.addEventListener(
                "click",
                () => {

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

                }
            );

        }
    );

}


/* =========================================================
   BUTTON RIPPLE
========================================================= */

function initializeButtonRipples() {

    const buttons =
        document.querySelectorAll(
            ".primary-button, " +
            ".secondary-button, " +
            ".service-button, " +
            ".contact-button, " +
            ".nav-button, " +
            ".card-button"
        );


    buttons.forEach(
        (button) => {

            /*
             Prevent duplicate listeners.
            */

            if (
                button.dataset.rippleReady ===
                "true"
            ) {

                return;

            }


            button.dataset.rippleReady =
                "true";


            button.addEventListener(
                "pointerdown",
                (event) => {

                    const ripple =
                        document.createElement(
                            "span"
                        );


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
                        `${
                            event.clientX -
                            rect.left -
                            size / 2
                        }px`;


                    ripple.style.top =
                        `${
                            event.clientY -
                            rect.top -
                            size / 2
                        }px`;


                    button.appendChild(
                        ripple
                    );


                    window.setTimeout(
                        () => {

                            ripple.remove();

                        },
                        600
                    );

                }
            );

        }
    );

}


/* =========================================================
   CURRENT YEAR
========================================================= */

function initializeCurrentYear() {

    const yearElements =
        document.querySelectorAll(
            "[data-current-year]"
        );


    yearElements.forEach(
        (element) => {

            element.textContent =
                new Date().getFullYear();

        }
    );

}
