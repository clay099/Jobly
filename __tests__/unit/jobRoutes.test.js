process.env.NODE_ENV = "test";
const request = require("supertest");
const db = require("../../db");
const app = require("../../app");
const Job = require("../../models/jobModel");
const Company = require("../../models/companyModel");
console.error = jest.fn();

describe("test job routes", () => {
	let j;
	let values;
	let company;
	beforeEach(async function () {
		values = {
			title: "manager",
			salary: 10000,
			equity: 0.54,
			company_handle: "AAPL",
		};
		await db.query("DELETE FROM jobs");
		await db.query("DELETE FROM companies");
		company = await Company.create({
			handle: "AAPL",
			name: "Apple",
			num_employees: 10000,
			description: "tech company",
			logo_url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
		});
		j = await Job.create(values);
		j.date_posted = expect.any(String);
	});
	describe("GET /jobs", () => {
		test("get all jobs", async () => {
			let resp = await request(app).get("/jobs");
			expect(resp.statusCode).toBe(200);

			expect(resp.body).toEqual({ jobs: [j] });
		});
	});
	describe("POST /jobs", () => {
		test("create a new job", async () => {
			v = {
				title: "Staff",
				salary: 50000,
				equity: 0.0,
				company_handle: "AAPL",
			};
			let resp = await request(app).post("/jobs").send(v);
			expect(resp.statusCode).toBe(201);
			v.date_posted = expect.any(String);
			v.id = expect.any(Number);
			expect(resp.body).toEqual({ job: v });
		});
		test("provides an error response if title, salary, equity and company_handle are not provided", async () => {
			let resp = await request(app).post("/jobs");
			expect(resp.statusCode).toBe(400);
			expect(resp.body.message).toEqual([
				'instance requires property "title"',
				'instance requires property "salary"',
				'instance requires property "equity"',
				'instance requires property "company_handle"',
			]);
		});
		test("provides an error response for incorrect paramter types", async () => {
			v = {
				title: 1,
				salary: [123445],
				equity: [123445],
				company_handle: 1,
			};
			let resp = await request(app).post("/jobs").send(v);
			expect(resp.statusCode).toBe(400);
			expect(resp.body.message).toEqual([
				"instance.title is not of a type(s) string",
				"instance.salary is not of a type(s) integer",
				"instance.equity is not of a type(s) number",
				"instance.company_handle is not of a type(s) string",
			]);
		});
	});
	describe("GET /jobs/:id", () => {
		test("get details for job", async () => {
			let resp = await request(app).get(`/jobs/${j.id}`);
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ job: j });
		});
		test("provides an error response if job can't be found", async () => {
			let resp = await request(app).get(`/jobs/1253`);
			expect(resp.statusCode).toBe(404);
			expect(resp.body.message).toEqual("Could not find job id: 1253");
		});
	});
	describe("/PATCH /jobs/:id", () => {
		beforeEach(async function () {
			await db.query("DELETE FROM jobs");
			j = await Job.create(values);
			j.date_posted = expect.any(String);
		});
		test("updates job details", async () => {
			update = {
				title: "Updatedtitle",
				salary: 1,
				equity: 0.11,
			};
			let resp = await request(app).patch(`/jobs/${j.id}`).send(update);
			j.title = "Updatedtitle";
			j.salary = 1;
			j.equity = 0.11;

			expect(resp.body).toEqual({ job: j });
			expect(resp.status).toEqual(200);
		});
		test("provides an error response for incorrect paramter types", async () => {
			update = {
				title: 1234,
				salary: [1],
				equity: [0.11],
			};
			let resp = await request(app).patch(`/jobs/${j.id}`).send(update);

			expect(resp.statusCode).toBe(400);
			expect(resp.body.message).toEqual([
				"instance.title is not of a type(s) string",
				"instance.salary is not of a type(s) integer",
				"instance.equity is not of a type(s) number",
			]);
		});
	});
	describe("DELETE /jobs/:id", () => {
		test("deletes a job based on the provided id", async () => {
			let resp = await request(app).delete(`/jobs/${j.id}`);
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ message: "Job deleted" });
		});
		test("provides an error response if the job can not be found", async () => {
			let resp = await request(app).delete(`/jobs/123456789`);
			expect(resp.statusCode).toBe(404);
			expect(resp.body.message).toEqual(`Could not find job id: 123456789`);
		});
	});
});
afterAll(async function () {
	await db.end();
});
