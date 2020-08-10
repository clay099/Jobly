process.env.NODE_ENV = "test";
const request = require("supertest");
const db = require("../../db");
const app = require("../../app");
const Company = require("../../models/companyModel");
const Job = require("../../models/jobModel");
console.error = jest.fn();

describe("test company routes", () => {
	let c;
	let values;
	beforeEach(async function () {
		values = {
			handle: "AAPL",
			name: "Apple",
			num_employees: 10000,
			description: "tech company",
			logo_url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
		};
		await db.query("DELETE FROM companies");
		c = await Company.create(values);
	});
	describe("GET /companies", () => {
		test("get all companies", async () => {
			let resp = await request(app).get("/companies");
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ companies: [c] });
		});
	});
	describe("POST /companies", () => {
		test("creates a company", async () => {
			v = {
				handle: "UNH",
				name: "UnitedHealthGroup",
				num_employees: 10,
				description: "Health company",
				logo_url:
					"https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
			};
			let resp = await request(app).post("/companies").send(v);
			expect(resp.statusCode).toBe(201);
			expect(resp.body).toEqual({ company: v });
		});
		test("provides an error response if handle is not provided", async () => {
			v = {
				name: "UnitedHealthGroup",
				num_employees: 10,
				description: "Health company",
				logo_url:
					"https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
			};
			let resp = await request(app).post("/companies").send(v);
			expect(resp.body.status).toBe(400);
			expect(resp.body.message).toEqual(['instance requires property "handle"']);
		});
		test("provides an error response if name is not provided", async () => {
			v = {
				handle: "UNH",
				num_employees: 10,
				description: "Health company",
				logo_url:
					"https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
			};
			let resp = await request(app).post("/companies").send(v);
			expect(resp.body.status).toBe(400);
			expect(resp.body.message).toEqual(['instance requires property "name"']);
		});
		test("provides an error response for incorrect paramter types", async () => {
			v = {
				handle: 1,
				name: 1,
				description: 1,
				logo_url: 1,
			};
			let resp = await request(app).post("/companies").send(v);
			expect(resp.statusCode).toBe(400);
			expect(resp.body.message).toEqual([
				"instance.handle is not of a type(s) string",
				"instance.name is not of a type(s) string",
				"instance.description is not of a type(s) string",
				"instance.logo_url is not of a type(s) string",
			]);
		});
	});
	describe("GET /companies/:handle", () => {
		test("get details on company when there is no job data", async () => {
			let resp = await request(app).get(`/companies/${values.handle}`);
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ company: c });
		});
		test("get details on company when is also job data", async () => {
			let job = await Job.create({
				title: "owner",
				salary: 100000,
				equity: 0.9,
				company_handle: values.handle,
			});
			let resp = await request(app).get(`/companies/${values.handle}`);
			c.jobs = [
				{
					title: job.title,
					salary: job.salary,
					equity: job.equity,
					id: job.id,
					date_posted: expect.any(String),
				},
			];

			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ company: c });
		});
		test("provides an error response if company can't be found", async () => {
			let resp = await request(app).get(`/companies/invalid`);
			expect(resp.statusCode).toBe(404);
			expect(resp.body.message).toEqual("Could not find company handle: invalid");
		});
	});
	describe("PATCH /companies/:handle", () => {
		test("update company details", async () => {
			update = {
				name: "updatedName",
				num_employees: 1234567,
				description: "updatedDescription",
				logo_url: "updatedURL",
			};

			let resp = await request(app).patch(`/companies/${values.handle}`).send(update);
			c.name = update.name;
			c.num_employees = update.num_employees;
			c.description = update.description;
			c.logo_url = update.logo_url;

			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ company: c });
		});
		test("provides an error response for incorrect paramter types", async () => {
			updatedValues = {
				handle: 1,
				name: 1,
				description: 1,
				logo_url: 1,
			};
			let resp = await request(app).patch(`/companies/${values.handle}`).send(updatedValues);
			expect(resp.statusCode).toBe(400);
			expect(resp.body.message).toEqual([
				"instance.name is not of a type(s) string",
				"instance.description is not of a type(s) string",
				"instance.logo_url is not of a type(s) string",
			]);
		});
	});
	describe("DELETE /companies/:handle", () => {
		test("deletes a company based on the provided handle", async () => {
			let resp = await request(app).delete(`/companies/${values.handle}`);
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ message: "Company deleted" });
		});
		test("provides an error response if the company can not be found", async () => {
			let resp = await request(app).delete(`/companies/invalid`);
			expect(resp.statusCode).toBe(404);
			expect(resp.body.message).toEqual(`Could not find company handle: invalid`);
		});
	});
});
afterAll(async function () {
	await db.end();
});
