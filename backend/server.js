"use strict";

/*
=========================================================
 TimiFxx Marketing Backend
 Version: 2.2.0

 Features:
 - PostgreSQL connection
 - Service API
 - Authentication API
 - Admin Dashboard API
 - Secure admin login
 - Price management
 - Service activation/deactivation
 - Public Order Creation API
 - Orders API
 - Order details API
 - Order status management
 - Admin order notes
 - Health check
 - Railway deployment support
 - Graceful shutdown
=========================================================
*/

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const {
    pool
} = require("./config/database");

const authRoutes = require("./routes/auth");


/* =====================================================
   EXPRESS APP
===================================================== */

const app = express();


/* =====================================================
   ENVIRONMENT VARIABLES
===================================================== */

const PORT =
    Number(process.env.PORT) || 8080;

const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    "https://matildamillie382-crypto.github.io";

const ADMIN_UPDATE_KEY =
    process.env.ADMIN_UPDATE_KEY";


if (!ADMIN_UPDATE_KEY) {

    console.error(
        "ADMIN_UPDATE_KEY is not configured."
    );

    process.exit(1);

}


/* =====================================================
   CORS
===================================================== */

app.use(
    cors({
        origin: true,
        credentials: true
    })
);


/* =====================================================
   BODY PARSER
===================================================== */

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
);


/* =====================================================
   REQUEST LOGGER
===================================================== */

app.use((req, res, next) => {

    console.log(
        `${new Date().toISOString()} ${req.method} ${req.originalUrl}`
    );

    next();

});


/* =====================================================
   BASIC HOME ROUTE
===================================================== */

app.get("/", (req, res) => {

    res.json({

        success: true,

        project:
            "TimiFxx Marketing",

        version:
            "2.2.0",

        status:
            "online",

        message:
            "TimiFxx Marketing API is running.",

        frontend:
            FRONTEND_URL,

        database:
            "PostgreSQL"

    });

});


/* =====================================================
   HEALTH CHECK
===================================================== */

app.get(
    "/api/health",
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    "SELECT NOW() AS database_time"
                );


            res.json({

                success:
                    true,

                status:
                    "online",

                database:
                    "connected",

                project:
                    "TimiFxx Marketing",

                database_time:
                    result.rows[0].database_time,

                time:
                    new Date().toISOString()

            });

        } catch (error) {

            console.error(
                "Health check database error:",
                error.message
            );


            res.status(503).json({

                success:
                    false,

                status:
                    "degraded",

                database:
                    "disconnected",

                message:
                    "Database connection unavailable."

            });

        }

    }
);


/* =====================================================
   API INFORMATION
===================================================== */

app.get(
    "/api",
    (req, res) => {

        res.json({

            success:
                true,

            project:
                "TimiFxx Marketing",

            version:
                "2.2.0",

            status:
                "online",

            endpoints: {

                home:
                    "/",

                api:
                    "/api",

                health:
                    "/api/health",

                services:
                    "/api/services",

                createOrder:
                    "POST /api/orders",

                databaseTest:
                    "/api/database-test",

                adminLogin:
                    "POST /api/admin/login",

                adminServices:
                    "GET /api/admin/services",

                adminUpdatePrice:
                    "PATCH /api/admin/services/:id/price",

                adminUpdateStatus:
                    "PATCH /api/admin/services/:id/status",

                adminOrders:
                    "GET /api/admin/orders",

                adminOrder:
                    "GET /api/admin/orders/:id",

                adminOrderStatus:
                    "PATCH /api/admin/orders/:id/status",

                adminOrderNotes:
                    "PATCH /api/admin/orders/:id/notes",

                signup:
                    "POST /api/auth/signup",

                login:
                    "POST /api/auth/login",

                currentUser:
                    "GET /api/auth/me"

            }

        });

    }
);


/* =====================================================
   AUTHENTICATION ROUTES
===================================================== */

app.use(
    "/api/auth",
    authRoutes
);


/* =====================================================
   PUBLIC SERVICES
===================================================== */

app.get(
    "/api/services",
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `
                    SELECT *
                    FROM services
                    WHERE active = TRUE
                    ORDER BY id ASC
                    `
                );


            res.json({

                success:
                    true,

                count:
                    result.rows.length,

                services:
                    result.rows

            });

        } catch (error) {

            console.error(
                "Services error:",
                error.message
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load services."

            });

        }

    }
);


/* =====================================================
   PUBLIC — CREATE ORDER
===================================================== */

app.post(
    "/api/orders",
    async (req, res) => {

        try {

            /*
             ------------------------------------------------
             Read customer information
             ------------------------------------------------
            */

            const serviceId =
                Number(
                    req.body?.service_id
                );

            const contactMethod =
                String(
                    req.body?.contact_method || "telegram"
                )
                    .trim()
                    .toLowerCase();

            const telegramUsername =
                String(
                    req.body?.telegram_username || ""
                )
                    .trim()
                    .replace(/^@/, "");

            const whatsappNumber =
                String(
                    req.body?.whatsapp_number || ""
                )
                    .trim();

            const customerMessage =
                String(
                    req.body?.customer_message || ""
                )
                    .trim();


            /*
             ------------------------------------------------
             Validate service ID
             ------------------------------------------------
            */

            if (
                !Number.isInteger(serviceId) ||
                serviceId <= 0
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "A valid service ID is required."

                });

            }


            /*
             ------------------------------------------------
             Validate contact method
             ------------------------------------------------
            */

            const allowedContactMethods = [
                "telegram",
                "whatsapp"
            ];


            if (
                !allowedContactMethods.includes(
                    contactMethod
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid contact method."

                });

            }


            /*
             ------------------------------------------------
             Validate Telegram contact
             ------------------------------------------------
            */

            if (
                contactMethod === "telegram" &&
                telegramUsername.length > 100
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Telegram username is too long."

                });

            }


            /*
             ------------------------------------------------
             Validate WhatsApp contact
             ------------------------------------------------
            */

            if (
                contactMethod === "whatsapp" &&
                whatsappNumber.length > 30
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "WhatsApp number is too long."

                });

            }


            /*
             ------------------------------------------------
             Limit customer message
             ------------------------------------------------
            */

            if (
                customerMessage.length > 5000
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Customer message is too long."

                });

            }


            /*
             ------------------------------------------------
             Find active service
             ------------------------------------------------

             IMPORTANT:
             The price comes from PostgreSQL.

             The customer cannot submit their own price.
            */

            const serviceResult =
                await pool.query(
                    `
                    SELECT
                        id,
                        name,
                        description,
                        price,
                        currency,
                        price_type,
                        category,
                        active
                    FROM services
                    WHERE id = $1
                      AND active = TRUE
                    LIMIT 1
                    `,
                    [
                        serviceId
                    ]
                );


            if (
                serviceResult.rows.length === 0
            ) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Service not found or is currently unavailable."

                });

            }


            const service =
                serviceResult.rows[0];


            /*
             ------------------------------------------------
             Generate unique order number
             ------------------------------------------------
            */

            let orderNumber;

            let orderCreated = false;

            let createdOrder;


            for (
                let attempt = 0;
                attempt < 5;
                attempt++
            ) {

                const timestamp =
                    Date.now()
                        .toString()
                        .slice(-8);

                const random =
                    Math.floor(
                        1000 +
                        Math.random() * 9000
                    );


                orderNumber =
                    `TMF-${timestamp}-${random}`;


                try {

                    const orderResult =
                        await pool.query(
                            `
                            INSERT INTO orders
                            (
                                order_number,
                                service_id,
                                price,
                                currency,
                                status,
                                contact_method,
                                customer_message,
                                telegram_username,
                                whatsapp_number
                            )
                            VALUES
                            (
                                $1,
                                $2,
                                $3,
                                $4,
                                'Pending',
                                $5,
                                $6,
                                $7,
                                $8
                            )
                            RETURNING
                                id,
                                order_number,
                                service_id,
                                price,
                                currency,
                                status,
                                contact_method,
                                customer_message,
                                telegram_username,
                                whatsapp_number,
                                created_at
                            `,
                            [
                                orderNumber,
                                service.id,
                                service.price,
                                service.currency,
                                contactMethod,
                                customerMessage || null,
                                telegramUsername || null,
                                whatsappNumber || null
                            ]
                        );


                    createdOrder =
                        orderResult.rows[0];

                    orderCreated =
                        true;

                    break;

                } catch (error) {

                    /*
                     Retry only if the generated
                     order number collided.
                    */

                    if (
                        error.code === "23505"
                    ) {

                        continue;

                    }

                    throw error;

                }

            }


            if (!orderCreated) {

                return res.status(500).json({

                    success:
                        false,

                    message:
                        "Unable to generate a unique order number."

                });

            }


            /*
             ------------------------------------------------
             Log successful order
             ------------------------------------------------
            */

            console.log(
                `New order created: ${createdOrder.order_number} - ${service.name} - $${Number(createdOrder.price).toFixed(2)}`
            );


            /*
             ------------------------------------------------
             Return order
             ------------------------------------------------
            */

            return res.status(201).json({

                success:
                    true,

                message:
                    "Order created successfully.",

                order: {

                    id:
                        createdOrder.id,

                    order_number:
                        createdOrder.order_number,

                    service_id:
                        createdOrder.service_id,

                    service_name:
                        service.name,

                    price:
                        createdOrder.price,

                    currency:
                        createdOrder.currency,

                    status:
                        createdOrder.status,

                    contact_method:
                        createdOrder.contact_method,

                    created_at:
                        createdOrder.created_at

                }

            });

        } catch (error) {

            console.error(
                "Create order error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to create order."

            });

        }

    }
);


/* =====================================================
   DATABASE TEST
===================================================== */

app.get(
    "/api/database-test",
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `
                    SELECT
                        NOW() AS database_time
                    `
                );


            res.json({

                success:
                    true,

                database:
                    "PostgreSQL",

                status:
                    "connected",

                database_time:
                    result.rows[0].database_time

            });

        } catch (error) {

            console.error(
                "Database test error:",
                error.message
            );


            res.status(500).json({

                success:
                    false,

                database:
                    "PostgreSQL",

                status:
                    "disconnected",

                message:
                    "Database connection failed."

            });

        }

    }
);


/* =====================================================
   ADMIN AUTHENTICATION
===================================================== */

app.post(
    "/api/admin/login",
    (req, res) => {

        try {

            const providedKey =
                String(
                    req.body?.key || ""
                ).trim();


            if (!providedKey) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Admin key is required."

                });

            }


            if (
                providedKey !==
                ADMIN_UPDATE_KEY
            ) {

                return res.status(401).json({

                    success:
                        false,

                    message:
                        "Invalid admin key."

                });

            }


            const token =
                jwt.sign(
                    {
                        role:
                            "admin"
                    },

                    ADMIN_UPDATE_KEY,

                    {
                        expiresIn:
                            "2h"
                    }
                );


            return res.json({

                success:
                    true,

                message:
                    "Admin login successful.",

                token,

                expiresIn:
                    "2h"

            });

        } catch (error) {

            console.error(
                "Admin login error:",
                error.message
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Admin login failed."

            });

        }

    }
);


/* =====================================================
   ADMIN AUTH MIDDLEWARE
===================================================== */

function requireAdmin(
    req,
    res,
    next
) {

    try {

        const authHeader =
            req.headers.authorization || "";


        if (
            !authHeader.startsWith(
                "Bearer "
            )
        ) {

            return res.status(401).json({

                success:
                    false,

                message:
                    "Admin authentication required."

            });

        }


        const token =
            authHeader.substring(7);


        const decoded =
            jwt.verify(
                token,
                ADMIN_UPDATE_KEY
            );


        if (
            decoded.role !==
            "admin"
        ) {

            return res.status(403).json({

                success:
                    false,

                message:
                    "Administrator access required."

            });

        }


        req.admin =
            decoded;


        next();

    } catch (error) {

        return res.status(401).json({

            success:
                false,

            message:
                "Admin session expired or invalid."

        });

    }

}


/* =====================================================
   ADMIN — GET SERVICES
===================================================== */

app.get(
    "/api/admin/services",
    requireAdmin,
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `
                    SELECT
                        id,
                        name,
                        description,
                        price,
                        currency,
                        price_type,
                        category,
                        active
                    FROM services
                    ORDER BY id ASC
                    `
                );


            res.json({

                success:
                    true,

                count:
                    result.rows.length,

                services:
                    result.rows

            });

        } catch (error) {

            console.error(
                "Admin services error:",
                error.message
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load admin services."

            });

        }

    }
);


/* =====================================================
   ADMIN — UPDATE PRICE
===================================================== */

app.patch(
    "/api/admin/services/:id/price",
    requireAdmin,
    async (req, res) => {

        const id =
            Number(req.params.id);

        const price =
            Number(req.body?.price);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid service ID."

            });

        }


        if (
            !Number.isFinite(price) ||
            price < 0
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Price must be a valid positive number."

            });

        }


        try {

            const result =
                await pool.query(
                    `
                    UPDATE services
                    SET
                        price = $1,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $2
                    RETURNING
                        id,
                        name,
                        price,
                        currency,
                        active
                    `,
                    [
                        price.toFixed(2),
                        id
                    ]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Service not found."

                });

            }


            console.log(
                `Admin updated service ${id} price to $${price.toFixed(2)}`
            );


            res.json({

                success:
                    true,

                message:
                    "Service price updated successfully.",

                service:
                    result.rows[0]

            });

        } catch (error) {

            console.error(
                "Admin price update error:",
                error.message
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to update service price."

            });

        }

    }
);


/* =====================================================
   ADMIN — UPDATE SERVICE STATUS
===================================================== */

app.patch(
    "/api/admin/services/:id/status",
    requireAdmin,
    async (req, res) => {

        const id =
            Number(req.params.id);

        const active =
            req.body?.active;


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid service ID."

            });

        }


        if (
            typeof active !==
            "boolean"
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Active must be true or false."

            });

        }


        try {

            const result =
                await pool.query(
                    `
                    UPDATE services
                    SET
                        active = $1,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $2
                    RETURNING
                        id,
                        name,
                        price,
                        currency,
                        active
                    `,
                    [
                        active,
                        id
                    ]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Service not found."

                });

            }


            console.log(
                `Admin changed service ${id} active status to ${active}`
            );


            res.json({

                success:
                    true,

                message:
                    "Service status updated successfully.",

                service:
                    result.rows[0]

            });

        } catch (error) {

            console.error(
                "Admin status update error:",
                error.message
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to update service status."

            });

        }

    }
);


/* =====================================================
   ADMIN — GET ALL ORDERS
===================================================== */

app.get(
    "/api/admin/orders",
    requireAdmin,
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `
                    SELECT
                        o.id,
                        o.order_number,
                        o.user_id,
                        o.service_id,
                        o.price,
                        o.currency,
                        o.status,
                        o.contact_method,
                        o.customer_message,
                        o.telegram_username,
                        o.whatsapp_number,
                        o.admin_notes,
                        o.created_at,
                        o.updated_at,

                        s.name AS service_name,
                        s.description AS service_description,

                        u.name AS customer_name,
                        u.email AS customer_email

                    FROM orders o

                    LEFT JOIN services s
                        ON s.id = o.service_id

                    LEFT JOIN users u
                        ON u.id = o.user_id

                    ORDER BY
                        o.created_at DESC,
                        o.id DESC
                    `
                );


            res.json({

                success:
                    true,

                count:
                    result.rows.length,

                orders:
                    result.rows

            });

        } catch (error) {

            console.error(
                "Admin orders error:",
                error.message
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load orders."

            });

        }

    }
);


/* =====================================================
   ADMIN — GET SINGLE ORDER
===================================================== */

app.get(
    "/api/admin/orders/:id",
    requireAdmin,
    async (req, res) => {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid order ID."

            });

        }


        try {

            const result =
                await pool.query(
                    `
                    SELECT
                        o.id,
                        o.order_number,
                        o.user_id,
                        o.service_id,
                        o.price,
                        o.currency,
                        o.status,
                        o.contact_method,
                        o.customer_message,
                        o.telegram_username,
                        o.whatsapp_number,
                        o.admin_notes,
                        o.created_at,
                        o.updated_at,

                        s.name AS service_name,
                        s.description AS service_description,

                        u.name AS customer_name,
                        u.email AS customer_email

                    FROM orders o

                    LEFT JOIN services s
                        ON s.id = o.service_id

                    LEFT JOIN users u
                        ON u.id = o.user_id

                    WHERE o.id = $1

                    LIMIT 1
                    `,
                    [id]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Order not found."

                });

            }


            res.json({

                success:
                    true,

                order:
                    result.rows[0]

            });

        } catch (error) {

            console.error(
                "Admin single order error:",
                error.message
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load order."

            });

        }

    }
);


/* =====================================================
   ADMIN — UPDATE ORDER STATUS
===================================================== */

app.patch(
    "/api/admin/orders/:id/status",
    requireAdmin,
    async (req, res) => {

        const id =
            Number(req.params.id);

        const status =
            String(
                req.body?.status || ""
            ).trim();


        const allowedStatuses = [
            "Pending",
            "Processing",
            "Completed",
            "Cancelled"
        ];


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid order ID."

            });

        }


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid order status. Use Pending, Processing, Completed, or Cancelled."

            });

        }


        try {

            const result =
                await pool.query(
                    `
                    UPDATE orders

                    SET
                        status = $1,
                        updated_at = CURRENT_TIMESTAMP

                    WHERE id = $2

                    RETURNING
                        id,
                        order_number,
                        price,
                        currency,
                        status,
                        updated_at
                    `,
                    [
                        status,
                        id
                    ]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Order not found."

                });

            }


            console.log(
                `Admin changed order ${id} status to ${status}`
            );


            res.json({

                success:
                    true,

                message:
                    "Order status updated successfully.",

                order:
                    result.rows[0]

            });

        } catch (error) {

            console.error(
                "Admin order status error:",
                error.message
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to update order status."

            });

        }

    }
);


/* =====================================================
   ADMIN — UPDATE ORDER NOTES
===================================================== */

app.patch(
    "/api/admin/orders/:id/notes",
    requireAdmin,
    async (req, res) => {

        const id =
            Number(req.params.id);

        const adminNotes =
            req.body?.admin_notes;


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid order ID."

            });

        }


        if (
            adminNotes !== null &&
            typeof adminNotes !==
                "string"
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Admin notes must be text."

            });

        }


        const notes =
            adminNotes === null
                ? null
                : String(
                    adminNotes
                ).trim();


        try {

            const result =
                await pool.query(
                    `
                    UPDATE orders

                    SET
                        admin_notes = $1,
                        updated_at = CURRENT_TIMESTAMP

                    WHERE id = $2

                    RETURNING
                        id,
                        order_number,
                        admin_notes,
                        updated_at
                    `,
                    [
                        notes,
                        id
                    ]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Order not found."

                });

            }


            console.log(
                `Admin updated notes for order ${id}`
            );


            res.json({

                success:
                    true,

                message:
                    "Order notes updated successfully.",

                order:
                    result.rows[0]

            });

        } catch (error) {

            console.error(
                "Admin order notes error:",
                error.message
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to update order notes."

            });

        }

    }
);


/* =====================================================
   404 HANDLER
===================================================== */

app.use(
    (req, res) => {

        res.status(404).json({

            success:
                false,

            message:
                "API endpoint not found.",

            path:
                req.originalUrl

        });

    }
);


/* =====================================================
   GLOBAL ERROR HANDLER
===================================================== */

app.use(
    (error, req, res, next) => {

        console.error(
            "Server error:",
            error
        );


        if (
            res.headersSent
        ) {

            return next(error);

        }


        res.status(
            error.status || 500
        ).json({

            success:
                false,

            message:
                error.message ||
                "Internal server error."

        });

    }
);


/* =====================================================
   DATABASE STARTUP CHECK
===================================================== */

async function checkDatabase() {

    console.log("");

    console.log(
        "========================================"
    );

    console.log(
        "       POSTGRESQL CONNECTION"
    );

    console.log(
        "========================================"
    );


    const result =
        await pool.query(
            "SELECT NOW() AS database_time"
        );


    console.log(
        "Database: CONNECTED"
    );

    console.log(
        `Database time: ${result.rows[0].database_time.toISOString()}`
    );

    console.log(
        "========================================"
    );

    console.log("");

}


/* =====================================================
   START SERVER
===================================================== */

async function startServer() {

    try {

        await checkDatabase();


        const server =
            app.listen(
                PORT,
                "0.0.0.0",
                () => {

                    console.log(
                        "========================================"
                    );

                    console.log(
                        "       TIMIFXX MARKETING API"
                    );

                    console.log(
                        "========================================"
                    );

                    console.log(
                        `Server running on port ${PORT}`
                    );

                    console.log(
                        `Frontend: ${FRONTEND_URL}`
                    );

                    console.log(
                        "Database: CONNECTED"
                    );

                    console.log(
                        "Admin API: ENABLED"
                    );

                    console.log(
                        "Orders API: ENABLED"
                    );

                    console.log(
                        "Order Creation: ENABLED"
                    );

                    console.log(
                        "Status: ONLINE"
                    );

                    console.log(
                        "========================================"
                    );

                    console.log("");

                }
            );


        const shutdown =
            async (signal) => {

                console.log("");

                console.log(
                    `${signal} received. Shutting down server...`
                );


                server.close(
                    async () => {

                        try {

                            await pool.end();


                            console.log(
                                "PostgreSQL connection pool closed."
                            );


                            console.log(
                                "Server shutdown complete."
                            );


                            process.exit(0);

                        } catch (error) {

                            console.error(
                                "Error during shutdown:",
                                error.message
                            );


                            process.exit(1);

                        }

                    }
                );

            };


        process.once(
            "SIGTERM",
            () =>
                shutdown(
                    "SIGTERM"
                )
        );


        process.once(
            "SIGINT",
            () =>
                shutdown(
                    "SIGINT"
                )
        );


    } catch (error) {

        console.error("");

        console.error(
            "========================================"
        );

        console.error(
            "      SERVER STARTUP FAILED"
        );

        console.error(
            "========================================"
        );

        console.error(
            error.message
        );

        console.error(
            "========================================"
        );

        console.error("");

        process.exit(1);

    }

}


startServer();


module.exports = app;
