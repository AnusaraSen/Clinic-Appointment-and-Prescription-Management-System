const express = require('express');
const cookieParser = require('cookie-parser');

// Body & cookie parsing middleware grouped for easier import.
module.exports = [
  express.json(),
  express.urlencoded({ extended: true }),
  cookieParser()
];
