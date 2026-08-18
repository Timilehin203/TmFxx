"use strict";


/* =====================================================
   CONFIG
===================================================== */

const API_URL =
    "https://tmfxx-production.up.railway.app";


/* =====================================================
   ELEMENTS
===================================================== */

const loginScreen =
    document.getElementById(
        "loginScreen"
    );

const dashboard =
    document.getElementById(
        "dashboard"
    );

const loginForm =
    document.getElementById(
        "loginForm"
    );

const adminKey =
    document.getElementById(
        "adminKey"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );

const dashboardMessage =
    document.getElementById(
        "dashboardMessage"
    );

const servicesContainer =
    document.getElementById(
        "servicesContainer"
    );

const totalServices =
    document.getElementById(
        "totalServices"
    );

const activeServices =
    document.getElementById(
        "activeServices"
    );

const totalValue =
    document.getElementById(
        "totalValue"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const refreshButton =
    document.getElementById(
        "refreshButton"
    );


/* =====================================================
   TOKEN
===================================================== */

let adminToken =
    sessionStorage.getItem(
        "timifxx_admin_token"
    );


/* =====================================================
   SHOW DASHBOARD
===================================================== */

function showDashboard() {

    loginScreen.classList.add(
        "hidden"
    );

    dashboard.classList.remove(
        "hidden"
    );

    loadServices();

}


/* =====================================================
   SHOW LOGIN
===================================================== */

function showLogin() {

    dashboard.classList.add(
        "hidden"
    );

    loginScreen.classList.remove(
        "hidden"
    );

}


/* =====================================================
   LOGIN
===================================================== */

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        loginMessage.textContent =
            "Signing in...";


        const key =
            adminKey.value.trim();


        try {

            const response =
                await fetch(
                    `${API_URL}/api/admin/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                key
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Login failed."
                );

            }


            adminToken =
                data.token;


            sessionStorage.setItem(
                "timifxx_admin_token",
                adminToken
            );


            adminKey.value = "";

            loginMessage.textContent = "";

            showDashboard();

        } catch (error) {

            loginMessage.textContent =
                error.message;

        }

    }
);


/* =====================================================
   API REQUEST
===================================================== */

async function adminRequest(
    endpoint,
    options = {}
) {

    const headers = {

        ...(options.headers || {}),

        Authorization:
            `Bearer ${adminToken}`

    };


    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );


    let data;

    try {

        data =
            await response.json();

    } catch {

        data = {};

    }


    if (
        response.status === 401
    ) {

        logout();

        throw new Error(
            "Your admin session has expired."
        );

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Request failed."
        );

    }


    return data;

}


/* =====================================================
   LOAD SERVICES
===================================================== */

async function loadServices() {

    servicesContainer.innerHTML = `
        <div class="loading">
            Loading services...
        </div>
    `;


    try {

        const data =
            await adminRequest(
                "/api/admin/services"
            );


        renderServices(
            data.services || []
        );


    } catch (error) {

        servicesContainer.innerHTML = `
            <div class="loading">
                ${escapeHtml(error.message)}
            </div>
        `;

    }

}


/* =====================================================
   RENDER SERVICES
===================================================== */

function renderServices(
    services
) {

    totalServices.textContent =
        services.length;


    const active =
        services.filter(
            service =>
                service.active === true
        ).length;


    activeServices.textContent =
        active;


    const value =
        services.reduce(
            (sum, service) =>
                sum +
                Number(service.price || 0),
            0
        );


    totalValue.textContent =
        `$${value.toFixed(2)}`;


    if (!services.length) {

        servicesContainer.innerHTML = `
            <div class="loading">
                No services found.
            </div>
        `;

        return;

    }


    servicesContainer.innerHTML =
        services.map(
            service =>
                createServiceHTML(
                    service
                )
        ).join("");


    attachServiceEvents();

}


/* =====================================================
   SERVICE HTML
===================================================== */

function createServiceHTML(
    service
) {

    const price =
        Number(
            service.price || 0
        ).toFixed(2);


    const active =
        service.active === true;


    return `

        <div
            class="service-row"
            data-id="${service.id}"
        >

            <div class="service-info">

                <h3>
                    ${escapeHtml(service.name)}
                </h3>

                <p>
                    ${escapeHtml(
                        service.description ||
                        "Telegram marketing service."
                    )}
                </p>

            </div>


            <div class="price-control">

                <span>$</span>

                <input
                    class="price-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value="${price}"
                    aria-label="Price"
                >

                <button
                    class="save-price"
                    type="button"
                >
                    Save
                </button>

            </div>


            <div class="status-control">

                <span
                    class="
                        status-badge
                        ${active
                            ? "active"
                            : "inactive"}
                    "
                >
                    ${active
                        ? "ACTIVE"
                        : "INACTIVE"}
                </span>

                <button
                    class="status-button"
                    type="button"
                >
                    ${active
                        ? "Disable"
                        : "Enable"}
                </button>

            </div>


            <div>

                <small
                    style="
                        color:#718096;
                        font-size:10px;
                    "
                >
                    ID #${service.id}
                </small>

            </div>

        </div>

    `;

}


/* =====================================================
   SERVICE EVENTS
===================================================== */

function attachServiceEvents() {

    document
        .querySelectorAll(
            ".save-price"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const row =
                            button.closest(
                                ".service-row"
                            );


                        const id =
                            row.dataset.id;


                        const input =
                            row.querySelector(
                                ".price-input"
                            );


                        const price =
                            Number(
                                input.value
                            );


                        if (
                            !Number.isFinite(
                                price
                            ) ||
                            price < 0
                        ) {

                            showMessage(
                                "Please enter a valid price.",
                                true
                            );

                            return;

                        }


                        button.disabled =
                            true;

                        button.textContent =
                            "Saving...";


                        try {

                            await adminRequest(
                                `/api/admin/services/${id}/price`,
                                {
                                    method:
                                        "PATCH",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({
                                            price
                                        })
                                }
                            );


                            showMessage(
                                "Price updated successfully."
                            );


                            await loadServices();

                        } catch (error) {

                            showMessage(
                                error.message,
                                true
                            );

                            button.disabled =
                                false;

                            button.textContent =
                                "Save";

                        }

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".status-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const row =
                            button.closest(
                                ".service-row"
                            );


                        const id =
                            row.dataset.id;


                        const badge =
                            row.querySelector(
                                ".status-badge"
                            );


                        const currentlyActive =
                            badge.classList.contains(
                                "active"
                            );


                        button.disabled =
                            true;


                        button.textContent =
                            "Saving...";


                        try {

                            await adminRequest(
                                `/api/admin/services/${id}/status`,
                                {
                                    method:
                                        "PATCH",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({
                                            active:
                                                !currentlyActive
                                        })
                                }
                            );


                            showMessage(
                                "Service status updated."
                            );


                            await loadServices();

                        } catch (error) {

                            showMessage(
                                error.message,
                                true
                            );

                            button.disabled =
                                false;

                        }

                    }
                );

            }
        );

}


/* =====================================================
   MESSAGE
===================================================== */

function showMessage(
    message,
    error = false
) {

    dashboardMessage.textContent =
        message;

    dashboardMessage.style.display =
        "block";


    if (error) {

        dashboardMessage.style.color =
            "#ff8192";

        dashboardMessage.style.background =
            "rgba(255,93,115,0.08)";

    } else {

        dashboardMessage.style.color =
            "#36d399";

        dashboardMessage.style.background =
            "rgba(54,211,153,0.08)";

    }


    clearTimeout(
        showMessage.timer
    );


    showMessage.timer =
        setTimeout(
            () => {

                dashboardMessage.style.display =
                    "none";

            },
            3500
        );

}


/* =====================================================
   REFRESH
===================================================== */

refreshButton.addEventListener(
    "click",
    async () => {

        refreshButton.disabled =
            true;

        refreshButton.textContent =
            "↻ Loading...";


        await loadServices();


        refreshButton.disabled =
            false;

        refreshButton.textContent =
            "↻ Refresh";

    }
);


/* =====================================================
   LOGOUT
===================================================== */

logoutButton.addEventListener(
    "click",
    logout
);


function logout() {

    adminToken = null;

    sessionStorage.removeItem(
        "timifxx_admin_token"
    );

    showLogin();

}


/* =====================================================
   ESCAPE HTML
===================================================== */

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


/* =====================================================
   START
===================================================== */

if (adminToken) {

    showDashboard();

} else {

    showLogin();

}
