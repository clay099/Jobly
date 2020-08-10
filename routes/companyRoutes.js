const express = require("express");
const ExpressError = require("../helpers/expressError");
const Company = require("../models/companyModel");
const jsonschema = require("jsonschema");
const companySchema = require("../schema/companySchema.json");
const companyQueryStringHelp = require("../helpers/queryString");

const router = new express.Router();

/** GET / => {companies : [companyData], [company2Data], ...} */
router.get("/", async (req, res, next) => {
	try {
		let companies = await Company.all();

		// if search terms are passed in the query string run helper function to filter results
		if (req.query) {
			companies = companyQueryStringHelp(req.query, companies);
		}

		return res.json({ companies });
	} catch (e) {
		return next(e);
	}
});

/** POST / companyData => {company: newCompany} */
router.post("/", async (req, res, next) => {
	try {
		// try company against schema
		const result = jsonschema.validate(req.body, companySchema);

		// if company fails against schema throw error
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}
		// we know company passes and create in DB and return as json
		const company = await Company.create(req.body);
		return res.status(201).json({ company });
	} catch (e) {
		return next(e);
	}
});

/** GET /[handle] => {company: companyData} */
router.get("/:handle", async (req, res, next) => {
	try {
		const company = await Company.get(req.params.handle);
		return res.json({ company });
	} catch (e) {
		return next(e);
	}
});

/** PATCH /[handle] => {company: companyData} */
router.patch("/:handle", async (req, res, next) => {
	try {
		let comp = await Company.get(req.params.handle);

		// if name, num_employees, description or logo_url has been provided in req.body update company details otherwise leave value
		comp.name = req.body.name ? req.body.name : comp.name;

		comp.num_employees = req.body.num_employees ? req.body.num_employees : comp.num_employees;

		comp.description = req.body.description ? req.body.description : comp.description;

		comp.logo_url = req.body.logo_url ? req.body.logo_url : comp.logo_url;

		// validate against schema
		const result = jsonschema.validate(comp, companySchema);
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}
		let company = await comp.update(req.body);
		return res.json({ company });
	} catch (e) {
		return next(e);
	}
});

/** DELETE /[handle] => {message: "Company deleted"} */
router.delete("/:handle", async (req, res, next) => {
	try {
		await Company.remove(req.params.handle);
		return res.json({ message: "Company deleted" });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
