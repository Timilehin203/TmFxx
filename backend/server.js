"use strict";

/*
=========================================================
 TimiFxx Marketing Backend
 Version: 1.3.0

 Features:
 - PostgreSQL connection
 - Service API
 - Authentication API
 - Health check
 - Database test
 - Railway deployment support
 - Graceful shutdown
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

const PORT = Number(process.env.PORT) || 8080;

const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    "https://matildamillie382-crypto.github.io";


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

        version: "1.3.0",

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

        version: "1.3.0",

        status: "online",

        endpoints: {

            home: "/",

            api: "/api",

            health: "/api/health",

            services: "/api/services",

            databaseTest:
                "/api/database-test",

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

        /*
        -------------------------------------------------
        Test PostgreSQL exactly once before starting
        the HTTP server.
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
        Railway should restart the application when
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
