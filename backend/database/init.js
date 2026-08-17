"use strict";

const { pool } = require("../config/database");

async function initializeDatabase() {
    console.log("");
    console.log("========================================");
    console.log("     INITIALIZING TIMIFXX DATABASE");
    console.log("========================================");

    try {

        // =====================================================
        // USERS
        // =====================================================

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,

                name VARCHAR(100) NOT NULL,

                email VARCHAR(255) UNIQUE NOT NULL,

                password_hash TEXT NOT NULL,

                telegram_username VARCHAR(100),

                whatsapp_number VARCHAR(30),

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("✓ Users table ready");


        // =====================================================
        // SERVICES
        // =====================================================

        await pool.query(`
            CREATE TABLE IF NOT EXISTS services (
                id SERIAL PRIMARY KEY,

                name VARCHAR(150) NOT NULL,

                description TEXT,

                price DECIMAL(10, 2) NOT NULL,

                currency VARCHAR(10) DEFAULT 'USD',

                price_type VARCHAR(30) DEFAULT 'fixed',

                category VARCHAR(100) DEFAULT 'Telegram Ads',

                active BOOLEAN DEFAULT TRUE,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("✓ Services table ready");


        // =====================================================
        // ORDERS
        // =====================================================

        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,

                order_number VARCHAR(30) UNIQUE NOT NULL,

                user_id INTEGER REFERENCES users(id)
                    ON DELETE SET NULL,

                service_id INTEGER REFERENCES services(id)
                    ON DELETE SET NULL,

                price DECIMAL(10, 2) NOT NULL,

                currency VARCHAR(10) DEFAULT 'USD',

                status VARCHAR(30) DEFAULT 'Pending',

                contact_method VARCHAR(20),

                customer_message TEXT,

                telegram_username VARCHAR(100),

                whatsapp_number VARCHAR(30),

                admin_notes TEXT,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("✓ Orders table ready");


        // =====================================================
        // ADMINS
        // =====================================================

        await pool.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,

                name VARCHAR(100) NOT NULL,

                email VARCHAR(255) UNIQUE NOT NULL,

                password_hash TEXT NOT NULL,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("✓ Admins table ready");


        // =====================================================
        // INDEXES
        // =====================================================

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email
            ON users(email);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_orders_user_id
            ON orders(user_id);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_orders_service_id
            ON orders(service_id);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_orders_status
            ON orders(status);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_orders_order_number
            ON orders(order_number);
        `);

        console.log("✓ Database indexes ready");


        // =====================================================
        // SERVICES
        // =====================================================

        const services = [

            [
                "Already Approved Channel",
                "Already approved Telegram channel service.",
                100.00,
                "fixed"
            ],

            [
                "Already Approved Bot",
                "Already approved Telegram bot service.",
                60.00,
                "fixed"
            ],

            [
                "Already Approved MiniApp",
                "Already approved Telegram MiniApp service.",
                80.00,
                "fixed"
            ],

            [
                "Telegram Ads Approval Assistance",
                "Assistance reviewing issues that may prevent a Telegram advertisement from being approved.",
                40.00,
                "fixed"
            ],

            [
                "Telegram Ad Setup",
                "Telegram advertising campaign setup assistance.",
                50.00,
                "fixed"
            ],

            [
                "Telegram Ad Copy Creation",
                "Professional Telegram advertisement copy creation.",
                25.00,
                "fixed"
            ],

            [
                "Telegram Ads Campaign Management",
                "Telegram advertising campaign management service.",
                100.00,
                "starting_from"
            ],

            [
                "Telegram Ad Declined Review",
                "Review of a declined Telegram advertisement and possible issues.",
                25.00,
                "fixed"
            ],

            [
                "Telegram Destination Compliance Check",
                "Review of a Telegram advertising destination for potential compliance issues.",
                40.00,
                "fixed"
            ],

            [
                "Telegram Ads Campaign Audit",
                "Review and audit of an existing Telegram advertising campaign.",
                50.00,
                "fixed"
            ]

        ];


        // Insert only if the service does not already exist.
        for (const service of services) {

            await pool.query(
                `
                INSERT INTO services
                (
                    name,
                    description,
                    price,
                    currency,
                    price_type,
                    category,
                    active
                )
                SELECT
                    $1,
                    $2,
                    $3,
                    'USD',
                    $4,
                    'Telegram Ads',
                    TRUE
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM services
                    WHERE name = $1
                );
                `,
                service
            );

        }

        console.log("✓ Services loaded");


        // =====================================================
        // FINAL CHECK
        // =====================================================

        const result = await pool.query(`
            SELECT COUNT(*) AS total
            FROM services;
        `);

        console.log(
            `✓ Total services available: ${result.rows[0].total}`
        );

        console.log("========================================");
        console.log("     DATABASE INITIALIZATION COMPLETE");
        console.log("========================================");
        console.log("");

    } catch (error) {

        console.error("");
        console.error("========================================");
        console.error("     DATABASE INITIALIZATION FAILED");
        console.error("========================================");
        console.error(error.message);
        console.error("========================================");
        console.error("");

        throw error;
    }
}

module.exports = {
    initializeDatabase
};
