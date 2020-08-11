process.env.NODE_ENV = "test";
const db = require("../../db");
const app = require("../../app");
const User = require("../../models/userModel");
console.error = jest.fn();

describe("Test User model", () => {
	let values;
	let user;
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
		user = await User.create(values);
	});
	describe("test User.create() method", () => {
		beforeEach(async function () {
			await db.query("DELETE FROM users");
		});
		test("creates a new user", async function () {
			let resp = await User.create(values);
			expect(resp).toEqual(values);
		});
		test("creates a new user and adds default for photo_url and is_admin", async function () {
			delete values.is_admin;
			delete values.photo_url;
			let resp = await User.create(values);

			values.is_admin = false;
			values.photo_url =
				"https://cdn3.vectorstock.com/i/1000x1000/21/62/human-icon-in-circle-vector-25482162.jpg";
			expect(resp).toEqual(values);
		});

		test("throws an error if username is not provided", async function () {
			delete values.username;
			let resp;
			try {
				await User.create(values);
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(
				`null value in column "username" violates not-null constraint`
			);
		});
		test("throws an error if password is not provided", async function () {
			delete values.password;
			let resp;
			try {
				await User.create(values);
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(
				`null value in column "password" violates not-null constraint`
			);
		});
		test("throws an error if first_name is not provided", async function () {
			delete values.first_name;
			let resp;
			try {
				await User.create(values);
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(
				`null value in column "first_name" violates not-null constraint`
			);
		});
		test("throws an error if last_name is not provided", async function () {
			delete values.last_name;
			let resp;
			try {
				await User.create(values);
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(
				`null value in column "last_name" violates not-null constraint`
			);
		});
		test("throws an error if email is not provided", async function () {
			delete values.email;
			let resp;
			try {
				await User.create(values);
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(
				`null value in column "email" violates not-null constraint`
			);
		});
	});
	describe("test User.all() method", function () {
		let u;
		beforeEach(async function () {
			await db.query("DELETE FROM users");
			u = await User.create(values);
			delete u.password;
			delete u.photo_url;
			delete u.is_admin;
		});
		test("generates an array of all users", async () => {
			let resp = await User.all();
			expect(resp).toEqual([u]);
		});
		test("generates an empty array if no users are posted", async () => {
			await db.query("DELETE FROM users");
			let resp = await User.all();
			expect(resp).toEqual([]);
		});
	});
	describe("test User.get() method", function () {
		test("generates User details", async () => {
			let resp = await User.get(user.username);
			delete user.password;
			delete user.photo_url;
			delete user.is_admin;

			expect(resp).toEqual(user);
		});
		test("throws an error if User is can't be found", async () => {
			let resp;
			try {
				resp = await User.get("invalid");
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(`Could not find User username: invalid`);
			expect(resp.status).toEqual(404);
		});
	});
	describe("test User.getALL() method", function () {
		test("generates all User details", async () => {
			let resp = await User.getAll(user.username);
			expect(resp).toEqual(user);
		});
		test("throws an error if User is can't be found", async () => {
			let resp;
			try {
				resp = await User.getAll("invalid");
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(`Could not find User username: invalid`);
			expect(resp.status).toEqual(404);
		});
	});
	describe("test User.update() method", function () {
		let updateUser;
		beforeEach(async () => {
			await db.query("DELETE FROM users");
			updateUser = await User.create(values);
		});
		test("update user", async () => {
			let resp = await updateUser.update({
				password: "updatedPW",
				first_name: "updatedFirst",
				last_name: "updatedLast",
				email: "updatedTest@gmail.com",
				photo_url: "",
				is_admin: false,
			});
			updateUser.first_name = "updatedFirst";
			updateUser.last_name = "updatedLast";
			updateUser.email = "updatedTest@gmail.com";
			updateUser.photo_url = "";
			delete updateUser.password;
			delete updateUser.is_admin;
			expect(resp).toEqual(updateUser);
		});
	});
	describe("test User.remove()", () => {
		let u;
		beforeEach(async function () {
			await db.query("DELETE FROM users");
			u = await User.create(values);
		});
		test("removes User", async () => {
			let resp = await User.remove(u.username);
			expect(resp).toEqual("deleted");
		});
		test("throws an error if User can't be found", async () => {
			let resp;
			try {
				await User.remove("invalid");
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual("Could not find user username: invalid");
			expect(resp.status).toEqual(404);
		});
	});
});
afterAll(async function () {
	await db.query("DELETE FROM users");
	await db.end();
});
