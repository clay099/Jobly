const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const sqlForDelete = require("../helpers/removeFromDB");

/**collection of related methods for companies */

class Company {
	constructor({ handle, name, num_employees, description, logo_url }) {
		this.handle = handle;
		this.name = name;
		this.num_employees = num_employees;
		this.description = description;
		this.logo_url = logo_url;
	}

	/** create a new company */
	static async create({ handle, name, num_employees, description, logo_url }) {
		//add default values
		num_employees = num_employees === undefined ? 0 : num_employees;
		description = description === undefined ? "" : description;
		logo_url = logo_url === undefined ? "" : logo_url;

		const result = await db.query(
			`INSERT INTO companies (handle, name, num_employees, description, logo_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
			[handle, name, num_employees, description, logo_url]
		);
		const comp = result.rows[0];

		if (comp === undefined) {
			const err = new ExpressError("Could not create company", 400);
			throw err;
		}
		return new Company(comp);
	}

	/** get all companies */
	static async all() {
		const result = await db.query(
			`SELECT handle, name, num_employees, description, logo_url FROM companies ORDER BY handle`
		);
		return result.rows.map((r) => new Company(r));
	}

	/** get company by handle */
	static async get(handle) {
		const result = await db.query(
			`SELECT c.handle, c.name, c.num_employees, c.description, c.logo_url, j.id, j.title, j.salary, j.equity, j.date_posted
            FROM companies AS c
            JOIN jobs AS j ON c.handle = j.company_handle
            WHERE c.handle=$1`,
			[handle]
		);
		const comp = result.rows[0];

		if (comp === undefined) {
			const err = new ExpressError(`Could not find company handle: ${handle}`, 404);
			throw err;
		}
		let c = new Company(comp);
		c.jobs = result.rows.map((j) => ({
			id: j.id,
			title: j.title,
			salary: j.salary,
			equity: j.equity,
			date_posted: j.date_posted,
		}));
		return c;
	}

	/** update company
	 * - items: an object with keys of columns you want to update and values with updated values
	 */

	async update(items) {
		const updateData = sqlForPartialUpdate("companies", items, "handle", this.handle);
		const result = await db.query(updateData.query, updateData.values);
		return result.rows[0];
	}

	/** remove company with matching handle */
	static async remove(handle) {
		let queryString = sqlForDelete("companies", "handle", handle);
		const result = await db.query(queryString.query, [queryString.id]);

		if (result.rows.length === 0) {
			const err = new ExpressError(`Could not find company handle: ${handle}`, 404);
			throw err;
		}
		return "deleted";
	}
}

module.exports = Company;
