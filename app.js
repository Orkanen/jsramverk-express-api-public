const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cors = require('cors');
const index = require('./routes/index');
const hello = require('./routes/hello');
const list = require('./routes/list');
const auth = require('./routes/auth');
const editorModel = require("./models/editor.js");
const usersModel = require("./models/users.js");
const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema } = require("graphql");
const RootQueryType = require("./graphql/root.js");

"use strict";

//------------PORT-----------------------------------------------------------//

const app = express();
const httpServer = require("http").createServer(app);
const port = process.env.PORT || 1337;

//------------MIDDLEWARE--------------------------------------------------//

app.use(cors());

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// This is middleware called for all routes.
// Middleware takes three parameters.
app.use((req, res, next) => {
    console.log(req.method);
    console.log(req.path);
    next();
});

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test' && port !== 1337) {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

const visual = true;

const schema = new GraphQLSchema({
    query: RootQueryType
});

//-----------ROUTES--------------------------------------------------------//

console.log("Server running at", (port));

app.use('/', index);
app.use('/hello', hello);
app.use('/list', list);
app.use('/auth', auth);
app.use('/graphql', usersModel.checkToken); //Locking graphql behind x-access-token
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: visual,
}));

//-----------Error Handeling--------------------------------------------------//

// Add routes for 404 and error handling
// Catch 404 and forward to error handler
// Put this last
app.use((req, res, next) => {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        "errors": [
            {
                "status": err.status,
                "title":  err.message,
                "detail": err.message
            }
        ]
    });
});

const io = require("socket.io")(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
});

io.sockets.on('connection', async (socket) => {
    console.log(socket.id, 'user connected!');

    socket.on('disconnect', () => {
        console.log(socket.id, 'user disconnected');
    });

    socket.on("amounts", function(data) {
        socket.broadcast.emit("amounts", data);

        editorModel.updateAmounts(data);
    });

    socket.on('editor', function(room) {
        socket.join(room);
        //console.log(socket.id, ' joined room: ', room);
    });   

    socket.on('leave', function(room) {
        if (room !== '') {
            socket.leave(room);
        }
        //console.log(socket.id, ' left room: ', room);
    });

    socket.on('document', function(data) {
        let title = "";
        for (const x of socket.rooms.values()) {
            title = x ;
        }
        if (title == data["_id"].title) {
            socket.to(data["_id"].title).emit("document", data);
        } else {
            console.log(title +" vs. "+ data["_id"].title);
        }
        //socket.to(data["_id"].title).emit("document", data);
    });

    socket.on("chat message", function(data, user) {
        var temp = user;
        if (user == '') {
            temp = socket.id
        }
        var dataMsg = {
            _id: socket.id,
            msg: data,
            name: temp,
            code: "success"
        };
        socket.broadcast.emit('chat incoming', dataMsg);
        console.log(dataMsg);
    });
});


// Start up server
//app.listen(port, () => console.log(`Example API listening on port ${port}!`));


const server = httpServer.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = server;