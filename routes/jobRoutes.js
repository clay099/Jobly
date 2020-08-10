const express = require("express");
const ExpressError = require("../helpers/expressError");
const Job = require("../models/jobModel");
const jsonschema = require("jsonschema");
const companySchema = require("../schema/companySchema.json");
// const companyQueryStringHelp = require("../helpers/queryString");
