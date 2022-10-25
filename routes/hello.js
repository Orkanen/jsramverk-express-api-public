var express = require('express');
var router = express.Router();

//ESTABLISH MONGODB CONNECTION

router.get('/', function(req, res, next) {
    const data = {
        data: {
            msg: "Hello World"
        }
    };

    res.json(data);
});

//GET API CALL WITH PARAMS => SEND TO MONGODB SERVER

router.get("/:msg", (req, res) => {
    const data = {
        data: {
            msg: req.params.msg
        }
    };

    res.json(data);
});


module.exports = router;
