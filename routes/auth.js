const express = require('express');
const users = require('../models/users');
const router = express.Router();

const usersModel = require("../models/users");

router.post(
    "/register",
    async (req, res) => {
        const body = req.body;

        await usersModel.register(res, body);
    }
);

router.post(
    "/login",
    async (req, res) => {
        const body = req.body;

        await usersModel.login(res, body);
    }
);

module.exports = router;