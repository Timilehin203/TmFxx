"use strict";

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not configured.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL error:", error);
});

async function testDatabaseConnection() {
    const client = await pool.connect();

    try {
        const result = await client.query("SELECT NOW() AS current_time");

        console.log("========================================");
        console.log("       POSTGRESQL CONNECTION");
        console.log("========================================");
        console.log("Database: CONNECTED");
        console.log("Database time:", result.rows[0].current_time);
        console.log("========================================");
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    testDatabaseConnection
};
