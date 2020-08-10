process.env.NODE_ENV = "test";
const request = require("supertest");
const queryStringHelp = require("../../helpers/queryString");

describe("queryStringHelp()", () => {
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
		let result = queryStringHelp(command, companies);
		expect(result).toEqual([c1]);
	});

	it("should filter a list of companies based on command 'min_employees' ", () => {
		let command = { min_employees: "1" };
		let result = queryStringHelp(command, companies);
		expect(result).toEqual([c1, c3]);
	});
	it("should filter a list of companies based on command 'max_employees' ", () => {
		let command = { max_employees: "1" };
		let result = queryStringHelp(command, companies);
		expect(result).toEqual([c2]);
	});

	it("should throw and express error if command min_employees is greater than max_employees", () => {
		let command = { max_employees: "1", min_employees: "10" };
		let result;
		try {
			// it should throw and ExpressError
			queryStringHelp(command, companies);
		} catch (e) {
			result = e;
		}
		expect(result.message).toEqual(
			"min_employees paramter is greater than max_employees paramter"
		);
		expect(result.status).toBe(400);
	});
});
