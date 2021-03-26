const express = require("express");
const http = require("http");
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require("path");
const socketio = require("socket.io");
const router = require('./routes/router');
const { verify } = require('./utils/tokenAuth');
const { addUser, removeUser, getUsersList } = require("./utils/users");

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
    
    socket.on('join_app', (info) => {
        let token_result = verify(info.token);

        if (token_result) {
            user = addUser(socket.id, token_result.username, info.random);
        }

        io.emit('users_list', getUsersList());
    });

    socket.on('chat_message', (info) => {
        let token_result = verify(info.token);

        if (token_result) {
            //socket.emit('chat_message', info.message); // From
            io.to(info.to).emit('chat_message', info.message); // To
        }
    });

    socket.on('disconnect', () => {
        removeUser(socket.id);
        io.emit('users_list', getUsersList());
    });
});

// Listen port
server.listen(PORT, () => console.log(`Server running at ${PORT} port.`));