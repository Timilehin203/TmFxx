"use strict";

/*
=========================================================
 TimiFxx Marketing
 ADMIN DASHBOARD
 Version: 3.0.0

 Features:
 - Admin login
 - Secure JWT session
 - Service management
 - Service price management
 - Service activation/deactivation
 - Orders dashboard
 - View all orders
 - Order details
 - Order status management
 - Admin order notes
 - Dashboard statistics
=========================================================
*/


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
   ORDERS DATA
===================================================== */

let allOrders = [];

let currentOrder = null;


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

    createOrdersSection();

    loadOrders();

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


        if (!key) {

            loginMessage.textContent =
                "Please enter your admin key.";

            return;

        }


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
                error.message ||
                "Unable to sign in.";

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

    if (!adminToken) {

        logout();

        throw new Error(
            "Admin authentication required."
        );

    }


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


    let data = {};


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
            data-id="${escapeHtml(service.id)}"
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
                    ID #${escapeHtml(service.id)}
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
   CREATE ORDERS SECTION
===================================================== */

function createOrdersSection() {

    if (
        document.getElementById(
            "ordersPanel"
        )
    ) {
        return;
    }


    const panel =
        document.createElement(
            "section"
        );


    panel.id =
        "ordersPanel";


    panel.style.cssText = `
        margin-top:30px;
        background:#ffffff;
        border-radius:18px;
        padding:25px;
        box-shadow:0 10px 35px rgba(0,0,0,0.08);
    `;


    panel.innerHTML = `

        <div
            style="
                display:flex;
                justify-content:space-between;
                align-items:flex-start;
                gap:20px;
                flex-wrap:wrap;
                margin-bottom:22px;
            "
        >

            <div>

                <span
                    style="
                        display:block;
                        font-size:11px;
                        font-weight:800;
                        letter-spacing:1.5px;
                        color:#229ed9;
                        margin-bottom:7px;
                    "
                >
                    ORDER MANAGEMENT
                </span>

                <h2
                    style="
                        margin:0 0 7px;
                        color:#111827;
                    "
                >
                    All Orders
                </h2>

                <p
                    style="
                        margin:0;
                        color:#718096;
                    "
                >
                    View and manage customer orders.
                </p>

            </div>


            <button
                id="refreshOrdersButton"
                type="button"
                style="
                    border:0;
                    background:#229ed9;
                    color:#ffffff;
                    padding:11px 17px;
                    border-radius:9px;
                    cursor:pointer;
                    font-weight:700;
                "
            >
                ↻ Refresh Orders
            </button>

        </div>


        <div
            id="orderStats"
            style="
                display:grid;
                grid-template-columns:
                    repeat(auto-fit,minmax(140px,1fr));
                gap:12px;
                margin-bottom:20px;
            "
        >

        </div>


        <div
            style="
                overflow-x:auto;
            "
        >

            <table
                style="
                    width:100%;
                    border-collapse:collapse;
                    min-width:900px;
                "
            >

                <thead>

                    <tr
                        style="
                            text-align:left;
                            border-bottom:1px solid #e5e7eb;
                        "
                    >

                        <th style="padding:13px 10px;">
                            Order
                        </th>

                        <th style="padding:13px 10px;">
                            Customer
                        </th>

                        <th style="padding:13px 10px;">
                            Service
                        </th>

                        <th style="padding:13px 10px;">
                            Price
                        </th>

                        <th style="padding:13px 10px;">
                            Status
                        </th>

                        <th style="padding:13px 10px;">
                            Date
                        </th>

                        <th style="padding:13px 10px;">
                            Action
                        </th>

                    </tr>

                </thead>


                <tbody id="ordersTableBody">

                    <tr>

                        <td
                            colspan="7"
                            style="
                                padding:35px;
                                text-align:center;
                                color:#718096;
                            "
                        >
                            Loading orders...
                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

    `;


    dashboard
        .querySelector(
            ".dashboard-main"
        )
        .appendChild(panel);


    document
        .getElementById(
            "refreshOrdersButton"
        )
        .addEventListener(
            "click",
            loadOrders
        );

}


/* =====================================================
   LOAD ORDERS
===================================================== */

async function loadOrders() {

    const tableBody =
        document.getElementById(
            "ordersTableBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `

        <tr>

            <td
                colspan="7"
                style="
                    padding:35px;
                    text-align:center;
                    color:#718096;
                "
            >
                Loading orders...
            </td>

        </tr>

    `;


    try {

        const data =
            await adminRequest(
                "/api/admin/orders"
            );


        allOrders =
            Array.isArray(
                data.orders
            )
                ? data.orders
                : [];


        renderOrderStats(
            allOrders
        );


        renderOrders(
            allOrders
        );


    } catch (error) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        padding:35px;
                        text-align:center;
                        color:#dc3545;
                    "
                >
                    ${escapeHtml(
                        error.message
                    )}
                </td>

            </tr>

        `;

    }

}


/* =====================================================
   ORDER STATISTICS
===================================================== */

function renderOrderStats(
    orders
) {

    const container =
        document.getElementById(
            "orderStats"
        );


    if (!container) {
        return;
    }


    const pending =
        orders.filter(
            order =>
                order.status ===
                "Pending"
        ).length;


    const processing =
        orders.filter(
            order =>
                order.status ===
                "Processing"
        ).length;


    const completed =
        orders.filter(
            order =>
                order.status ===
                "Completed"
        ).length;


    const cancelled =
        orders.filter(
            order =>
                order.status ===
                "Cancelled"
        ).length;


    const revenue =
        orders
            .filter(
                order =>
                    order.status ===
                    "Completed"
            )
            .reduce(
                (sum, order) =>
                    sum +
                    Number(
                        order.price || 0
                    ),
                0
            );


    container.innerHTML = `

        ${createOrderStat(
            "Total Orders",
            orders.length
        )}

        ${createOrderStat(
            "Pending",
            pending
        )}

        ${createOrderStat(
            "Processing",
            processing
        )}

        ${createOrderStat(
            "Completed",
            completed
        )}

        ${createOrderStat(
            "Cancelled",
            cancelled
        )}

        ${createOrderStat(
            "Completed Value",
            `$${revenue.toFixed(2)}`
        )}

    `;

}


/* =====================================================
   ORDER STAT CARD
===================================================== */

function createOrderStat(
    label,
    value
) {

    return `

        <div
            style="
                background:#f8fafc;
                border:1px solid #e5e7eb;
                border-radius:12px;
                padding:15px;
            "
        >

            <small
                style="
                    display:block;
                    color:#718096;
                    margin-bottom:6px;
                "
            >
                ${escapeHtml(label)}
            </small>

            <strong
                style="
                    font-size:21px;
                    color:#111827;
                "
            >
                ${escapeHtml(value)}
            </strong>

        </div>

    `;

}


/* =====================================================
   RENDER ORDERS
===================================================== */

function renderOrders(
    orders
) {

    const tableBody =
        document.getElementById(
            "ordersTableBody"
        );


    if (!tableBody) {
        return;
    }


    if (!orders.length) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        padding:45px;
                        text-align:center;
                        color:#718096;
                    "
                >
                    No orders found yet.
                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        orders
            .map(
                order =>
                    createOrderRow(
                        order
                    )
            )
            .join("");


    document
        .querySelectorAll(
            ".view-order-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.id;

                        openOrderDetails(
                            id
                        );

                    }
                );

            }
        );

}


/* =====================================================
   ORDER ROW
===================================================== */

function createOrderRow(
    order
) {

    const status =
        order.status ||
        "Pending";


    const statusColor =
        getStatusColor(
            status
        );


    const customer =
        order.customer_name ||
        order.telegram_username ||
        order.whatsapp_number ||
        "Customer";


    const service =
        order.service_name ||
        "Service unavailable";


    const price =
        Number(
            order.price || 0
        ).toFixed(2);


    const date =
        formatDate(
            order.created_at
        );


    return `

        <tr
            style="
                border-bottom:1px solid #f0f0f0;
            "
        >

            <td
                style="
                    padding:15px 10px;
                    font-weight:800;
                    color:#229ed9;
                "
            >
                #${escapeHtml(
                    order.order_number ||
                    order.id
                )}
            </td>


            <td
                style="
                    padding:15px 10px;
                "
            >

                <strong
                    style="
                        display:block;
                        color:#111827;
                    "
                >
                    ${escapeHtml(
                        customer
                    )}
                </strong>

                ${
                    order.customer_email
                        ? `
                            <small
                                style="
                                    color:#718096;
                                "
                            >
                                ${escapeHtml(
                                    order.customer_email
                                )}
                            </small>
                          `
                        : ""
                }

            </td>


            <td
                style="
                    padding:15px 10px;
                    color:#374151;
                "
            >
                ${escapeHtml(service)}
            </td>


            <td
                style="
                    padding:15px 10px;
                    font-weight:700;
                    color:#111827;
                "
            >
                $${escapeHtml(price)}
            </td>


            <td
                style="
                    padding:15px 10px;
                "
            >

                <span
                    style="
                        display:inline-block;
                        padding:6px 10px;
                        border-radius:999px;
                        background:${statusColor.background};
                        color:${statusColor.text};
                        font-size:11px;
                        font-weight:800;
                    "
                >
                    ${escapeHtml(status)}
                </span>

            </td>


            <td
                style="
                    padding:15px 10px;
                    color:#718096;
                    white-space:nowrap;
                "
            >
                ${escapeHtml(date)}
            </td>


            <td
                style="
                    padding:15px 10px;
                "
            >

                <button
                    type="button"
                    class="view-order-button"
                    data-id="${escapeHtml(order.id)}"
                    style="
                        border:1px solid #229ed9;
                        background:#ffffff;
                        color:#229ed9;
                        padding:8px 12px;
                        border-radius:8px;
                        cursor:pointer;
                        font-weight:700;
                    "
                >
                    View
                </button>

            </td>

        </tr>

    `;

}


/* =====================================================
   OPEN ORDER DETAILS
===================================================== */

async function openOrderDetails(
    id
) {

    try {

        const data =
            await adminRequest(
                `/api/admin/orders/${id}`
            );


        currentOrder =
            data.order;


        showOrderModal(
            currentOrder
        );


    } catch (error) {

        showMessage(
            error.message,
            true
        );

    }

}


/* =====================================================
   ORDER MODAL
===================================================== */

function showOrderModal(
    order
) {

    closeOrderModal();


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "orderModal";


    modal.style.cssText = `
        position:fixed;
        inset:0;
        z-index:99999;
        background:rgba(0,0,0,0.55);
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
    `;


    const status =
        order.status ||
        "Pending";


    modal.innerHTML = `

        <div
            style="
                width:min(700px,100%);
                max-height:90vh;
                overflow:auto;
                background:#ffffff;
                border-radius:18px;
                padding:25px;
                box-shadow:0 25px 70px rgba(0,0,0,0.25);
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    gap:15px;
                    align-items:center;
                    margin-bottom:22px;
                "
            >

                <div>

                    <small
                        style="
                            color:#229ed9;
                            font-weight:800;
                            letter-spacing:1px;
                        "
                    >
                        ORDER DETAILS
                    </small>

                    <h2
                        style="
                            margin:5px 0 0;
                            color:#111827;
                        "
                    >
                        #${escapeHtml(
                            order.order_number ||
                            order.id
                        )}
                    </h2>

                </div>


                <button
                    id="closeOrderModal"
                    type="button"
                    style="
                        border:0;
                        background:#f1f5f9;
                        width:38px;
                        height:38px;
                        border-radius:50%;
                        cursor:pointer;
                        font-size:18px;
                    "
                >
                    ×
                </button>

            </div>


            <div
                style="
                    display:grid;
                    grid-template-columns:
                        repeat(auto-fit,minmax(220px,1fr));
                    gap:12px;
                    margin-bottom:20px;
                "
            >

                ${orderDetail(
                    "Customer",
                    order.customer_name ||
                    "Not provided"
                )}

                ${orderDetail(
                    "Email",
                    order.customer_email ||
                    "Not provided"
                )}

                ${orderDetail(
                    "Service",
                    order.service_name ||
                    "Not available"
                )}

                ${orderDetail(
                    "Price",
                    `$${Number(
                        order.price || 0
                    ).toFixed(2)} ${order.currency || "USD"}`
                )}

                ${orderDetail(
                    "Contact Method",
                    order.contact_method ||
                    "Not provided"
                )}

                ${orderDetail(
                    "Telegram",
                    order.telegram_username
                        ? `@${String(
                            order.telegram_username
                        ).replace(/^@/, "")}`
                        : "Not provided"
                )}

                ${orderDetail(
                    "WhatsApp",
                    order.whatsapp_number ||
                    "Not provided"
                )}

                ${orderDetail(
                    "Created",
                    formatDate(
                        order.created_at
                    )
                )}

            </div>


            <div
                style="
                    margin-bottom:20px;
                "
            >

                <strong
                    style="
                        display:block;
                        margin-bottom:8px;
                        color:#111827;
                    "
                >
                    Customer Message
                </strong>

                <div
                    style="
                        background:#f8fafc;
                        border:1px solid #e5e7eb;
                        padding:14px;
                        border-radius:10px;
                        color:#374151;
                        white-space:pre-wrap;
                        min-height:50px;
                    "
                >
                    ${escapeHtml(
                        order.customer_message ||
                        "No customer message."
                    )}
                </div>

            </div>


            <div
                style="
                    margin-bottom:20px;
                "
            >

                <strong
                    style="
                        display:block;
                        margin-bottom:8px;
                        color:#111827;
                    "
                >
                    Order Status
                </strong>


                <select
                    id="orderStatusSelect"
                    style="
                        width:100%;
                        padding:12px;
                        border:1px solid #d1d5db;
                        border-radius:9px;
                        background:#ffffff;
                    "
                >

                    ${statusOption(
                        "Pending",
                        status
                    )}

                    ${statusOption(
                        "Processing",
                        status
                    )}

                    ${statusOption(
                        "Completed",
                        status
                    )}

                    ${statusOption(
                        "Cancelled",
                        status
                    )}

                </select>

            </div>


            <div
                style="
                    margin-bottom:20px;
                "
            >

                <strong
                    style="
                        display:block;
                        margin-bottom:8px;
                        color:#111827;
                    "
                >
                    Admin Notes
                </strong>


                <textarea
                    id="adminNotesInput"
                    rows="5"
                    placeholder="Add private notes about this order..."
                    style="
                        width:100%;
                        box-sizing:border-box;
                        resize:vertical;
                        padding:12px;
                        border:1px solid #d1d5db;
                        border-radius:9px;
                        font-family:inherit;
                    "
                >${escapeHtml(
                    order.admin_notes ||
                    ""
                )}</textarea>

            </div>


            <div
                style="
                    display:flex;
                    justify-content:flex-end;
                    gap:10px;
                    flex-wrap:wrap;
                "
            >

                <button
                    id="saveOrderNotes"
                    type="button"
                    style="
                        border:1px solid #229ed9;
                        background:#ffffff;
                        color:#229ed9;
                        padding:11px 16px;
                        border-radius:9px;
                        cursor:pointer;
                        font-weight:700;
                    "
                >
                    Save Notes
                </button>


                <button
                    id="saveOrderStatus"
                    type="button"
                    style="
                        border:0;
                        background:#229ed9;
                        color:#ffffff;
                        padding:11px 18px;
                        border-radius:9px;
                        cursor:pointer;
                        font-weight:700;
                    "
                >
                    Update Status
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    document
        .getElementById(
            "closeOrderModal"
        )
        .addEventListener(
            "click",
            closeOrderModal
        );


    document
        .getElementById(
            "saveOrderStatus"
        )
        .addEventListener(
            "click",
            saveOrderStatus
        );


    document
        .getElementById(
            "saveOrderNotes"
        )
        .addEventListener(
            "click",
            saveOrderNotes
        );


    modal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                modal
            ) {

                closeOrderModal();

            }

        }
    );

}


/* =====================================================
   ORDER DETAIL FIELD
===================================================== */

function orderDetail(
    label,
    value
) {

    return `

        <div
            style="
                background:#f8fafc;
                border:1px solid #e5e7eb;
                border-radius:10px;
                padding:13px;
            "
        >

            <small
                style="
                    display:block;
                    color:#718096;
                    margin-bottom:5px;
                "
            >
                ${escapeHtml(label)}
            </small>

            <strong
                style="
                    color:#111827;
                    word-break:break-word;
                "
            >
                ${escapeHtml(value)}
            </strong>

        </div>

    `;

}


/* =====================================================
   STATUS OPTION
===================================================== */

function statusOption(
    value,
    current
) {

    return `

        <option
            value="${escapeHtml(value)}"
            ${value === current
                ? "selected"
                : ""}
        >
            ${escapeHtml(value)}
        </option>

    `;

}


/* =====================================================
   SAVE ORDER STATUS
===================================================== */

async function saveOrderStatus() {

    if (!currentOrder) {
        return;
    }


    const select =
        document.getElementById(
            "orderStatusSelect"
        );


    const button =
        document.getElementById(
            "saveOrderStatus"
        );


    const status =
        select.value;


    button.disabled =
        true;

    button.textContent =
        "Updating...";


    try {

        await adminRequest(
            `/api/admin/orders/${currentOrder.id}/status`,
            {
                method:
                    "PATCH",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        status
                    })
            }
        );


        currentOrder.status =
            status;


        showMessage(
            "Order status updated successfully."
        );


        closeOrderModal();

        await loadOrders();


    } catch (error) {

        showMessage(
            error.message,
            true
        );


        button.disabled =
            false;

        button.textContent =
            "Update Status";

    }

}


/* =====================================================
   SAVE ORDER NOTES
===================================================== */

async function saveOrderNotes() {

    if (!currentOrder) {
        return;
    }


    const textarea =
        document.getElementById(
            "adminNotesInput"
        );


    const button =
        document.getElementById(
            "saveOrderNotes"
        );


    const notes =
        textarea.value.trim();


    button.disabled =
        true;

    button.textContent =
        "Saving...";


    try {

        await adminRequest(
            `/api/admin/orders/${currentOrder.id}/notes`,
            {
                method:
                    "PATCH",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        admin_notes:
                            notes
                    })
            }
        );


        currentOrder.admin_notes =
            notes;


        showMessage(
            "Admin notes saved successfully."
        );


        button.disabled =
            false;

        button.textContent =
            "Save Notes";


    } catch (error) {

        showMessage(
            error.message,
            true
        );


        button.disabled =
            false;

        button.textContent =
            "Save Notes";

    }

}


/* =====================================================
   CLOSE ORDER MODAL
===================================================== */

function closeOrderModal() {

    const modal =
        document.getElementById(
            "orderModal"
        );


    if (modal) {

        modal.remove();

    }


    currentOrder = null;

}


/* =====================================================
   STATUS COLORS
===================================================== */

function getStatusColor(
    status
) {

    switch (status) {

        case "Processing":

            return {
                background:
                    "#fff7ed",
                text:
                    "#c2410c"
            };


        case "Completed":

            return {
                background:
                    "#ecfdf5",
                text:
                    "#047857"
            };


        case "Cancelled":

            return {
                background:
                    "#fef2f2",
                text:
                    "#b91c1c"
            };


        case "Pending":

        default:

            return {
                background:
                    "#eff6ff",
                text:
                    "#1d4ed8"
            };

    }

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(
    value
) {

    if (!value) {

        return "Unknown";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleString(
        undefined,
        {
            year:
                "numeric",

            month:
                "short",

            day:
                "numeric",

            hour:
                "numeric",

            minute:
                "2-digit"
        }
    );

}


/* =====================================================
   DASHBOARD MESSAGE
===================================================== */

function showMessage(
    message,
    error = false
) {

    if (!dashboardMessage) {
        return;
    }


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
   REFRESH SERVICES
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

    adminToken =
        null;


    allOrders =
        [];


    currentOrder =
        null;


    sessionStorage.removeItem(
        "timifxx_admin_token"
    );


    closeOrderModal();

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
