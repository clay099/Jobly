# Jobly

## Description

This is an exercise to create a creating a full stack web application called Jobly, which will be used to explore and "apply" for jobs online (no, these aren't REAL jobs).

The goal of this project is to create a API with similar functionality to LinkedIn but on a smaller scale. You'll make a queryable API for companies, add in database tables for users, companies and jobs, and add in authentication and authorization!

The design of this project is to be an API where all responses are returned in JSON format.

The main routes of this project include:

1. Companies Routes - allow full CRUD
2. Jobs Routes - allow full CRUD
3. Users Routes - allow full CRUD

All of the above sections are validated with json schema. Classes and class methods have been created for each table to allow for standard CRUD operations.

## Installation

> npm install

## Seed

> npm run seed

**note:** the date file is set up to create the jobly and jobly-test database. It will also create the tables in both databases and seed the jobly database.

## Usage

> npm start

If you want to test the seeded jobly database with an API testing tool such as postman or insomnia you can login and save the token or use the below provided token. The majority of routes request a \_token to be send via JSON.

janeDoe token =  
{"\_token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImphbmVEb2UiLCJpc19hZG1pbiI6ZmFsc2UsImlhdCI6MTU5NzI1MDY0NH0.LJuKkeCwN-JHhLkOz4FwwFaEy4YVNajK536q9e4sxMQ"}

## Tests [![Build Status](https://travis-ci.com/clay099/Jobly.svg?branch=master)](https://travis-ci.com/clay099/Jobly)

> npm test
