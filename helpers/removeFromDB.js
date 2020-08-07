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
	// build query
	let query = `DELETE FROM ${table} WHERE ${key}=$1 RETURNING *`;

	return { query, id };
}

module.exports = sqlForDelete;
