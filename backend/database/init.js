"use strict";

const { pool } = require("../config/database");

async function initializeDatabase() {
    console.log("");
    console.log("========================================");
    console.log("     INITIALIZING TIMIFXX DATABASE");
    console.log("========================================");

    try {

        // =====================================================
        // USERS TABLE
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
        // SERVICES TABLE
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
        // ORDERS TABLE
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
        // ADMINS TABLE
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
            {
                name: "Already Approved Channel",
                description: "Already approved Telegram channel service.",
                price: 100.00,
                priceType: "fixed"
            },
            {
                name: "Already Approved Bot",
                description: "Already approved Telegram bot service.",
                price: 60.00,
                priceType: "fixed"
            },
            {
                name: "Already Approved MiniApp",
                description: "Already approved Telegram MiniApp service.",
                price: 80.00,
                priceType: "fixed"
            },
            {
                name: "Telegram Ads Approval Assistance",
                description: "Assistance reviewing issues that may prevent a Telegram advertisement from being approved.",
                price: 40.00,
                priceType: "fixed"
            },
            {
                name: "Telegram Ad Setup",
                description: "Telegram advertising campaign setup assistance.",
                price: 50.00,
                priceType: "fixed"
            },
            {
                name: "Telegram Ad Copy Creation",
                description: "Professional Telegram advertisement copy creation.",
                price: 25.00,
                priceType: "fixed"
            },
            {
                name: "Telegram Ads Campaign Management",
                description: "Telegram advertising campaign management service.",
                price: 100.00,
                priceType: "starting_from"
            },
            {
                name: "Telegram Ad Declined Review",
                description: "Review of a declined Telegram advertisement and possible issues.",
                price: 25.00,
                priceType: "fixed"
            },
            {
                name: "Telegram Destination Compliance Check",
                description: "Review of a Telegram advertising destination for potential compliance issues.",
                price: 40.00,
                priceType: "fixed"
            },
            {
                name: "Telegram Ads Campaign Audit",
                description: "Review and audit of an existing Telegram advertising campaign.",
                price: 50.00,
                priceType: "fixed"
            }
        ];


        // =====================================================
        // INSERT SERVICES
        // =====================================================

        for (const service of services) {

            const existingService = await pool.query(
                `
                SELECT id
                FROM services
                WHERE name = $1::VARCHAR
                LIMIT 1;
                `,
                [service.name]
            );

            if (existingService.rows.length === 0) {

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
                    VALUES
                    (
                        $1::VARCHAR,
                        $2::TEXT,
                        $3::DECIMAL,
                        'USD',
                        $4::VARCHAR,
                        'Telegram Ads',
                        TRUE
                    );
                    `,
                    [
                        service.name,
                        service.description,
                        service.price,
                        service.priceType
                    ]
                );

            }

        }

        console.log("✓ Services loaded");


        // =====================================================
        // COUNT SERVICES
        // =====================================================

        const result = await pool.query(`
            SELECT COUNT(*) AS total
            FROM services;
        `);

        console.log(
            `✓ Total services available: ${result.rows[0].total}`
        );


        // =====================================================
        // SUCCESS
        // =====================================================

        console.log("");
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
