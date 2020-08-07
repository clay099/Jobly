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
	static async create(handle, name, num_employees, description, logo_url) {
		const result = await db.query(
			`INSERT INTO companies (handle, name, num_employees, description, logo_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
			[handle, name, num_employees, description, logo_url]
		);
		const comp = result.rows[0];

		if (comp === undefined) {``
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
			`SELECT handle, name, num_employees, description, logo_url FROM companies WHERE handle=$1`,
			handle
		);
		const comp = result.rows[0];

		if (comp === undefined) {
			const err = new ExpressError(`Could not find company: ${handle}`, 404);
			throw err;
		}
		return new Company(comp);
	}

	/** update company
	 * - items: an object with keys of columns you want to update and values with updated values
	 */

	async update(items) {
		const updateData = sqlForPartialUpdate("companies", items, "handle", this.handle);
		const result = await db.query(updateData);
		return ({ handle, name, num_employees, description, logo_url } = result.rows[0]);
	}

	/** remove company with matching handle */
	static async remove(handle) {
		let queryString = sqlForDelete("companies", "handle", handle);
		const result = await db.query(queryString);

		if (result.rows.length === 0) {
			const err = new ExpressError(`Could not find company: ${handle}`, 404);
			throw err;
		}
	}
}

module.exports = Company;
