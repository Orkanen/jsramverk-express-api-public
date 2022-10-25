var express = require('express');
var router = express.Router();

//ESTABLISH MONGODB CONNECTION

router.get('/', function(req, res, next) {
    const data = {
        data: {
            msg: "Hello Index"
        }
    };

    res.json(data);
});

//GET MONGODB PARAMS => SEND TO EDITOR

module.exports = router;
