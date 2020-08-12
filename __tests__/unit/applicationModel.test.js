process.env.NODE_ENV = "test";
const db = require("../../db");
const app = require("../../app");
const Application = require("../../models/applicationModel");
console.error = jest.fn();
