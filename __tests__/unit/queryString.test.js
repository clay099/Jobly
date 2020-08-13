process.env.NODE_ENV = "test";
const { companyQueryStringHelp, jobQueryStringHelp } = require("../../helpers/queryString");
console.error = jest.fn();

jest.setTimeout(10000);
describe("companyQueryStringHelp()", () => {
	let companies;
	let c1;
	let c2;
	let c3;
	beforeEach(function () {
		c1 = {
			handle: "APPL",
			name: "Apple Inc",
			num_employees: 10,
			description: "One of the biggest tech companies in the world",
			logo_url: "https://cdn3.iconfinder.com/data/icons/picons-social/57/56-apple-512.png",
		};
		c2 = {
			handle: "UNH",
			name: "UnitedHealth Group",
			num_employees: 0,
		};
		c3 = {
			handle: "MSFT",
			name: "Microsoft",
			num_employees: 100000,
		};
		companies = [c1, c2, c3];
	});

	it("should filter a list of companies based on command 'search' ", () => {
		let command = { search: "Apple" };
		let result = companyQueryStringHelp(command, companies);
		expect(result).toEqual([c1]);
	});

	it("should filter a list of companies based on command 'min_employees' ", () => {
		let command = { min_employees: "1" };
		let result = companyQueryStringHelp(command, companies);
		expect(result).toEqual([c1, c3]);
	});
	it("should filter a list of companies based on command 'max_employees' ", () => {
		let command = { max_employees: "1" };
		let result = companyQueryStringHelp(command, companies);
		expect(result).toEqual([c2]);
	});

	it("should throw and express error if command min_employees is greater than max_employees", () => {
		let command = { max_employees: "1", min_employees: "10" };
		let result;
		try {
			// it should throw and ExpressError
			companyQueryStringHelp(command, companies);
		} catch (e) {
			result = e;
		}
		expect(result.message).toEqual(
			"min_employees paramter is greater than max_employees paramter"
		);
		expect(result.status).toBe(400);
	});
});

describe("jobQueryStringHelp()", () => {
	let jobs;
	let j1;
	let j2;
	let j3;
	beforeEach(function () {
		j1 = {
			title: "manager",
			salary: 50000,
			equity: 0.1,
			company_handle: "APPL",
		};
		j2 = {
			title: "Owner",
			salary: 100000,
			equity: 0.9,
			company_handle: "UNH",
		};
		j3 = {
			title: "Waiter",
			salary: 10000,
			equity: 0.0,
			company_handle: "APPL",
		};
		jobs = [j1, j2, j3];
	});

	it("should filter a list of jobs based on command 'search' (search term is title)", () => {
		let command = { search: "Own" };
		let result = jobQueryStringHelp(command, jobs);
		expect(result).toEqual([j2]);
	});

	it("should filter a list of jobs based on command 'search' (search term matches company_handle) ", () => {
		let command = { search: "APPL" };
		let result = jobQueryStringHelp(command, jobs);
		expect(result).toEqual([j1, j3]);
	});

	it("should filter a list of jobs based on command 'min_salary' ", () => {
		let command = { min_salary: "90000" };
		let result = jobQueryStringHelp(command, jobs);
		expect(result).toEqual([j2]);
	});
	it("should filter a list of jobs based on command 'min_salary' ", () => {
		let command = { min_equity: "0.01" };
		let result = jobQueryStringHelp(command, jobs);
		expect(result).toEqual([j1, j2]);
	});
});
