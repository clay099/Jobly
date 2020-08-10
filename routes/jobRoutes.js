const express = require("express");
const ExpressError = require("../helpers/expressError");
const Job = require("../models/jobModel");
const jsonschema = require("jsonschema");
const jobSchema = require("../schema/jobSchema.json");
const jobQueryStringHelp = require("../helpers/queryString");

const router = new express.Router();

/** GET / => {jobs : [jobData], [job2Data], ...} */
router.get("/", async (req, res, next) => {
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

/** POST / jobData => {job: newJob} */
router.post("/", async (req, res, next) => {
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

/** GET /[id] => {job: jobData} */
router.get("/:id", async (req, res, next) => {
	try {
		const job = await Job.get(req.params.id);
		return res.json({ job });
	} catch (e) {
		return next(e);
	}
});

/** PATCH /[id] => {job: jobData} */
router.patch("/:id", async (req, res, next) => {
	try {
		let job = await Job.get(req.params.id);

		// if title, salary, equity, or company_handle has been provided in req.body update job details otherwise leave value
		job.title = req.body.title ? req.body.title : job.title;

		job.salary = req.body.salary ? req.body.salary : job.salary;

		job.equity = req.body.equity ? req.body.equity : job.equity;

		job.company_handle = req.body.company_handle ? req.body.company_handle : job.company_handle;

		// validate against schema
		const result = jsonschema.validate(
			{
				title: job.title,
				salary: job.salary,
				equity: job.equity,
				company_handle: job.company_handle,
			},
			jobSchema
		);
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}
		let job = await job.update(req.body);
		return res.json({ job });
	} catch (e) {
		return next(e);
	}
});

/** DELETE /[id] => {message: "Job deleted"} */
router.delete("/:id", async (req, res, next) => {
	try {
		await Job.remove(req.params.id);
		return res.json({ message: "Job deleted" });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
