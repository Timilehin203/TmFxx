"use strict";

/*
=========================================================
 TimiFxx Marketing Backend
 Version: 1.4.0

 Features:
 - PostgreSQL connection
 - Service API
 - Authentication API
 - Health check
 - Database test
 - Railway deployment support
 - Graceful shutdown
 - Protected service price update
=========================================================
*/

require("dotenv").config();

const express = require("express");
const cors = require("cors");

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
    process.env.ADMIN_UPDATE_KEY;


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
            "1.4.0",

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

                success: true,

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

                success: false,

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

            success: true,

            project:
                "TimiFxx Marketing",

            version:
                "1.4.0",

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

                databaseTest:
                    "/api/database-test",

                signup:
                    "POST /api/auth/signup",

                login:
                    "POST /api/auth/login",

                currentUser:
                    "GET /api/auth/me",

                updatePrices:
                    "POST /api/admin/update-prices"

            }

        });

    }
);


/* =====================================================
   AUTHENTICATION ROUTES
===================================================== */

/*
   POST /api/auth/signup
   POST /api/auth/login
   GET  /api/auth/me
*/

app.use(
    "/api/auth",
    authRoutes
);


/* =====================================================
   SERVICES
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
   PROTECTED PRICE UPDATE
===================================================== */

/*
   This endpoint is intended to be used once to update
   the five Telegram service prices.

   Endpoint:

   POST /api/admin/update-prices

   Required header:

   x-admin-key: YOUR_ADMIN_UPDATE_KEY

   The endpoint does NOT depend on knowing the exact
   capitalization or spacing of the service names.

===================================================== */


/* -----------------------------------------------------
   SERVICE MATCHING HELPERS
----------------------------------------------------- */

function normalizeServiceName(value) {

    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .trim();

}


function findServiceByKeywords(
    services,
    keywordGroups
) {

    return services.find((service) => {

        const name =
            normalizeServiceName(
                service.name
            );

        return keywordGroups.every(
            (group) => {

                return group.some(
                    (keyword) =>
                        name.includes(
                            normalizeServiceName(
                                keyword
                            )
                        )
                );

            }
        );

    });

}


/* -----------------------------------------------------
   UPDATE PRICES
----------------------------------------------------- */

app.post(
    "/api/admin/update-prices",
    async (req, res) => {

        try {

            /* -----------------------------------------
               Check admin key
            ----------------------------------------- */

            if (!ADMIN_UPDATE_KEY) {

                console.error(
                    "ADMIN_UPDATE_KEY is not configured."
                );


                return res.status(500).json({

                    success:
                        false,

                    message:
                        "Admin update key is not configured on the server."

                });

            }


            const suppliedKey =
                req.headers["x-admin-key"];


            if (
                !suppliedKey ||
                suppliedKey !== ADMIN_UPDATE_KEY
            ) {

                return res.status(401).json({

                    success:
                        false,

                    message:
                        "Unauthorized."

                });

            }


            /* -----------------------------------------
               Load all services
            ----------------------------------------- */

            const servicesResult =
                await pool.query(
                    `
                    SELECT *
                    FROM services
                    ORDER BY id ASC
                    `
                );


            const services =
                servicesResult.rows;


            if (!services.length) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "No services were found in the database."

                });

            }


            /* -----------------------------------------
               Find target services
            ----------------------------------------- */

            const priceUpdates = [

                {
                    label:
                        "Already Approved Telegram Channel",

                    price:
                        150,

                    keywords: [
                        [
                            "telegram"
                        ],
                        [
                            "channel"
                        ],
                        [
                            "approved"
                        ]
                    ]
                },

                {
                    label:
                        "Already Approved Telegram Bot",

                    price:
                        70,

                    keywords: [
                        [
                            "telegram"
                        ],
                        [
                            "bot"
                        ],
                        [
                            "approved"
                        ]
                    ]
                },

                {
                    label:
                        "Already Approved Telegram Miniapp",

                    price:
                        100,

                    keywords: [
                        [
                            "telegram"
                        ],
                        [
                            "miniapp",
                            "mini app",
                            "mini-app"
                        ],
                        [
                            "approved"
                        ]
                    ]
                },

                {
                    label:
                        "Telegram Ads Campaign Management",

                    price:
                        200,

                    keywords: [
                        [
                            "telegram"
                        ],
                        [
                            "ads",
                            "advertising"
                        ],
                        [
                            "campaign"
                        ],
                        [
                            "management",
                            "manage"
                        ]
                    ]
                },

                {
                    label:
                        "Telegram Ad Copy Creation",

                    price:
                        30,

                    keywords: [
                        [
                            "telegram"
                        ],
                        [
                            "ad",
                            "ads"
                        ],
                        [
                            "copy"
                        ],
                        [
                            "creation",
                            "create"
                        ]
                    ]
                }

            ];


            /* -----------------------------------------
               Detect price column
            ----------------------------------------- */

            const firstService =
                services[0];


            let priceColumn = null;


            if (
                Object.prototype.hasOwnProperty.call(
                    firstService,
                    "price"
                )
            ) {

                priceColumn =
                    "price";

            } else if (
                Object.prototype.hasOwnProperty.call(
                    firstService,
                    "amount"
                )
            ) {

                priceColumn =
                    "amount";

            }


            if (!priceColumn) {

                return res.status(500).json({

                    success:
                        false,

                    message:
                        "Could not find a price column in the services table."

                });

            }


            /* -----------------------------------------
               Update services
            ----------------------------------------- */

            const updated = [];

            const notFound = [];


            for (
                const item
                of priceUpdates
            ) {

                const service =
                    findServiceByKeywords(
                        services,
                        item.keywords
                    );


                if (!service) {

                    notFound.push({

                        requested:
                            item.label,

                        price:
                            item.price

                    });

                    continue;

                }


                const result =
                    await pool.query(
                        `
                        UPDATE services
                        SET ${priceColumn} = $1
                        WHERE id = $2
                        RETURNING *
                        `,
                        [
                            item.price,
                            service.id
                        ]
                    );


                if (
                    result.rows.length > 0
                ) {

                    updated.push({

                        requested:
                            item.label,

                        database_name:
                            service.name,

                        price:
                            result.rows[0][
                                priceColumn
                            ]

                    });

                }

            }


            /* -----------------------------------------
               Response
            ----------------------------------------- */

            res.json({

                success:
                    true,

                message:
                    "Service price update completed.",

                updated_count:
                    updated.length,

                not_found_count:
                    notFound.length,

                updated:
                    updated,

                not_found:
                    notFound

            });


        } catch (error) {

            console.error(
                "Price update error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to update service prices.",

                error:
                    error.message

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
                    result.rows[0]
                        .database_time

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


        if (res.headersSent) {

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

        /*
        -------------------------------------------------
        Test PostgreSQL before starting HTTP server
        -------------------------------------------------
        */

        await checkDatabase();


        /*
        -------------------------------------------------
        Start Express
        -------------------------------------------------
        */

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
                        "Status: ONLINE"
                    );

                    console.log(
                        "========================================"
                    );

                    console.log("");

                }
            );


        /*
        -------------------------------------------------
        Graceful shutdown
        -------------------------------------------------
        */

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


        /*
        -------------------------------------------------
        Railway will restart the application when
        PostgreSQL or another required startup service
        is unavailable.
        -------------------------------------------------
        */

        process.exit(1);

    }

}


/* =====================================================
   START APPLICATION
===================================================== */

startServer();


/* =====================================================
   EXPORT APP
===================================================== */

module.exports = app;
