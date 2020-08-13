process.env.NODE_ENV = "test";
const request = require("supertest");
const db = require("../../db");
const app = require("../../app");
const User = require("../../models/userModel");
const Job = require("../../models/jobModel");
const Application = require("../../models/applicationModel");
const Company = require("../../models/companyModel");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../../config");
console.error = jest.fn();

jest.setTimeout(10000);
describe("test user routes", () => {
	let u; //will not show sensitive info
	let uAll; // will show all user info
	let values;
	let uToken;
	beforeEach(async function () {
		await db.query("DELETE FROM users");
		values = {
			username: "testUser",
			password: "testPW",
			first_name: "first",
			last_name: "last",
			email: "test@gmail.com",
			photo_url:
				"https://image.shutterstock.com/image-vector/user-icon-trendy-flat-style-260nw-418179856.jpg",
			is_admin: true,
		};
		uAll = await User.create(values);
		u = uAll;
		uToken = jwt.sign({ username: u.username, is_admin: true }, JWT_SECRET_KEY);
		delete u.password;
		delete u.is_admin;
	});
	describe("GET /users", () => {
		test("get all users", async () => {
			let resp = await request(app).get("/users");
			delete u.photo_url;
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ users: [u] });
		});
	});
	describe("POST /users", () => {
		test("creates a user", async () => {
			v = {
				username: "newUser",
				password: "newPW",
				first_name: "newFirst",
				last_name: "newLast",
				email: "new@gmail.com",
				photo_url:
					"https://image.shutterstock.com/image-vector/user-icon-trendy-flat-style-260nw-418179856.jpg",
				is_admin: true,
			};
			let resp = await request(app).post("/users").send(v);
			expect(resp.statusCode).toBe(201);
			v.password = expect.any(String);
			expect(resp.body).toEqual({ token: expect.any(String), user: v });
		});
		test("provides an error response if username, password, first_name, last_name, email are not provided", async () => {
			let resp = await request(app).post("/users");
			expect(resp.body.status).toBe(400);
			expect(resp.body.message).toEqual([
				`instance requires property "username"`,
				`instance requires property "password"`,
				`instance requires property "first_name"`,
				`instance requires property "last_name"`,
				`instance requires property "email"`,
				`instance requires property "is_admin"`,
			]);
		});
		test("provides an error response for incorrect paramter types", async () => {
			v = {
				username: 1,
				password: 1,
				first_name: 1,
				last_name: 1,
				email: 1,
				photo_url: 1,
				is_admin: 1,
			};
			let resp = await request(app).post("/users").send(v);
			expect(resp.statusCode).toBe(400);
			expect(resp.body.message).toEqual([
				"instance.username is not of a type(s) string",
				"instance.password is not of a type(s) string",
				"instance.first_name is not of a type(s) string",
				"instance.last_name is not of a type(s) string",
				"instance.email is not of a type(s) string",
				"instance.photo_url is not of a type(s) string",
				"instance.is_admin is not of a type(s) boolean",
			]);
		});
	});
	describe("GET /users/:username", () => {
		test("get user details from username", async () => {
			let resp = await request(app).get(`/users/${u.username}`);
			expect(resp.statusCode).toBe(200);
			delete u.photo_url;
			expect(resp.body).toEqual({ user: u });
		});
		test(`should provide an error response if user can't be found`, async () => {
			let resp = await request(app).get(`/users/invalid`);
			expect(resp.statusCode).toBe(404);
			expect(resp.body.message).toEqual("Could not find User username: invalid");
		});
		test("get user details from username and include a list of jobs that the user is associated with", async () => {
			let company = await Company.create({
				handle: "AAPL",
				name: "Apple",
				num_employees: 10000,
				description: "tech company",
				logo_url:
					"https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
			});
			let job = await Job.create({
				title: "owner",
				salary: 100000,
				equity: 0.9,
				company_handle: company.handle,
			});
			let application = await Application.create({
				username: u.username,
				job_id: job.id,
				state: "interested",
			});

			let resp = await request(app).get(`/users/${u.username}`);

			expect(resp.statusCode).toBe(200);
			delete u.photo_url;
			job.state = application.state;
			job.date_posted = expect.any(String);
			u.jobs = [job];
			expect(resp.body).toEqual({ user: u });
		});
	});
	describe("PATCH /users/:username", () => {
		test("should update user details when JWT token username matches", async () => {
			update = {
				password: "updatedPW",
				first_name: "updatedFirst",
				last_name: "updatedLast",
				email: "updatedTest@gmail.com",
				photo_url: "",
				is_admin: false,
				_token: uToken,
			};
			u.first_name = "updatedFirst";
			u.last_name = "updatedLast";
			u.email = "updatedTest@gmail.com";
			u.photo_url = "";
			let resp = await request(app).patch(`/users/${u.username}`).send(update);
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ user: u });
		});
		test("provides an error response for incorrect paramter types when JWT token username matches", async () => {
			v = {
				username: 1,
				password: 1,
				first_name: 1,
				last_name: 1,
				email: 1,
				photo_url: 1,
				is_admin: 1,
				_token: uToken,
			};
			let resp = await request(app).patch(`/users/${u.username}`).send(v);
			expect(resp.statusCode).toBe(400);
			expect(resp.body.message).toEqual([
				"instance.password is not of a type(s) string",
				"instance.first_name is not of a type(s) string",
				"instance.last_name is not of a type(s) string",
				"instance.email is not of a type(s) string",
				"instance.photo_url is not of a type(s) string",
				"instance.is_admin is not of a type(s) boolean",
			]);
		});
		test("provides an error response for incorrect paramter types when JWT token username does not match", async () => {
			update = {
				password: "updatedPW",
				first_name: "updatedFirst",
				last_name: "updatedLast",
				email: "updatedTest@gmail.com",
				photo_url: "",
				is_admin: false,
				_token: "invalid",
			};
			u.first_name = "updatedFirst";
			u.last_name = "updatedLast";
			u.email = "updatedTest@gmail.com";
			u.photo_url = "";
			let resp = await request(app).patch(`/users/${u.username}`).send(update);
			expect(resp.statusCode).toBe(401);
			expect(resp.body.message).toEqual("Unauthorized");
		});
		test("provides an error response for incorrect paramter types when JWT token username is not provided", async () => {
			update = {
				password: "updatedPW",
				first_name: "updatedFirst",
				last_name: "updatedLast",
				email: "updatedTest@gmail.com",
				photo_url: "",
				is_admin: false,
			};
			u.first_name = "updatedFirst";
			u.last_name = "updatedLast";
			u.email = "updatedTest@gmail.com";
			u.photo_url = "";
			let resp = await request(app).patch(`/users/${u.username}`).send(update);
			expect(resp.statusCode).toBe(401);
			expect(resp.body.message).toEqual("Unauthorized");
		});
	});
	describe("DELETE /user/:username", () => {
		test("deletes a user based on the provided username if JWT username matches", async () => {
			let resp = await request(app).delete(`/users/${u.username}`).send({ _token: uToken });
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ message: "User deleted" });
		});
		test("provides an error response if the user can not be found if JWT username matches", async () => {
			// first delete user
			await User.remove(u.username);
			let resp = await request(app).delete(`/users/${u.username}`).send({ _token: uToken });
			expect(resp.statusCode).toBe(404);
			expect(resp.body.message).toEqual(`Could not find user username: ${u.username}`);
		});
		test("provides an error response if the user token does not match", async () => {
			let resp = await request(app)
				.delete(`/users/${u.username}`)
				.send({ _token: "invalid" });
			expect(resp.statusCode).toBe(401);
			expect(resp.body.message).toEqual("Unauthorized");
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
