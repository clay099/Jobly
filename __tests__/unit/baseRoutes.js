process.env.NODE_ENV = "test";
const request = require("supertest");
const db = require("../../db");
const app = require("../../app");
const User = require("../../models/userModel");
console.error = jest.fn();

describe("test base routes", () => {
	let u;
	let values;
	beforeEach(async () => {
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
		u = await User.create(values);
	});
	describe("POST /login", () => {
		test("login user with valid credentials", async () => {
			let resp = await request(app)
				.post("/login")
				.send({ password: values.password, username: u.username });
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ token: expect.any(String) });
		});
		test("provides error response if invalid credentials are provided", async () => {
			let resp = await request(app)
				.post("/login")
				.send({ password: "invalid", username: u.username });
			expect(resp.statusCode).toBe(400);
			expect(resp.body.message).toEqual("Invalid username/password");
		});
	});
});
afterAll(async function () {
	await db.query("DELETE FROM users");
	await db.end();
});
