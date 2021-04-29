/** Database setup for jobly. */

const { Client } = require("pg");
const { DB_URI } = require("./config");

const db = new Client({
	connectionString: DB_URI,
	ssl: {
		rejectUnauthorized: false,
	},
});
console.log({ db });
db.connect();

module.exports = db;
