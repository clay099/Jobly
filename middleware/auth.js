/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
	try {
		const tokenFromBody = req.body._token;
		const payload = jwt.verify(tokenFromBody, JWT_SECRET_KEY);
		req.user = payload; // {username, is_admin}
		return next();
	} catch (err) {
		return next();
	}
}

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
	if (!req.user) {
		const err = new ExpressError(`Unauthorized`, 401);
		return next(err);
	} else {
		return next();
	}
}
/** Middleware: Requires correct username. */

function ensureCorrectUser(req, res, next) {
	try {
		if (req.user.username === req.params.username) {
			return next();
		} else {
			const err = new ExpressError(`Unauthorized`, 401);
			return next(err);
		}
	} catch (e) {
		// errors would happen here if we made a request and req.user is undefined
		const err = new ExpressError(`Unauthorized`, 401);
		return next(err);
	}
}

/** Middleware: Requires is_admin. */

function ensureIsAdmin(req, res, next) {
	try {
		if (req.user.is_admin === true) {
			return next();
		} else {
			const err = new ExpressError(`Unauthorized`, 401);
			return next(err);
		}
	} catch (e) {
		// errors would happen here if we made a request and req.user is undefined
		const err = new ExpressError(`Unauthorized`, 401);
		return next(err);
	}
}

module.exports = {
	authenticateJWT,
	ensureLoggedIn,
	ensureCorrectUser,
	ensureIsAdmin,
};
