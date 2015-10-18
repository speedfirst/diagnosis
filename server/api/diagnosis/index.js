'use strict';

var express = require('express');
var diagnosis = require('./diagnosis');

var router = express.Router();

router.post('/', diagnosis);

module.exports = router;