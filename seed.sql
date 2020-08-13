INSERT INTO companies (handle, name, num_employees, description, logo_url) VALUES ('AAPL', 'Apple', 100000, 'tech company', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'), ('UNH', 'UnitedHealth Group', 100, 'health insurer', ''); 

INSERT INTO jobs (title, salary, equity, company_handle) VALUES ('owner', 1000000, 0.9, 'AAPL'), ('staff', 50000, 0, 'AAPL'), ('manager', 100000, 0, 'AAPL');

-- note all passwords are "password" - this is needed to login and obtain the token
INSERT INTO users (username, password, first_name, last_name, email, is_admin) VALUES ('janeDoe', '$2b$12$axV/r/mSTz0UnzFedqsC7ORBU1T4ENsRdqZvGiW14hzadUYMVH5Py', 'Jane', 'Doe', 'janeDoe@gmail.com', false), ('johnDoe', '$2b$12$axV/r/mSTz0UnzFedqsC7ORBU1T4ENsRdqZvGiW14hzadUYMVH5Py', 'John', 'Doe', 'johnDoe@gmail.com', false), ('mom', '$2b$12$axV/r/mSTz0UnzFedqsC7ORBU1T4ENsRdqZvGiW14hzadUYMVH5Py', 'Mom', 'User', 'mom@gmail.com', false), ('admin', '$2b$12$axV/r/mSTz0UnzFedqsC7ORBU1T4ENsRdqZvGiW14hzadUYMVH5Py', 'Admin', 'User', 'admin@gmail.com', true);

INSERT INTO applications (username, job_id, state) VALUES ('janeDoe', 1, 'interested'), ('janeDoe', 2, 'applied'), ('johnDoe', 2, 'applied');

INSERT INTO technologies (technology) VALUES ('Python'), ('JavaScript'), ('Ruby'), ('HTML'), ('C++'), ('Java'), ('CSS');

INSERT INTO job_technologies (job_id, technologies_id) VALUES (1, 1), (1, 2), (1, 4), (2, 1), (3, 6);

INSERT INTO user_technologies (username, technologies_id) VALUES ('janeDoe', 1), ('janeDoe', 2), ('janeDoe', 4), ('janeDoe', 5), ('janeDoe', 6), ('janeDoe', 7), ('johnDoe', 1), ('johnDoe', 2), ('johnDoe', 3);
