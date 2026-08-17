"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    "https://matildamillie382-crypto.github.io";

app.use(
    cors({
        origin: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

/* =========================================================
   BASIC ROUTES
   ========================================================= */

app.get("/", (req, res) => {

    res.json({
        project: "TimiFxx Marketing",
        status: "online",
        message: "TimiFxx Marketing API is running.",
        version: "1.0.0"
    });

});


app.get("/api/health", (req, res) => {

    res.status(200).json({
        status: "ok",
        service: "TimiFxx Marketing API",
        database: "not connected yet",
        timestamp: new Date().toISOString()
    });

});


app.get("/api", (req, res) => {

    res.json({
        name: "TimiFxx Marketing API",
        version: "1.0.0",
        status: "online",

        endpoints: {
            health: "/api/health",
            services: "/api/services",
            orders: "/api/orders",
            authentication: "/api/auth"
        }
    });

});


/* =========================================================
   TEMPORARY SERVICES ROUTE
   ========================================================= */

app.get("/api/services", (req, res) => {

    const services = [
        {
            id: 1,
            name: "Already Approved Channel",
            price: 100,
            currency: "USD",
            category: "Telegram Ads"
        },

        {
            id: 2,
            name: "Already Approved Bot",
            price: 60,
            currency: "USD",
            category: "Telegram Ads"
        },

        {
            id: 3,
            name: "Already Approved MiniApp",
            price: 80,
            currency: "USD",
            category: "Telegram Ads"
        },

        {
            id: 4,
            name: "Telegram Ads Approval Assistance",
            price: 40,
            currency: "USD",
            category: "Telegram Ads"
        },

        {
            id: 5,
            name: "Telegram Ad Setup",
            price: 50,
            currency: "USD",
            category: "Telegram Ads"
        },

        {
            id: 6,
            name: "Telegram Ad Copy Creation",
            price: 25,
            currency: "USD",
            category: "Telegram Ads"
        },

        {
            id: 7,
            name: "Telegram Ads Campaign Management",
            price: 100,
            currency: "USD",
            category: "Telegram Ads",
            priceType: "starting_from"
        },

        {
            id: 8,
            name: "Telegram Ad Declined Review",
            price: 25,
            currency: "USD",
            category: "Telegram Ads"
        },

        {
            id: 9,
            name: "Telegram Destination Compliance Check",
            price: 40,
            currency: "USD",
            category: "Telegram Ads"
        },

        {
            id: 10,
            name: "Telegram Ads Campaign Audit",
            price: 50,
            currency: "USD",
            category: "Telegram Ads"
        }
    ];

    res.json({
        success: true,
        count: services.length,
        services
    });

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

app.listen(PORT, "0.0.0.0", () => {

    console.log("");
    console.log("========================================");
    console.log("       TIMIFXX MARKETING API");
    console.log("========================================");
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend: ${FRONTEND_URL}`);
    console.log("Status: ONLINE");
    console.log("========================================");
    console.log("");

});
