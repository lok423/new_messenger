const express = require('express');
const router = express.Router();
const userService= require('../controllers/user.controller');

router.all('/users', userService);

module.exports = router;