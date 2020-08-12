const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const sqlForDelete = require("../helpers/removeFromDB");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, JWT_SECRET_KEY } = require("../config");

/**collection of related methods for user */

class User {
	constructor({ username, password, first_name, last_name, email, photo_url, is_admin }) {
		this.username = username;
		this.password = password;
		this.first_name = first_name;
		this.last_name = last_name;
		this.email = email;
		this.photo_url = photo_url;
		this.is_admin = is_admin;
	}

	/** creates a new user */
	static async create({
		username,
		password,
		first_name,
		last_name,
		email,
		photo_url = "https://cdn3.vectorstock.com/i/1000x1000/21/62/human-icon-in-circle-vector-25482162.jpg",
		is_admin = false,
	}) {
		const hashedPW = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
		const result = await db.query(
			`INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING username, password, first_name, last_name, email, photo_url, is_admin`,
			[username, hashedPW, first_name, last_name, email, photo_url, is_admin]
		);
		const user = result.rows[0];

		if (user === undefined) {
			const err = new ExpressError("Could not create user", 400);
			throw err;
		}
		return new User(user);
	}
	/** get all users */
	static async all() {
		const result = await db.query(
			`SELECT username, first_name, last_name, email FROM users ORDER BY last_name, first_name`
		);
		return result.rows.map((u) => new User(u));
	}
	/** get user by username */
	static async get(username) {
		const result = await db.query(
			`SELECT u.username, u.first_name, u.last_name, u.email, a.state, j.id, j.company_handle, j.title, j.salary, j.equity, j.date_posted
            FROM users AS u
            LEFT JOIN applications AS a ON a.username = u.username
            LEFT JOIN jobs AS j ON j.id = a.job_id
            WHERE u.username=$1`,
			[username]
		);
		const user = result.rows[0];

		if (user === undefined) {
			const err = new ExpressError(`Could not find User username: ${username}`, 404);
			throw err;
		}
		let u = new User(user);
		let jobs = result.rows
			// filters out rows which don't have an job id
			.filter((j) => j.id)
			// for rows which have values put in a list
			.map((j) => ({
				company_handle: j.company_handle,
				id: j.id,
				title: j.title,
				salary: j.salary,
				equity: j.equity,
				date_posted: j.date_posted,
				state: j.state,
			}));
		// if list if empty do nothing, otherwise add list to u object
		if (jobs.length !== 0) {
			u.jobs = jobs;
		}
		return u;
	}
	/** get all user details by username */
	static async getAll(username) {
		const result = await db.query(
			`SELECT username, password, first_name, last_name, email, photo_url, is_admin FROM users WHERE username=$1`,
			[username]
		);
		const user = result.rows[0];

		if (user === undefined) {
			const err = new ExpressError(`Could not find User username: ${username}`, 404);
			throw err;
		}
		return new User(user);
	}

	/** update user
	 * - items: an object with keys of columns you want to update and values with updated values
	 */

	async update(items) {
		if (items.password) {
			items.password = await bcrypt.hash(items.password, BCRYPT_WORK_FACTOR);
		}
		const updateData = sqlForPartialUpdate("users", items, "username", this.username);
		const result = await db.query(updateData.query, updateData.values);
		let u = result.rows[0];

		// remove sensitive information
		delete u.password;
		delete u.is_admin;

		return u;
	}

	/** remove user with matching username */
	static async remove(username) {
		let queryString = sqlForDelete("users", "username", username);
		const result = await db.query(queryString.query, [queryString.id]);

		if (result.rows.length === 0) {
			const err = new ExpressError(`Could not find user username: ${username}`, 404);
			throw err;
		}
		return "deleted";
	}

	async authenticate(password) {
		if ((await bcrypt.compare(password, this.password)) === true) {
			let token = jwt.sign(
				{ username: this.username, is_admin: this.is_admin },
				JWT_SECRET_KEY
			);
			return token;
		}
		const err = new ExpressError(`Invalid username/password`, 400);
		throw err;
	}
}

module.exports = User;
