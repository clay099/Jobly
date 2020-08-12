const express = require("express");
const ExpressError = require("../helpers/expressError");
const Job = require("../models/jobModel");
const jsonschema = require("jsonschema");
const jobSchema = require("../schema/jobSchema.json");
const { jobQueryStringHelp } = require("../helpers/queryString");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");
const User = require("../models/userModel");
const Application = require("../models/applicationModel");
const appSchema = require("../schema/applicationSchema.json");
const { json } = require("express");

const router = new express.Router();

/** GET / {_token: tokenDate} => {jobs : [jobData], [job2Data], ...} */
router.get("/", ensureLoggedIn, async (req, res, next) => {
	try {
		let jobs = await Job.all();

		// if search terms are passed in the query string run helper function to filter results
		if (req.query) {
			jobs = jobQueryStringHelp(req.query, jobs);
		}

		return res.json({ jobs });
	} catch (e) {
		return next(e);
	}
});

/** POST / {jobData, _token: tokenDate} => {job: newJob} */
router.post("/", ensureIsAdmin, async (req, res, next) => {
	try {
		// try job against schema
		const result = jsonschema.validate(req.body, jobSchema);

		// if job fails against schema throw error
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}
		// we know job passes and create in DB and return as json
		const job = await Job.create(req.body);
		return res.status(201).json({ job });
	} catch (e) {
		return next(e);
	}
});

/** GET /[id] {_token: tokenDate} => {job: jobData} */
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
	try {
		const job = await Job.get(req.params.id);
		return res.json({ job });
	} catch (e) {
		return next(e);
	}
});

/** PATCH /[id] {jobData, _token: tokenDate} => {job: jobData} */
router.patch("/:id", ensureIsAdmin, async (req, res, next) => {
	try {
		let j = await Job.get(req.params.id);

		// if title, salary, equity, or company_handle has been provided in req.body update job details otherwise leave value
		j.title = req.body.title ? req.body.title : j.title;

		j.salary = req.body.salary ? req.body.salary : j.salary;

		j.equity = req.body.equity ? req.body.equity : j.equity;

		j.company_handle = req.body.company_handle ? req.body.company_handle : j.company_handle;

		// validate against schema
		const result = jsonschema.validate(
			{
				title: j.title,
				salary: j.salary,
				equity: j.equity,
				company_handle: j.company_handle,
			},
			jobSchema
		);
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}
		let job = await j.update(req.body);
		return res.json({ job });
	} catch (e) {
		return next(e);
	}
});

/** DELETE /[id] {_token: tokenDate} => {message: "Job deleted"} */
router.delete("/:id", ensureIsAdmin, async (req, res, next) => {
	try {
		await Job.remove(req.params.id);
		return res.json({ message: "Job deleted" });
	} catch (e) {
		return next(e);
	}
});

/**POST /[id]/apply {state: string-of-app-state, _token: tokenDate} => {message: "new-state"}*/
router.post("/:id/apply", ensureLoggedIn, async (req, res, next) => {
	try {
		let obj = { username: req.user.username, job_id: req.params.id, state: req.body.state };

		// try application against schema
		const result = jsonschema.validate(obj, appSchema);

		// if application fails against schema throw error
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}

		// we know job passes and create in DB and return as json. Note there may be issue with PK username or PK job_id not being found
		let application = await Application.create(obj);
		return res.json({ message: application.state });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
