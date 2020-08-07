const express = require("express");
const ExpressError = require("../helpers/expressError");
const Company = require('../models/company')

const router = new express.Router();

router.get("/" async (req, ers, next) => {
    try {
        
    } catch (e) {
        return next(e)
    }
});
