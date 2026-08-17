"use strict";

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { pool } = require("../config/database");

const router = express.Router();

const JWT_SECRET =
    process.env.JWT_SECRET || "CHANGE_THIS_SECRET_IN_RAILWAY";


/* =========================================================
   GENERATE TOKEN
   ========================================================= */

function generateToken(user) {

    return jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

}


/* =========================================================
   SIGN UP
   ========================================================= */

router.post("/signup", async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            telegram_username,
            whatsapp_number
        } = req.body;


        // Basic validation

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });

        }


        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters."
            });

        }


        const normalizedEmail =
            email.trim().toLowerCase();


        // Check existing user

        const existingUser = await pool.query(
            `
            SELECT id
            FROM users
            WHERE email = $1
            LIMIT 1
            `,
            [normalizedEmail]
        );


        if (existingUser.rows.length > 0) {

            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });

        }


        // Hash password

        const passwordHash =
            await bcrypt.hash(password, 12);


        // Create user

        const result = await pool.query(
            `
            INSERT INTO users
            (
                name,
                email,
                password_hash,
                telegram_username,
                whatsapp_number
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5
            )
            RETURNING
                id,
                name,
                email,
                telegram_username,
                whatsapp_number,
                created_at;
            `,
            [
                name.trim(),
                normalizedEmail,
                passwordHash,
                telegram_username || null,
                whatsapp_number || null
            ]
        );


        const user = result.rows[0];


        const token =
            generateToken(user);


        res.status(201).json({

            success: true,

            message: "Account created successfully.",

            token,

            user

        });


    } catch (error) {

        console.error("Signup error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to create account."
        });

    }

});


/* =========================================================
   LOGIN
   ========================================================= */

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });

        }


        const normalizedEmail =
            email.trim().toLowerCase();


        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                password_hash,
                telegram_username,
                whatsapp_number,
                created_at
            FROM users
            WHERE email = $1
            LIMIT 1
            `,
            [normalizedEmail]
        );


        if (result.rows.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });

        }


        const user =
            result.rows[0];


        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password_hash
            );


        if (!passwordMatches) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });

        }


        delete user.password_hash;


        const token =
            generateToken(user);


        res.json({

            success: true,

            message: "Login successful.",

            token,

            user

        });


    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to login."
        });

    }

});


/* =========================================================
   VERIFY TOKEN
   ========================================================= */

router.get("/me", async (req, res) => {

    try {

        const authorization =
            req.headers.authorization;


        if (!authorization) {

            return res.status(401).json({
                success: false,
                message: "Authorization token required."
            });

        }


        const token =
            authorization.replace(
                "Bearer ",
                ""
            );


        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );


        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                telegram_username,
                whatsapp_number,
                created_at
            FROM users
            WHERE id = $1
            LIMIT 1
            `,
            [decoded.id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User account not found."
            });

        }


        res.json({

            success: true,

            user: result.rows[0]

        });


    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });

    }

});


module.exports = router;
