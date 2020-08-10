process.env.NODE_ENV = "test";
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

		expect({ query, values }).toEqual(result);
	});

	it("should generate a proper partial update query with just 1 field and remove keys that start with an _", function () {
		const items = {
			_fname: "updatedFirstName",
			lname: "updatedLastName",
		};

		const result = sqlForPartialUpdate("user", items, "id", "1");
		const query = `UPDATE user SET lname=$1 WHERE id=$2 RETURNING *`;
		const values = [items["lname"], "1"];

		expect({ query, values }).toEqual(result);
	});
});
