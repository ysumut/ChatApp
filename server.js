const express = require("express");
const http = require("http");
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require("path");
const socketio = require("socket.io");
const router = require('./routes/router');
const { newUser } = require("./utils/users");

// Constants
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const PORT = process.env.PORT || 3000;

// Config
dotenv.config();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/', router);

// Socket io Connection
io.on('connection', socket => {
    io.emit('message', 'A user connected');

    socket.on('chat_message', (token) => {
        console.log(token);
    });

    socket.on('disconnect', () => {
        io.emit('message', 'A user disconnected');
    });
});

// Listen port
server.listen(PORT, () => console.log(`Server running at ${PORT} port.`));