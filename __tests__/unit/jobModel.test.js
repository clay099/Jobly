process.env.NODE_ENV = "test";
const db = require("../../db");
const app = require("../../app");
const Job = require("../../models/jobModel");
const Company = require("../../models/companyModel");
console.error = jest.fn();

describe("Test Job Model", () => {
	let values;
	let company;
	beforeEach(async function () {
		await db.query("DELETE FROM jobs");
		await db.query("DELETE FROM companies");
		values = {
			title: "owner",
			salary: 100000,
			equity: 0.9,
			company_handle: "AAPL",
		};
		company = await Company.create({
			handle: "AAPL",
			name: "Apple",
			num_employees: 10000,
			description: "tech company",
			logo_url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
		});
	});

	describe("test Job.create() method", () => {
		beforeEach(async function () {
			await db.query("DELETE FROM jobs");
		});
		test("creates a new job", async () => {
			let resp = await Job.create(values);
			expect(resp).toEqual({
				title: values.title,
				salary: values.salary,
				equity: values.equity,
				company_handle: values.company_handle,
				id: expect.any(Number),
				date_posted: expect.any(Object),
			});
		});
		test("throws an error if company_handle is not provided", async () => {
			let resp;
			try {
				resp = await Job.create({
					title: values.title,
					salary: values.salary,
					equity: values.equity,
				});
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(
				'null value in column "company_handle" violates not-null constraint'
			);
		});
		test("throws an error if title is not provided", async () => {
			let resp;
			try {
				resp = await Job.create({
					salary: values.salary,
					equity: values.equity,
					company_handle: values.company_handle,
				});
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(
				'null value in column "title" violates not-null constraint'
			);
		});
		test("throws an error if equity is not provided", async () => {
			let resp;
			try {
				resp = await Job.create({
					title: values.title,
					salary: values.salary,
					company_handle: values.company_handle,
				});
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(
				'null value in column "equity" violates not-null constraint'
			);
		});
		test("throws an error if salary is not provided", async () => {
			let resp;
			try {
				resp = await Job.create({
					title: values.title,
					equity: values.equity,
					company_handle: values.company_handle,
				});
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(
				'null value in column "salary" violates not-null constraint'
			);
		});
	});
	describe("test Job.all() method", function () {
		let j;
		beforeEach(async function () {
			await db.query("DELETE FROM jobs");
			j = await Job.create(values);
		});
		test("generates an array of all jobs", async () => {
			let resp = await Job.all();
			expect(resp).toEqual([j]);
		});
		test("generates an empty array if not jobs are posted", async () => {
			await db.query("DELETE FROM jobs");
			let resp = await Job.all();
			expect(resp).toEqual([]);
		});
	});
	describe("test Job.get() method", function () {
		let j;
		beforeEach(async function () {
			await db.query("DELETE FROM jobs");
			j = await Job.create(values);
		});
		test("generates job details", async () => {
			let resp = await Job.get(j.id);
			expect(resp).toEqual(j);
		});
		test("throws an error if job is can't be found", async () => {
			let resp;
			try {
				resp = await Job.get(123456);
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(`Could not find job id: 123456`);
			expect(resp.status).toEqual(404);
		});
	});

	describe("test Job.update() method", function () {
		let updatedJob;
		beforeEach(async function () {
			await db.query("DELETE FROM jobs");
			updatedJob = await Job.create(values);
		});
		test("update job", async () => {
			let resp = await updatedJob.update({
				title: "updatedTitle",
				salary: 12345,
				equity: 0.9,
			});
			updatedJob.title = "updatedTitle";
			updatedJob.salary = 12345;
			updatedJob.equity = 0.9;
			expect(resp).toEqual(updatedJob);
		});
	});
	describe("test Job.remove()", () => {
		let j;
		beforeEach(async function () {
			await db.query("DELETE FROM jobs");
			j = await Job.create(values);
		});
		test("removes job", async () => {
			let resp = await Job.remove(j.id);
			expect(resp).toEqual("deleted");
		});
		test("throws an error if job can't be found", async () => {
			let resp;
			try {
				await Job.remove(123456678);
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual("Could not find job id: 123456678");
			expect(resp.status).toEqual(404);
		});
	});
});
afterAll(async function () {
	await db.query("DELETE FROM jobs");
	await db.query("DELETE FROM companies");
	await db.end();
});
