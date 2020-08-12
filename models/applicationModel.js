const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const sqlForDelete = require("../helpers/removeFromDB");

/**collection of related methods for applications */

class Application {
	constructor({ username, job_id, state, created_at }) {
		this.username = username;
		this.job_id = job_id;
		this.state = state;
		this.created_at = created_at;
	}

	/**create a new application */
	static async create({ username, job_id, state }) {
		const result = await db.query(
			`INSERT INTO applications (username, job_id, state)
            VALUES ($1, $2,$3)
            RETURNING *`,
			[username, job_id, state]
		);
		const app = result.rows[0];
		if (app === undefined) {
			const err = new ExpressError("Could not create application", 400);
			throw err;
		}
		return new Application(app);
	}

	/** get all applications */
	static async all() {
		const result = await db.query(
			`SELECT username, job_id, state, created_at FROM applications ORDER BY username`
		);
		return result.rows.map((a) => new Application(a));
	}
	/** update application
	 * - items: an object with keys of columns you want to update and values with updated values
	 */

	async update(items) {
		const updateData = sqlForPartialUpdate(
			"applications",
			items,
			"app_pk",
			this.username.concat(" ", this.job_id)
		);
		const result = await db.query(updateData.query, updateData.values);
		return result.rows[0];
	}

	/** remove application with matching PK */
	static async remove(username, job_id) {
		let PK = username.concat(" ", job_id);
		let queryString = sqlForDelete("companies", "handle", PK);
		const result = await db.query(queryString.query, [queryString.id]);

		if (result.rows.length === 0) {
			const err = new ExpressError(
				`Could not find application for username: ${username}, with job_id: ${job_id}`,
				404
			);
			throw err;
		}
		return "deleted";
	}
}

module.exports = Application;
