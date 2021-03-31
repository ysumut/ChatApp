const express = require("express");
const http = require("http");
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require("path");
const socketio = require("socket.io");
const router = require('./routes/router');
const { verify } = require('./utils/tokenAuth');
const { addUser, removeUser, getUsersList, findUser } = require("./utils/users");

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

    socket.on('join_app', (token) => {
        let token_result = verify(token);

        if (token_result) addUser(socket.id, token_result.username, token_result.random);
        else return;

        io.emit('users_list', getUsersList());
    });

    socket.on('chat_message', (res) => {
        let msg = res.msg.trim();
        if(!msg) return;

        let token_result = verify(res.token);
        let from_user = findUser(socket.id);

        if (token_result && from_user) {
            const message = {
                username: token_result.username,
                user_random: from_user.random,
                msg: msg,
                date: new Date().toUTCString(),
                from_id: from_user.id,
                to_id: res.to_id
            };

            message.type = 'send';
            socket.emit('chat_message', message); // From

            message.type = 'get';
            io.to(res.to_id).emit('chat_message', message); // To
        }
        else return;
    });

    socket.on('disconnect', () => {
        removeUser(socket.id);
        io.emit('users_list', getUsersList());
    });
});

// Listen port
server.listen(PORT, () => console.log(`Server running at ${PORT} port.`));