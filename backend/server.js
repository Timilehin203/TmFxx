"use strict";

/*
=========================================================
 TimiFxx Marketing Backend
 Version: 2.0.0

 Features:
 - PostgreSQL connection
 - Service API
 - Authentication API
 - Admin Dashboard API
 - Secure admin login
 - Price management
 - Service activation/deactivation
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

const PORT = Number(process.env.PORT) || 8080;

const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    "https://matildamillie382-crypto.github.io";

const ADMIN_UPDATE_KEY =
    process.env.ADMIN_UPDATE_KEY;

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

        project: "TimiFxx Marketing",

        version: "2.0.0",

        status: "online",

        message:
            "TimiFxx Marketing API is running.",

        frontend: FRONTEND_URL,

        database: "PostgreSQL"

    });

});


/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/api/health", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT NOW() AS database_time"
        );

        res.json({

            success: true,

            status: "online",

            database: "connected",

            project: "TimiFxx Marketing",

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

            success: false,

            status: "degraded",

            database: "disconnected",

            message:
                "Database connection unavailable."

        });

    }

});


/* =====================================================
   API INFORMATION
===================================================== */

app.get("/api", (req, res) => {

    res.json({

        success: true,

        project: "TimiFxx Marketing",

        version: "2.0.0",

        status: "online",

        endpoints: {

            home: "/",

            api: "/api",

            health: "/api/health",

            services: "/api/services",

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

            signup:
                "POST /api/auth/signup",

            login:
                "POST /api/auth/login",

            currentUser:
                "GET /api/auth/me"

        }

    });

});


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
                    ORDER BY id ASC
                    `
                );

            res.json({

                success: true,

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

                success: false,

                message:
                    "Unable to load services."

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

                success: true,

                database: "PostgreSQL",

                status: "connected",

                database_time:
                    result.rows[0].database_time

            });

        } catch (error) {

            console.error(
                "Database test error:",
                error.message
            );

            res.status(500).json({

                success: false,

                database: "PostgreSQL",

                status: "disconnected",

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

                    success: false,

                    message:
                        "Admin key is required."

                });

            }


            if (
                providedKey !==
                ADMIN_UPDATE_KEY
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid admin key."

                });

            }


            const token =
                jwt.sign(

                    {
                        role: "admin"
                    },

                    ADMIN_UPDATE_KEY,

                    {
                        expiresIn:
                            "2h"
                    }

                );


            return res.json({

                success: true,

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

                success: false,

                message:
                    "Admin login failed."

            });

        }

    }
);


/* =====================================================
   ADMIN AUTH MIDDLEWARE
===================================================== */

function requireAdmin(req, res, next) {

    try {

        const authHeader =
            req.headers.authorization || "";

        if (
            !authHeader.startsWith(
                "Bearer "
            )
        ) {

            return res.status(401).json({

                success: false,

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

                success: false,

                message:
                    "Administrator access required."

            });

        }


        req.admin = decoded;

        next();

    } catch (error) {

        return res.status(401).json({

            success: false,

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

                success: true,

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

                success: false,

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

                success: false,

                message:
                    "Invalid service ID."

            });

        }


        if (
            !Number.isFinite(price) ||
            price < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Price must be a valid positive number."

            });

        }


        try {

            const result =
                await pool.query(
                    `
                    UPDATE services
                    SET price = $1
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

                    success: false,

                    message:
                        "Service not found."

                });

            }


            console.log(
                `Admin updated service ${id} price to $${price.toFixed(2)}`
            );


            res.json({

                success: true,

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

                success: false,

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

                success: false,

                message:
                    "Invalid service ID."

            });

        }


        if (
            typeof active !==
            "boolean"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Active must be true or false."

            });

        }


        try {

            const result =
                await pool.query(
                    `
                    UPDATE services
                    SET active = $1
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

                    success: false,

                    message:
                        "Service not found."

                });

            }


            console.log(
                `Admin changed service ${id} active status to ${active}`
            );


            res.json({

                success: true,

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

                success: false,

                message:
                    "Unable to update service status."

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

            success: false,

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


        if (res.headersSent) {

            return next(error);

        }


        res.status(
            error.status || 500
        ).json({

            success: false,

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
            () => shutdown("SIGTERM")
        );

        process.once(
            "SIGINT",
            () => shutdown("SIGINT")
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
