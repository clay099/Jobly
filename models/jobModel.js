const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const sqlForDelete = require("../helpers/removeFromDB");

/**collection of related methods for jobs */

class Job {
	constructor({ id, title, salary, equity, company_handle, date_posted }) {
		this.id = id;
		this.title = title;
		this.salary = salary;
		this.equity = equity;
		this.company_handle = company_handle;
		this.date_posted = date_posted;
	}

	/** creates a new job */
	static async create({ title, salary, equity, company_handle }) {
		const result = await db.query(
			`INSERT INTO jobs (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle, date_posted`,
			[title, salary, equity, company_handle]
		);
		const job = result.rows[0];

		if (job === undefined) {
			const err = new ExpressError("Could not create job", 400);
			throw err;
		}
		return new Job(job);
	}

	/** get all jobs */
	static async all() {
		const result = await db.query(
			`SELECT id, title, salary, equity, company_handle, date_posted FROM jobs ORDER BY company_handle, date_posted`
		);
		return result.rows.map((j) => new Job(j));
	}

	/** get job by id */
	static async get(id) {
		const result = await db.query(
			`SELECT id, title, salary, equity, company_handle, date_posted FROM jobs WHERE id=$1`,
			[id]
		);
		const job = result.rows[0];

		if (job === undefined) {
			const err = new ExpressError(`Could not find job id: ${id}`, 404);
			throw err;
		}
		return new Job(job);
	}

	/** update job
	 * - items: an object with keys of columns you want to update and values with updated values
	 */

	async update(items) {
		const updateData = sqlForPartialUpdate("jobs", items, "id", this.id);
		const result = await db.query(updateData.query, updateData.values);
		return result.rows[0];
	}

	/** remove job with matching id */
	static async remove(id) {
		let queryString = sqlForDelete("jobs", "id", id);
		const result = await db.query(queryString.query, [queryString.id]);

		if (result.rows.length === 0) {
			const err = new ExpressError(`Could not find job id: ${id}`, 404);
			throw err;
		}
		return "deleted";
	}

	/** match user with possible jobs based on matching technologies */
	static async match(username) {
		const result = await db.query(
			`SELECT j.id, j.title, j.salary, j.equity, j.company_handle, j.date_posted
            FROM users as u
            LEFT JOIN user_technologies AS ut ON ut.username = u.username
            INNER JOIN job_technologies AS jt ON ut.technologies_id = jt.technologies_id
            LEFT JOIN jobs AS j ON jt.job_id = j.id
            WHERE u.username=$1
            GROUP BY j.id`,
			[username]
		);
		let jobs = result.rows.map((j) => new Job(j));

		if (jobs.length === 0) {
			const err = new ExpressError(`Could not find any matching jobs`, 404);
			throw err;
		}
		return jobs;
	}
}

module.exports = Job;
