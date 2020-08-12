process.env.NODE_ENV = "test";
const request = require("supertest");
const db = require("../../db");
const app = require("../../app");
const Job = require("../../models/jobModel");
const Company = require("../../models/companyModel");
const User = require("../../models/userModel");
const Application = require("../../models/applicationModel");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../../config");
console.error = jest.fn();

describe("test job routes", () => {
	let j;
	let values;
	let company;
	// create token don't actually go into DB and add user
	let adminUserToken = jwt.sign({ username: "testUser", is_admin: true }, JWT_SECRET_KEY);
	let generalUserToken = jwt.sign({ username: "testUser", is_admin: false }, JWT_SECRET_KEY);
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
		test("get all jobs when admin is logged in", async () => {
			let resp = await await request(app).get("/jobs").send({
				_token: adminUserToken,
			});
			expect(resp.statusCode).toBe(200);

			expect(resp.body).toEqual({ jobs: [j] });
		});
		test("get all jobs when general user is logged in", async () => {
			let resp = await await request(app).get("/jobs").send({
				_token: generalUserToken,
			});
			expect(resp.statusCode).toBe(200);

			expect(resp.body).toEqual({ jobs: [j] });
		});
		test("provide an error if no user is logged in", async () => {
			let resp = await await request(app).get("/jobs");
			expect(resp.statusCode).toBe(401);

			expect(resp.body.message).toEqual("Unauthorized");
		});
	});
	describe("POST /jobs", () => {
		test("create a new job when admin is logged in", async () => {
			v = {
				title: "Staff",
				salary: 50000,
				equity: 0.0,
				company_handle: "AAPL",
				_token: adminUserToken,
			};
			let resp = await request(app).post("/jobs").send(v);
			expect(resp.statusCode).toBe(201);
			v.date_posted = expect.any(String);
			v.id = expect.any(Number);
			delete v._token;
			expect(resp.body).toEqual({ job: v });
		});
		test("provides an error response if title, salary, equity and company_handle are not provided", async () => {
			let resp = await request(app).post("/jobs").send({ _token: adminUserToken });
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
				_token: adminUserToken,
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
		test("provides an error message if general user is logged in", async () => {
			v = {
				title: "Staff",
				salary: 50000,
				equity: 0.0,
				company_handle: "AAPL",
				_token: generalUserToken,
			};
			let resp = await request(app).post("/jobs").send(v);
			expect(resp.statusCode).toBe(401);
			expect(resp.body.message).toEqual("Unauthorized");
		});
		test("provides an error message if no user is logged in", async () => {
			v = {
				title: "Staff",
				salary: 50000,
				equity: 0.0,
				company_handle: "AAPL",
			};
			let resp = await request(app).post("/jobs").send(v);
			expect(resp.statusCode).toBe(401);
			expect(resp.body.message).toEqual("Unauthorized");
		});
	});
	describe("GET /jobs/:id", () => {
		test("get details for job when admin is logged in", async () => {
			let resp = await request(app).get(`/jobs/${j.id}`).send({ _token: adminUserToken });
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ job: j });
		});
		test("get details for job when general user is logged in", async () => {
			let resp = await request(app).get(`/jobs/${j.id}`).send({ _token: generalUserToken });
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ job: j });
		});
		test("provides an error response no user is logged in", async () => {
			let resp = await request(app).get(`/jobs/${j.id}`);
			expect(resp.statusCode).toBe(401);
			expect(resp.body.message).toEqual("Unauthorized");
		});
		test("provides an error response if job can't be found", async () => {
			let resp = await request(app).get(`/jobs/1253`).send({ _token: adminUserToken });
			expect(resp.statusCode).toBe(404);
			expect(resp.body.message).toEqual("Could not find job id: 1253");
		});
	});
	describe("PATCH /jobs/:id", () => {
		beforeEach(async function () {
			await db.query("DELETE FROM jobs");
			j = await Job.create(values);
			j.date_posted = expect.any(String);
		});
		test("updates job details when admin is logged in", async () => {
			update = {
				title: "Updatedtitle",
				salary: 1,
				equity: 0.11,
				_token: adminUserToken,
			};
			let resp = await request(app).patch(`/jobs/${j.id}`).send(update);
			j.title = "Updatedtitle";
			j.salary = 1;
			j.equity = 0.11;

			expect(resp.body).toEqual({ job: j });
			expect(resp.status).toEqual(200);
		});
		test("provides an error response for incorrect paramter types when admin is logged in", async () => {
			update = {
				title: 1234,
				salary: [1],
				equity: [0.11],
				_token: adminUserToken,
			};
			let resp = await request(app).patch(`/jobs/${j.id}`).send(update);

			expect(resp.statusCode).toBe(400);
			expect(resp.body.message).toEqual([
				"instance.title is not of a type(s) string",
				"instance.salary is not of a type(s) integer",
				"instance.equity is not of a type(s) number",
			]);
		});
		test("provides an error response if general user is logged in", async () => {
			update = {
				title: "Updatedtitle",
				salary: 1,
				equity: 0.11,
				_token: generalUserToken,
			};
			let resp = await request(app).patch(`/jobs/${j.id}`).send(update);

			expect(resp.body.message).toEqual("Unauthorized");
			expect(resp.status).toEqual(401);
		});
		test("provides an error response if general user is logged in", async () => {
			update = {
				title: "Updatedtitle",
				salary: 1,
				equity: 0.11,
			};
			let resp = await request(app).patch(`/jobs/${j.id}`).send(update);

			expect(resp.body.message).toEqual("Unauthorized");
			expect(resp.status).toEqual(401);
		});
	});
	describe("DELETE /jobs/:id", () => {
		test("deletes a job based on the provided id when admin user is logged in", async () => {
			let resp = await request(app).delete(`/jobs/${j.id}`).send({ _token: adminUserToken });
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ message: "Job deleted" });
		});
		test("provides an error response if the job can not be found when admin user is logged in", async () => {
			let resp = await request(app)
				.delete(`/jobs/123456789`)
				.send({ _token: adminUserToken });
			expect(resp.statusCode).toBe(404);
			expect(resp.body.message).toEqual(`Could not find job id: 123456789`);
		});
		test("provides an error response general user is logged in", async () => {
			let resp = await request(app)
				.delete(`/jobs/${j.id}`)
				.send({ _token: generalUserToken });
			expect(resp.statusCode).toBe(401);
			expect(resp.body.message).toEqual("Unauthorized");
		});
		test("provides an error response no user is logged in", async () => {
			let resp = await request(app).delete(`/jobs/${j.id}`);
			expect(resp.statusCode).toBe(401);
			expect(resp.body.message).toEqual("Unauthorized");
		});
	});
	describe("/POST /jobs/[id]/apply", () => {
		beforeEach(async function () {
			await db.query("DELETE FROM applications");
			await db.query("DELETE FROM jobs");
			await db.query("DELETE FROM users");
			j = await Job.create(values);
			j.date_posted = expect.any(String);
		});
		test("apply for job when user is logged in", async () => {
			let u = await User.create({
				username: "testUser",
				password: "testPW",
				first_name: "first",
				last_name: "last",
				email: "test@gmail.com",
				photo_url:
					"https://image.shutterstock.com/image-vector/user-icon-trendy-flat-style-260nw-418179856.jpg",
				is_admin: true,
			});
			let resp = await request(app).post(`/jobs/${j.id}/apply`).send({
				state: "interested",
				_token: adminUserToken,
			});
			expect(resp.body).toEqual({ message: "interested" });
			expect(resp.status).toBe(201);
		});
		test("provide an error is user is not logged in", async () => {
			let u = await User.create({
				username: "testUser",
				password: "testPW",
				first_name: "first",
				last_name: "last",
				email: "test@gmail.com",
				photo_url:
					"https://image.shutterstock.com/image-vector/user-icon-trendy-flat-style-260nw-418179856.jpg",
				is_admin: true,
			});
			let resp = await request(app).post(`/jobs/${j.id}/apply`).send({
				state: "interested",
			});
			expect(resp.body.message).toEqual("Unauthorized");
			expect(resp.status).toBe(401);
		});
		test("provide an error if state is not valid", async () => {
			let u = await User.create({
				username: "testUser",
				password: "testPW",
				first_name: "first",
				last_name: "last",
				email: "test@gmail.com",
				photo_url:
					"https://image.shutterstock.com/image-vector/user-icon-trendy-flat-style-260nw-418179856.jpg",
				is_admin: true,
			});
			let resp = await request(app).post(`/jobs/${j.id}/apply`).send({
				state: "invalid",
				_token: adminUserToken,
			});
			expect(resp.status).toBe(400);
			expect(resp.body.message).toEqual([
				"instance.state is not one of enum values: interested,applied,accepted,rejected",
			]);
		});
	});
});
afterAll(async function () {
	await db.query("DELETE FROM applications");
	await db.query("DELETE FROM companies");
	await db.query("DELETE FROM jobs");
	await db.query("DELETE FROM users");
	await db.end();
});
