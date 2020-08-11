const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/userModel");

const router = new express.Router();

router.post("/login", async (req, res, next) => {
	try {
		let { password, username } = req.body;
		let user = User.getAll(username);
		let token = await user.authenticate(password);
		return res.json({ token });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
