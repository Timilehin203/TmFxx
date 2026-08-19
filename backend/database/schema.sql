-- =========================================================
-- TIMIFXX MARKETING DATABASE
-- =========================================================

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


-- =========================================================
-- SERVICES
-- =========================================================

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


-- =========================================================
-- ORDERS
-- =========================================================

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,

    order_number VARCHAR(30) UNIQUE NOT NULL,

    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,

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


-- =========================================================
-- ADMINS
-- =========================================================

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);


CREATE INDEX IF NOT EXISTS idx_orders_user_id
ON orders(user_id);


CREATE INDEX IF NOT EXISTS idx_orders_service_id
ON orders(service_id);


CREATE INDEX IF NOT EXISTS idx_orders_status
ON orders(status);


CREATE INDEX IF NOT EXISTS idx_orders_order_number
ON orders(order_number);


-- =========================================================
-- DEFAULT SERVICES
-- =========================================================

INSERT INTO services
(name, description, price, currency, price_type, category)
VALUES

(
    'Already Approved Channel',
    'Already approved Telegram channel service.',
    150.00,
    'USD',
    'fixed',
    'Telegram Ads'
),

(
    'Already Approved Bot',
    'Already approved Telegram bot service.',
    70.00,
    'USD',
    'fixed',
    'Telegram Ads'
),

(
    'Already Approved MiniApp',
    'Already approved Telegram MiniApp service.',
    90.00,
    'USD',
    'fixed',
    'Telegram Ads'
),

(
    'Telegram Ads Approval Assistance',
    'Assistance reviewing issues that may prevent a Telegram advertisement from being approved.',
    40.00,
    'USD',
    'fixed',
    'Telegram Ads'
),

(
    'Telegram Ad Setup',
    'Telegram advertising campaign setup assistance.',
    50.00,
    'USD',
    'fixed',
    'Telegram Ads'
),

(
    'Telegram Ad Copy Creation',
    'Professional Telegram advertisement copy creation.',
    25.00,
    'USD',
    'fixed',
    'Telegram Ads'
),

(
    'Telegram Ads Campaign Management',
    'Telegram advertising campaign management service.',
    100.00,
    'USD',
    'starting_from',
    'Telegram Ads'
),

(
    'Telegram Ad Declined Review',
    'Review of a declined Telegram advertisement and possible issues.',
    25.00,
    'USD',
    'fixed',
    'Telegram Ads'
),

(
    'Telegram Destination Compliance Check',
    'Review of a Telegram advertising destination for potential compliance issues.',
    40.00,
    'USD',
    'fixed',
    'Telegram Ads'
),

(
    'Telegram Ads Campaign Audit',
    'Review and audit of an existing Telegram advertising campaign.',
    50.00,
    'USD',
    'fixed',
    'Telegram Ads'
)

ON CONFLICT DO NOTHING;
