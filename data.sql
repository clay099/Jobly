CREATE TABLE companies (
    handle TEXT PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees INTEGER,
    description TEXT,
    logo_url TEXT
)