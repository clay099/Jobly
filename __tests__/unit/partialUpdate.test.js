process.env.NODE_ENV = "test";
const request = require("supertest");
const sqlForPartialUpdate = require("../../helpers/partialUpdate");

describe("partialUpdate()", () => {
	it("should generate a proper partial update query with just 1 field", function () {
		const items = {
			fname: "updatedFirstName",
			lname: "updatedLastName",
		};

		const result = sqlForPartialUpdate("user", items, "id", "1");
		const query = `UPDATE user SET fname=$1, lname=$2 WHERE id=$3 RETURNING *`;
		const values = [items["fname"], items["lname"], "1"];

		expect(result).toEqual({ query, values });
	});
});
