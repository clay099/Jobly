process.env.NODE_ENV = "test";
const request = require("supertest");
const db = require("../../db");
const app = require("../../app");
const Company = require("../../models/companyModel");
const Job = require("../../models/jobModel");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../../config");
console.error = jest.fn();

// create token don't actually go into DB and add user
let adminUserToken = jwt.sign({ username: "testUser", is_admin: true }, JWT_SECRET_KEY);
let generalUserToken = jwt.sign({ username: "testUser", is_admin: false }, JWT_SECRET_KEY);
let c;
let values;
describe("test company routes", () => {
	beforeEach(async function () {
		await db.query("DELETE FROM jobs");
		await db.query("DELETE FROM companies");
		values = {
			handle: "AAPL",
			name: "Apple",
			num_employees: 10000,
			description: "tech company",
			logo_url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
		};
		c = await Company.create(values);
	});
	describe("GET /companies", () => {
		test("get all companies with logged in admin user", async () => {
			let resp = await request(app).get("/companies").send({ _token: adminUserToken });
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ companies: [c] });
		});
		test("get all companies with logged in general user", async () => {
			let resp = await request(app).get("/companies").send({ _token: generalUserToken });
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ companies: [c] });
		});
		test("return error if user is not logged in", async () => {
			let resp = await request(app).get("/companies");
			expect(resp.statusCode).toBe(401);
			expect(resp.body.message).toEqual("Unauthorized");
		});
	});
	describe("POST /companies", () => {
		test("creates a company with logged in admin user", async () => {
			v = {
				handle: "UNH",
				name: "UnitedHealthGroup",
				num_employees: 10,
				description: "Health company",
				logo_url:
					"https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
				_token: adminUserToken,
			};
			let resp = await request(app).post("/companies").send(v);
			expect(resp.statusCode).toBe(201);
			delete v._token;
			expect(resp.body).toEqual({ company: v });
		});
		test("return error if user is not logged in", async () => {
			v = {
				handle: "UNH",
				name: "UnitedHealthGroup",
				num_employees: 10,
				description: "Health company",
				logo_url:
					"https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
			};
			let resp = await request(app).post("/companies").send(v);
			expect(resp.statusCode).toBe(401);
			expect(resp.body.message).toEqual("Unauthorized");
		});
		test("return error if user is not an admin", async () => {
			v = {
				handle: "UNH",
				name: "UnitedHealthGroup",
				num_employees: 10,
				description: "Health company",
				logo_url:
					"https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
				_token: generalUserToken,
			};
			let resp = await request(app).post("/companies").send(v);
			expect(resp.statusCode).toBe(401);
			expect(resp.body.message).toEqual("Unauthorized");
		});
		test("provides an error response if handle is not provided", async () => {
			v = {
				name: "UnitedHealthGroup",
				num_employees: 10,
				description: "Health company",
				logo_url:
					"https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
				_token: adminUserToken,
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
				_token: adminUserToken,
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
				_token: adminUserToken,
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
		test("get details on company when there is no job data and admin is logged in", async () => {
			let resp = await request(app)
				.get(`/companies/${values.handle}`)
				.send({ _token: adminUserToken });
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ company: c });
		});
		test("get details on company when there is no job data and general user is logged in", async () => {
			let resp = await request(app)
				.get(`/companies/${values.handle}`)
				.send({ _token: generalUserToken });
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ company: c });
		});
		test("get details on company when it has job data and admin is logged in", async () => {
			let job = await Job.create({
				title: "owner",
				salary: 100000,
				equity: 0.9,
				company_handle: values.handle,
			});
			let resp = await request(app)
				.get(`/companies/${values.handle}`)
				.send({ _token: adminUserToken });
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
		test("get details on company when it has job data and general user is logged in", async () => {
			let job = await Job.create({
				title: "owner",
				salary: 100000,
				equity: 0.9,
				company_handle: values.handle,
			});
			let resp = await request(app)
				.get(`/companies/${values.handle}`)
				.send({ _token: generalUserToken });
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
			let resp = await request(app)
				.get(`/companies/invalid`)
				.send({ _token: generalUserToken });
			expect(resp.statusCode).toBe(404);
			expect(resp.body.message).toEqual("Could not find company handle: invalid");
		});
		test("provides an error response if user is not logged in", async () => {
			let resp = await request(app).get(`/companies/${values.handle}`);
			expect(resp.statusCode).toBe(401);
			expect(resp.body.message).toEqual("Unauthorized");
		});
	});
	describe("PATCH /companies/:handle", () => {
		test("update company details when admin is logged in", async () => {
			update = {
				name: "updatedName",
				num_employees: 1234567,
				description: "updatedDescription",
				logo_url: "updatedURL",
				_token: adminUserToken,
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
				_token: adminUserToken,
			};
			let resp = await request(app).patch(`/companies/${values.handle}`).send(updatedValues);
			expect(resp.statusCode).toBe(400);
			expect(resp.body.message).toEqual([
				"instance.name is not of a type(s) string",
				"instance.description is not of a type(s) string",
				"instance.logo_url is not of a type(s) string",
			]);
		});
		test("provides an error response if general user is logged in", async () => {
			update = {
				name: "updatedName",
				num_employees: 1234567,
				description: "updatedDescription",
				logo_url: "updatedURL",
				_token: generalUserToken,
			};

			let resp = await request(app).patch(`/companies/${values.handle}`).send(update);

			expect(resp.statusCode).toBe(401);
			expect(resp.body.message).toEqual("Unauthorized");
		});
		test("provides an error response if no user is logged in", async () => {
			update = {
				name: "updatedName",
				num_employees: 1234567,
				description: "updatedDescription",
				logo_url: "updatedURL",
			};

			let resp = await request(app).patch(`/companies/${values.handle}`).send(update);

			expect(resp.statusCode).toBe(401);
			expect(resp.body.message).toEqual("Unauthorized");
		});
	});
	describe("DELETE /companies/:handle", () => {
		test("deletes a company based on the provided handle when an admin is logged in", async () => {
			let resp = await request(app)
				.delete(`/companies/${values.handle}`)
				.send({ _token: adminUserToken });
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ message: "Company deleted" });
		});
		test("provides an error response if the company can not be found when an admin is logged in", async () => {
			let resp = await request(app)
				.delete(`/companies/invalid`)
				.send({ _token: adminUserToken });
			expect(resp.statusCode).toBe(404);
			expect(resp.body.message).toEqual(`Could not find company handle: invalid`);
		});
		test("provides an error response if general user is logged in", async () => {
			let resp = await request(app)
				.delete(`/companies/${values.handle}`)
				.send({ _token: generalUserToken });
			expect(resp.statusCode).toBe(401);
			expect(resp.body.message).toEqual("Unauthorized");
		});
		test("provides an error response if no user is logged in", async () => {
			let resp = await request(app).delete(`/companies/${values.handle}`);
			expect(resp.statusCode).toBe(401);
			expect(resp.body.message).toEqual("Unauthorized");
		});
	});
});
afterAll(async function () {
	await db.query("DELETE FROM jobs");
	await db.query("DELETE FROM companies");
	await db.end();
});
