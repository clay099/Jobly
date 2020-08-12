process.env.NODE_ENV = "test";
const sqlForDelete = require("../../helpers/removeFromDB");
console.error = jest.fn();

describe("sqlForDelete()", () => {
	test("it should create a query string with data to be deleted", async () => {
		let query = sqlForDelete("companies", "name", "Apple");
		let answer = { query: "DELETE FROM companies WHERE name=$1 RETURNING *", id: "Apple" };

		expect(answer).toEqual(query);
	});

	test("it should throw an error if all three paramters are not provided", async () => {
		let e;
		try {
			sqlForDelete("companies", "name");
		} catch (error) {
			e = error;
		}

		expect(e.message).toEqual("all parameters are required");
		expect(e.status).toEqual(500);
	});
});
