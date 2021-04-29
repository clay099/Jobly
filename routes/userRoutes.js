const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/userModel");
const jsonschema = require("jsonschema");
const userSchema = require("../schema/userSchema.json");
const { ensureCorrectUser } = require("../middleware/auth");

const router = new express.Router();

module.exports = router;

/** GET / => {users : [userData], [user2Data], ...} */
router.get("/", async (req, res, next) => {
	try {
		let users = await User.all();

		return res.json({ users });
	} catch (e) {
		return next(e);
	}
});

/** POST / {userData, _token: tokenDate} => {user: newUser} */
router.post("/", async (req, res, next) => {
	try {
		req.body.is_admin = req.body.is_admin ? req.body.is_admin : true;
		// try user against schema
		const result = jsonschema.validate(req.body, userSchema);

		// if user fails against schema throw error
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}
		// we know user passes and create in DB and return as json
		const user = await User.create(req.body);
		const token = await user.authenticate(req.body.password);
		return res.status(201).json({ user, token });
	} catch (e) {
		return next(e);
	}
});

/** GET /[username] => {user: userData} */
router.get("/:username", async (req, res, next) => {
	try {
		const user = await User.get(req.params.username);
		return res.json({ user });
	} catch (e) {
		return next(e);
	}
});

/** PATCH /[username] {userData, _token: tokenDate} => {user: userData} */
router.patch("/:username", ensureCorrectUser, async (req, res, next) => {
	try {
		let u = await User.getAll(req.params.username);

		// if password, first_name, last_name, email, photo_url, is_admin has been provided in req.body update user details otherwise leave value
		u.password = req.body.password ? req.body.password : u.password;

		u.first_name = req.body.first_name ? req.body.first_name : u.first_name;

		u.last_name = req.body.last_name ? req.body.last_name : u.last_name;

		u.email = req.body.email ? req.body.email : u.email;

		u.photo_url = req.body.photo_url ? req.body.photo_url : u.photo_url;

		u.is_admin = req.body.is_admin ? req.body.is_admin : u.is_admin;
		// validate against schema
		const result = jsonschema.validate(u, userSchema);
		if (!result.valid) {
			let listErr = result.errors.map((e) => e.stack);
			let err = new ExpressError(listErr, 400);
			return next(err);
		}
		let user = await u.update(req.body);

		return res.json({ user });
	} catch (e) {
		return next(e);
	}
});

/** DELETE /[id] => {message: "User deleted"} */
router.delete("/:username", ensureCorrectUser, async (req, res, next) => {
	try {
		await User.remove(req.params.username);
		return res.json({ message: "User deleted" });
	} catch (e) {
		return next(e);
	}
});
