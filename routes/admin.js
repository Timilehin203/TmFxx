"use strict";

const express = require("express");
const jwt = require("jsonwebtoken");

const { pool } = require("../config/database");

const router = express.Router();


/* =========================================================
   ADMIN CONFIGURATION
========================================================= */

const ADMIN_EMAIL =
    process.env.ADMIN_EMAIL;

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD;

const ADMIN_JWT_SECRET =
    process.env.ADMIN_JWT_SECRET ||
    process.env.JWT_SECRET;


/* =========================================================
   ADMIN LOGIN
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

                message:
                    "Email and password are required."

            });

        }


        if (
            !ADMIN_EMAIL ||
            !ADMIN_PASSWORD ||
            !ADMIN_JWT_SECRET
        ) {

            console.error(
                "Admin environment variables are not configured."
            );

            return res.status(500).json({

                success: false,

                message:
                    "Admin authentication is not configured."

            });

        }


        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();


        if (
            normalizedEmail !==
            String(ADMIN_EMAIL)
                .trim()
                .toLowerCase()
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid admin credentials."

            });

        }


        if (
            String(password) !==
            String(ADMIN_PASSWORD)
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid admin credentials."

            });

        }


        const token =
            jwt.sign(
                {
                    role: "admin",
                    email: ADMIN_EMAIL
                },
                ADMIN_JWT_SECRET,
                {
                    expiresIn: "8h"
                }
            );


        res.json({

            success: true,

            message:
                "Admin login successful.",

            token,

            admin: {
                email: ADMIN_EMAIL,
                role: "admin"
            }

        });

    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to login."

        });

    }

});


/* =========================================================
   ADMIN AUTHENTICATION MIDDLEWARE
========================================================= */

function requireAdmin(req, res, next) {

    try {

        const authorization =
            req.headers.authorization;


        if (!authorization) {

            return res.status(401).json({

                success: false,

                message:
                    "Admin authorization required."

            });

        }


        if (
            !authorization
                .toLowerCase()
                .startsWith("bearer ")
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid authorization format."

            });

        }


        const token =
            authorization.substring(7).trim();


        const decoded =
            jwt.verify(
                token,
                ADMIN_JWT_SECRET
            );


        if (
            decoded.role !==
            "admin"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Admin access required."

            });

        }


        req.admin = decoded;

        next();

    } catch (error) {

        return res.status(401).json({

            success: false,

            message:
                "Admin session is invalid or expired."

        });

    }

}


/* =========================================================
   ADMIN SESSION
========================================================= */

router.get(
    "/me",
    requireAdmin,
    (req, res) => {

        res.json({

            success: true,

            admin: {

                email:
                    req.admin.email,

                role:
                    req.admin.role

            }

        });

    }
);


/* =========================================================
   GET ALL SERVICES
========================================================= */

router.get(
    "/services",
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
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to load services."

            });

        }

    }
);


/* =========================================================
   UPDATE SERVICE
========================================================= */

router.put(
    "/services/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const serviceId =
                Number(req.params.id);


            if (
                !Number.isInteger(serviceId) ||
                serviceId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid service ID."

                });

            }


            const {
                name,
                description,
                price,
                active
            } = req.body;


            if (
                price === undefined ||
                price === null ||
                price === ""
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Price is required."

                });

            }


            const numericPrice =
                Number(price);


            if (
                !Number.isFinite(
                    numericPrice
                ) ||
                numericPrice < 0 ||
                numericPrice > 1000000
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid price."

                });

            }


            const existing =
                await pool.query(
                    `
                    SELECT *
                    FROM services
                    WHERE id = $1
                    LIMIT 1
                    `,
                    [serviceId]
                );


            if (
                existing.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Service not found."

                });

            }


            const current =
                existing.rows[0];


            const updatedName =
                typeof name === "string" &&
                name.trim()
                    ? name.trim()
                    : current.name;


            const updatedDescription =
                typeof description === "string"
                    ? description.trim()
                    : current.description;


            const updatedActive =
                typeof active === "boolean"
                    ? active
                    : current.active;


            const result =
                await pool.query(
                    `
                    UPDATE services
                    SET
                        name = $1,
                        description = $2,
                        price = $3,
                        active = $4
                    WHERE id = $5
                    RETURNING
                        id,
                        name,
                        description,
                        price,
                        currency,
                        price_type,
                        active
                    `,
                    [
                        updatedName,
                        updatedDescription,
                        numericPrice,
                        updatedActive,
                        serviceId
                    ]
                );


            res.json({

                success: true,

                message:
                    "Service updated successfully.",

                service:
                    result.rows[0]

            });

        } catch (error) {

            console.error(
                "Service update error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to update service."

            });

        }

    }
);


/* =========================================================
   EXPORT
========================================================= */

module.exports = router;
