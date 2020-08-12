const ExpressError = require("./expressError");
/**
 * Generate a delete query based on a request body:
 *
 * - table: where to make the query
 * - key: the column that we query by (e.g. username, handle, id)
 * - id: current record ID
 *
 * Returns object containing a DB query as a string
 *
 */

function sqlForDelete(table, key, id) {
	if (table === undefined || key === undefined || id === undefined) {
		throw new ExpressError("all parameters are required", 500);
	}
	// build query
	let query;
	if (Array.isArray(key)) {
		query = `DELETE FROM ${table} WHERE ${key[0]}=$1 AND ${key[1]}=$2 RETURNING *`;
	} else {
		query = `DELETE FROM ${table} WHERE ${key}=$1 RETURNING *`;
	}
	return { query, id };
}

module.exports = sqlForDelete;
