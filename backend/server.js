"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
    pool,
    testDatabaseConnection
} = require("./config/database");

const app = express();

const PORT = process.env.PORT || 3000;

const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    "https://matildamillie382-crypto.github.io";


/* =========================================================
   MIDDLEWARE
   ========================================================= */

app.use(
    cors({
        origin: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =========================================================
   ROOT
   ========================================================= */

app.get("/", (req, res) => {

    res.json({
        project: "TimiFxx Marketing",
        status: "online",
        message: "TimiFxx Marketing API is running.",
        version: "1.1.0"
    });

});


/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get("/api/health", async (req, res) => {

    try {

        await pool.query("SELECT 1");

        res.status(200).json({
            status: "ok",
            service: "TimiFxx Marketing API",
            database: "connected",
            timestamp: new Date().toISOString()
        });

    } catch (error) {

        console.error("Health check database error:", error);

        res.status(503).json({
            status: "error",
            service: "TimiFxx Marketing API",
            database: "disconnected",
            timestamp: new Date().toISOString()
        });

    }

});


/* =========================================================
   API INFORMATION
   ========================================================= */

app.get("/api", (req, res) => {

    res.json({
        name: "TimiFxx Marketing API",
        version: "1.1.0",
        status: "online",

        endpoints: {
            health: "/api/health",
            services: "/api/services",
            orders: "/api/orders",
            authentication: "/api/auth",
            admin: "/api/admin"
        }
    });

});


/* =========================================================
   SERVICES
   ========================================================= */

app.get("/api/services", async (req, res) => {

    try {

        const result = await pool.query(
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
            WHERE active = TRUE
            ORDER BY id ASC
            `
        );

        res.json({
            success: true,
            count: result.rows.length,
            services: result.rows
        });

    } catch (error) {

        console.error("Services error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load services."
        });

    }

});


/* =========================================================
   DATABASE TEST
   ========================================================= */

app.get("/api/database-test", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT NOW() AS current_time"
        );

        res.json({
            success: true,
            database: "PostgreSQL",
            connected: true,
            current_time: result.rows[0].current_time
        });

    } catch (error) {

        console.error("Database test error:", error);

        res.status(500).json({
            success: false,
            database: "PostgreSQL",
            connected: false,
            message: "Database connection failed."
        });

    }

});


/* =========================================================
   FUTURE ROUTES
   ========================================================= */

/*
    Authentication:
    POST /api/auth/register
    POST /api/auth/login

    Orders:
    POST /api/orders
    GET /api/orders

    Admin:
    GET /api/admin/orders
    PATCH /api/admin/orders/:id
*/


/* =========================================================
   404 HANDLER
   ========================================================= */

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API endpoint not found.",
        path: req.originalUrl
    });

});


/* =========================================================
   ERROR HANDLER
   ========================================================= */

app.use((error, req, res, next) => {

    console.error("Server error:", error);

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });

});


/* =========================================================
   START SERVER
   ========================================================= */

async function startServer() {

    try {

        await testDatabaseConnection();

        app.listen(PORT, "0.0.0.0", () => {

            console.log("");
            console.log("========================================");
            console.log("       TIMIFXX MARKETING API");
            console.log("========================================");
            console.log(`Server running on port ${PORT}`);
            console.log(`Frontend: ${FRONTEND_URL}`);
            console.log("Database: CONNECTED");
            console.log("Status: ONLINE");
            console.log("========================================");
            console.log("");

        });

    } catch (error) {

        console.error("");
        console.error("========================================");
        console.error("       DATABASE CONNECTION FAILED");
        console.error("========================================");
        console.error(error.message);
        console.error("========================================");
        console.error("");

        process.exit(1);

    }

}


startServer();
