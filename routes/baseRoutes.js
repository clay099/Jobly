const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/userModel");

const router = new express.Router();

router.post("/login", async (req, res, next) => {
	try {
		console.log({ req });
		let { password, username } = req.body;
		console.log({ password, username });
		let user = await User.getAll(username);
		let token = await user.authenticate(password);
		return res.json({ token });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
