process.env.NODE_ENV = "test";
const request = require("supertest");
const db = require("../../db");
const app = require("../../app");
const User = require("../../models/userModel");
console.error = jest.fn();

describe("test user routes", () => {
	let u; //will not show sensitive info
	let uAll; // will show all user info
	let values;
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
			expect(resp.body).toEqual({ user: v });
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
	});
	describe("PATCH /users/:username", () => {
		test("should update user details", async () => {
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
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ user: u });
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
	});
	describe("DELETE /user/:username", () => {
		test("deletes a user based on the provided username", async () => {
			let resp = await request(app).delete(`/users/${u.username}`);
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ message: "User deleted" });
		});
		test("provides an error response if the user can not be found", async () => {
			let resp = await request(app).delete(`/users/invalid`);
			expect(resp.statusCode).toBe(404);
			expect(resp.body.message).toEqual(`Could not find user username: invalid`);
		});
	});
});
afterAll(async function () {
	await db.query("DELETE FROM users");
	await db.end();
});
