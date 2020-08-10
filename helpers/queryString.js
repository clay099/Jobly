const ExpressError = require("./expressError");

/**generates a filtered list of companies based on passed query */
function companyQueryStringHelp(command, companies) {
	// if min_employees & max_employees is in the query string check that the min value is not greater than the max value.
	if (command.min_employees && command.max_employees) {
		if (command.min_employees > command.max_employees) {
			let err = new ExpressError(
				"min_employees paramter is greater than max_employees paramter",
				400
			);
			throw err;
		}
	}
	// if search is in the query string filter results by company name or handle
	if (command.search) {
		companies = companies.filter(
			(company) =>
				company.name.includes(command.search) || company.handle.includes(command.search)
		);
	}
	// if min_employees is in the query string filter results by min employees
	if (command.min_employees) {
		companies = companies.filter((company) => company.num_employees > command.min_employees);
	}
	// if max_employees is in the query string filter results by min employees
	if (command.max_employees) {
		companies = companies.filter((company) => company.num_employees < command.max_employees);
	}
	return companies;
}

/**generates a filtered list of jobs based on passed query */
function jobQueryStringHelp(command, jobs) {
	// if search is in the query string filter results by job title or company handle
	if (command.search) {
		jobs = jobs.filter(
			(job) =>
				job.title.includes(command.search) || job.company_handle.includes(command.search)
		);
	}
	// if min_salary is in the query string filter results by min salary
	if (command.min_salary) {
		jobs = jobs.filter((job) => job.min_salary > command.min_salary);
	}
	// if min_equity is in the query string filter results by min_equity
	if (command.min_equity) {
		jobs = jobs.filter((job) => job.min_equity > command.min_equity);
	}
	return jobs;
}

module.exports = { companyQueryStringHelp, jobQueryStringHelp };
