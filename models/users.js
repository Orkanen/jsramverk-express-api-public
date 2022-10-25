const database = require("../db/database.js");
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const users = {
    register: async function register(res, body) {
        const email = (body.email).toLowerCase();
        const password = body.password;

        //console.log(body.email);
        if (!email || !password) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    message: "E-mail or password is missing",
                }
            });
        }

        bcrypt.hash(password, saltRounds, async function (err, hash) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        message: "Could not hash password",
                    }
                });
            }

            let db = await database.getDb("users");

            try {
                const doc = {
                    email: email,
                    password: hash,
                };

                const query = { email: email };

                const user = await db.collection.findOne(query);

                if (!user) {
                    await db.collection.insertOne(doc);

                    return res.status(201).json({
                        data: {
                            message: "User successfully created."
                        }
                    });
                }

                return res.status(409).json({
                    data: {
                        message: "User already exists."
                    }
                });
            } catch (error) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        message: "Could not created new user",
                    }
                })
            } finally {
                await db.client.close();
            }
        });
    },

    login: async function login (res, body) {
        const email = (body.email).toLowerCase();
        const password = body.password;

        if (!email || !password) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    message: "E-mail or password is missing",
                }
            });
        }

        let db = await database.getDb("users");

        try {
            const query = { email: email };

            const user = await db.collection.findOne(query);

            if (user) {
                return users.comparePasswords(res, user, password);
            }

            return res.status(401).json({
                data: {
                    message: "User does not exist."
                }
            });
        } catch (error) {
            return res.status(500).json({
                errors: {
                    status: 500,
                    message: "Could not find user",
                }
            })
        } finally {
            await db.client.close();
        }
    },

    comparePasswords: async function comparePasswords(res, user, password) {


        bcrypt.compare(password, user.password, function (err, result) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        message: "Could not decrypt password."
                    }
                });
            }

            if (result) {
                const payload = { email: user.email };
                const secret = ""+process.env.JWT_SECRET;

                const token = jwt.sign(payload, secret, { expiresIn: '1h' });

                return res.status(201).json({
                    data: {
                        _id: user["_id"],
                        email: user.email,
                        token: token,
                    }
                });
            }

            return res.status(401).json({
                errors: {
                    status: 401,
                    message: "Password not correct"
                }
            });
        });
    },

    checkToken: function checkToken(req, res, next) {
        const token = req.headers['x-access-token'];

        jwt.verify(token, ""+process.env.JWT_SECRET, function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        message: "Token is not valid."
                    }
                });
            }

            next();
        });
    },

    getAllUsers: async function getAllUsers() {
        let db = await database.getDb("users");

        try {

            const allDocs = await db.collection.find().toArray();

            return allDocs;
        } catch (error) {
            return {
                errors: {
                    message: error.message,
                }
            };
        } finally {
            await db.client.close();
        }
    },

    getUser: async function getUser(email) {
        let db = await database.getDb("users");

        try {
            const filter = { email: email }

            const allDocs = await db.collection.findOne(filter);

            return allDocs;
        } catch (error) {
            return {
                errors: {
                    message: error.message,
                }
            };
        } finally {
            await db.client.close();
        }
    }
};

module.exports = users;