var express = require('express');
var router = express.Router();

const listModel = require("../models/editor");
const usersModel = require("../models/users");

// Return a JSON object with list of all documents within the collection.
router.get(
    "/",
    (req, res, next) => usersModel.checkToken(req, res, next),
    async (req, res) => {
        const result = await listModel.getAllDocs();

        return res.json({
            data: result
        });
    }
);

router.get(
    "/user",
    (req, res, next) => usersModel.checkToken(req, res, next),
    async (req, res) => {
        //console.log(req.headers['email']);
        const result = await listModel.getUserDocs(req.headers['email']);

        return res.json({
            data: result
        });
    }
);

router.post("/create", async (request, response) => {
    try {
        let res = await listModel.addToCollection(
            request.body.text,
            request.body.title,
            request.body.owners,
            request.body.comments,
            request.body.code
        );

        //console.log(request.body.text);
        //console.log(JSON.stringify(res));
        return response.status(201).json({
            data: res
        });
    } catch (err) {
        //console.log(err);
        response.json(err);
    }
});

router.patch("/update", async (request, response) => {
    try {
        let res = await listModel.updateDocumentCollection(
            request.body.text,
            request.body.title,
            request.body.id,
            request.body.comments,
            request.body.code
        );

        //console.log(res);
        return response.json({
            data: res
        });
    } catch (err) {
        //console.log(err);
        response.json(err);
    }
});

router.patch("/addOwner", async (request, response) => {
    try {
        const body = request.body;
        const result = await listModel.addOwner(response, body);

        response.json({
            data: result
        });
    } catch (err) {
        //console.log(err);
        response.json(err);
    }
});

module.exports = router;