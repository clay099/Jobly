process.env.NODE_ENV = "test";
const db = require("../../db");
const app = require("../../app");
const Application = require("../../models/applicationModel");
const Job = require("../../models/jobModel");
const User = require("../../models/userModel");
const Company = require("../../models/companyModel");
console.error = jest.fn();

jest.setTimeout(10000);
describe("Test Application model", () => {
	let values;
	beforeEach(async function () {
		await db.query("DELETE FROM applications");
		await db.query("DELETE FROM jobs");
		await db.query("DELETE FROM companies");
		await db.query("DELETE FROM users");
		let company = await Company.create({
			handle: "AAPL",
			name: "Apple",
			num_employees: 10000,
			description: "tech company",
			logo_url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
		});
		let job = await Job.create({
			title: "owner",
			salary: 100000,
			equity: 0.9,
			company_handle: company.handle,
		});
		let user = await User.create({
			username: "testUser",
			password: "testPW",
			first_name: "first",
			last_name: "last",
			email: "test@gmail.com",
			photo_url:
				"https://image.shutterstock.com/image-vector/user-icon-trendy-flat-style-260nw-418179856.jpg",
			is_admin: true,
		});

		values = {
			username: user.username,
			job_id: job.id,
			state: "interested",
		};
	});

	describe("test Application.create() method", () => {
		beforeEach(async function () {
			await db.query("DELETE FROM applications");
		});
		test("creates a new application", async () => {
			let resp = await Application.create(values);
			values.created_at = expect.any(Object);
			expect(resp).toEqual(values);
		});
		test("throws an error if username is not provided", async () => {
			let resp;
			try {
				delete values.username;
				await Application.create(values);
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(
				'null value in column "username" violates not-null constraint'
			);
		});
		test("throws an error if job_id is not provided", async () => {
			let resp;
			try {
				delete values.job_id;
				await Application.create(values);
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(
				'null value in column "job_id" violates not-null constraint'
			);
		});
		test("throws an error if state is not provided", async () => {
			let resp;
			try {
				delete values.state;
				resp = await Application.create(values);
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(
				'null value in column "state" violates not-null constraint'
			);
		});
		test("throws an error if state does not match required enum", async () => {
			let resp;
			try {
				values.state = "invalid";
				await Application.create(values);
			} catch (e) {
				resp = e;
			}
			expect(resp.code).toEqual("22P02");
		});
	});
	describe("test Application.all() method", () => {
		beforeEach(async function () {
			await db.query("DELETE FROM applications");
			await Application.create(values);
		});
		test("generates an array of all application details", async () => {
			let resp = await Application.all();
			values.created_at = expect.any(Object);
			expect(resp).toEqual([values]);
		});
		test("generates an empty array if no applications", async () => {
			await db.query("DELETE FROM applications");

			let resp = await Application.all();
			values.created_at = expect.any(Object);
			expect(resp).toEqual([]);
		});
	});
	describe("test application.update() method", () => {
		let app;
		beforeEach(async function () {
			await db.query("DELETE FROM applications");
			app = await Application.create(values);
		});
		test("should update application details from provided details", async () => {
			let resp = await app.update({ state: "accepted" });
			expect(resp.state).toEqual("accepted");
		});
		test("should not update if state is invalid", async () => {
			let resp;
			try {
				await app.update({ state: "invalid" });
			} catch (e) {
				resp = e;
			}
			expect(resp.code).toEqual("22P02");
		});
	});
	describe("test application.remove() method", () => {
		let app;
		beforeEach(async function () {
			await db.query("DELETE FROM applications");
			app = await Application.create(values);
		});
		test("should remove application based on provided details", async () => {
			let resp = await Application.remove(values.username, values.job_id);
			expect(resp).toEqual("deleted");
		});
		test("throws an error if application can not be found in database", async () => {
			let resp;
			try {
				await Application.remove("invalid");
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(
				`Could not find application for username: invalid, with job_id: undefined`
			);
			expect(resp.status).toBe(404);
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
