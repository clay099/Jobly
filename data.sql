\c jobly
-- \c jobly-test

DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TYPE IF EXISTS enum;


CREATE TABLE companies (
    handle TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    num_employees INTEGER,
    description TEXT,
    logo_url TEXT
);

CREATE TABLE jobs (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL, 
    salary FLOAT NOT NULL,
    equity FLOAT NOT NULL,
    company_handle TEXT NOT NULL REFERENCES companies ON DELETE CASCADE,
    date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT max_equity_check CHECK ((equity < 1))
);

CREATE TABLE users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL, 
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    photo_url TEXT DEFAULT 'https://cdn3.vectorstock.com/i/1000x1000/21/62/human-icon-in-circle-vector-25482162.jp',
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TYPE enum AS ENUM ('interested', 'applied', 'accepted', 'rejected');

CREATE TABLE applications (
    username TEXT NOT NULL REFERENCES users ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES jobs ON DELETE CASCADE,
    state enum,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT app_pk PRIMARY KEY(username,job_id)
);

-- comment out below starting data if you connect to test database
INSERT INTO companies (handle, name, num_employees, description, logo_url) VALUES ('AAPL', 'Apple', 100000, 'tech company', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'), ('UNH', 'UnitedHealth Group', 100, 'health insurer', ''); 

INSERT INTO jobs (title, salary, equity, company_handle) VALUES ('owner', 1000000, 0.9, 'AAPL'), ('staff', 50000, 0, 'AAPL'), ('manager', 100000, 0, 'AAPL');

-- note all passwords are "password" - this is needed to login and obtain the token
INSERT INTO users (username, password, first_name, last_name, email, is_admin) VALUES ('janeDoe', '$2b$12$axV/r/mSTz0UnzFedqsC7ORBU1T4ENsRdqZvGiW14hzadUYMVH5Py', 'Jane', 'Doe', 'janeDoe@gmail.com', false), ('johnDoe', '$2b$12$axV/r/mSTz0UnzFedqsC7ORBU1T4ENsRdqZvGiW14hzadUYMVH5Py', 'John', 'Doe', 'johnDoe@gmail.com', false), ('mom', '$2b$12$axV/r/mSTz0UnzFedqsC7ORBU1T4ENsRdqZvGiW14hzadUYMVH5Py', 'Mom', 'User', 'mom@gmail.com', false), ('admin', '$2b$12$axV/r/mSTz0UnzFedqsC7ORBU1T4ENsRdqZvGiW14hzadUYMVH5Py', 'Admin', 'User', 'admin@gmail.com', true);

INSERT INTO applications (username, job_id, state) VALUES ('janeDoe', 1, 'interested'), ('janeDoe', 2, 'applied'), ('johnDoe', 2, 'applied');