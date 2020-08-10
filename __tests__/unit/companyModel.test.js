process.env.NODE_ENV = "test";
const db = require("../../db");
const app = require("../../app");
const Company = require("../../models/companyModel");

describe("Test Company Model", () => {
	let values;
	beforeEach(async function () {
		await db.query("DELETE FROM companies");
		values = {
			handle: "AAPL",
			name: "Apple",
			num_employees: 10000,
			description: "tech company",
			logo_url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
		};
	});

	describe("test Company.create() method", () => {
		beforeEach(async function () {
			await db.query("DELETE FROM companies");
		});
		test("create a new company with all details", async () => {
			let resp = await Company.create(values);
			expect(resp).toEqual(values);
		});
		test("create a new company with default value for employees, description, logo_url", async () => {
			let resp = await Company.create({ handle: values.handle, name: values.name });
			expect(resp).toEqual({
				handle: values.handle,
				name: values.name,
				num_employees: 0,
				description: "",
				logo_url: "",
			});
		});

		test("throws an error if handle is not provided", async () => {
			let resp;
			try {
				await Company.create({ name: values.name });
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(
				'null value in column "handle" violates not-null constraint'
			);
		});
		test("throws an error if name is not provided", async () => {
			let resp;
			try {
				await Company.create({ handle: values.handle });
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(
				'null value in column "name" violates not-null constraint'
			);
		});
		test("can't create a company which already exists", async () => {
			let resp;
			let comp = await Company.create(values);
			try {
				await Company.create(values);
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(
				'duplicate key value violates unique constraint "companies_pkey"'
			);
		});
	});

	describe("test Company.all() method", () => {
		let v2;
		beforeEach(async function () {
			await db.query("DELETE FROM companies");
			v2 = {
				handle: "UNH",
				name: "UnitedHealthGroup",
				num_employees: 10,
				description: "Health company",
				logo_url:
					"https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
			};
			await Company.create(values);
			await Company.create(v2);
		});

		test("generate a array of all company details", async () => {
			let resp = await Company.all();
			expect(resp).toEqual([values, v2]);
		});

		test("generate a empty array if no companies are in database", async () => {
			await db.query("DELETE FROM companies");
			let resp = await Company.all();
			expect(resp).toEqual([]);
		});
	});
	describe("test Company.get() method", () => {
		beforeEach(async function () {
			await db.query("DELETE FROM companies");
			await Company.create(values);
		});

		test("gets a company details from provided handle", async () => {
			let resp = await Company.get(values.handle);
			expect(resp).toEqual(values);
		});

		test("return error if company could not be found", async () => {
			let resp;
			try {
				await Company.get("invalid");
			} catch (error) {
				resp = error;
			}
			expect(resp.message).toEqual(`Could not find company handle: invalid`);
			expect(resp.status).toEqual(404);
		});
	});
	describe("test Company.update() method", () => {
		let UpdateComp;
		beforeEach(async function () {
			await db.query("DELETE FROM companies");
			UpdateComp = await Company.create(values);
		});

		test("update a company handle ", async () => {
			let resp = await UpdateComp.update({ handle: "updatedHandle" });
			values.handle = "updatedHandle";
			expect(resp).toEqual(values);
		});
		test("update a company name ", async () => {
			let resp = await UpdateComp.update({ name: "updated" });
			values.name = "updated";
			expect(resp).toEqual(values);
		});
		test("update a company num_employees ", async () => {
			let resp = await UpdateComp.update({ num_employees: 1234567 });
			values.num_employees = 1234567;
			expect(resp).toEqual(values);
		});
		test("update a company description ", async () => {
			let resp = await UpdateComp.update({ description: "updated description" });
			values.description = "updated description";
			expect(resp).toEqual(values);
		});
		test("update a company num_employees ", async () => {
			let resp = await UpdateComp.update({ logo_url: "url.com" });
			values.logo_url = "url.com";
			expect(resp).toEqual(values);
		});
	});
	describe("test Company.remove() method", () => {
		beforeEach(async function () {
			await db.query("DELETE FROM companies");
			await Company.create(values);
		});
		test("removes a company based on provided handle", async () => {
			let resp = await Company.remove(values.handle);
			expect(resp).toEqual("deleted");
		});
		test("throws an error if handle can not be found in database", async () => {
			let resp;
			try {
				await Company.remove("invalid");
			} catch (e) {
				resp = e;
			}
			expect(resp.message).toEqual(`Could not find company handle: invalid`);
			expect(resp.status).toBe(404);
		});
	});
});
afterAll(async function () {
	await db.end();
});
