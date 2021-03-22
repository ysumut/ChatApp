const express = require("express");
const session = require("express-session");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Express app use
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    name: 'chatapp-session',
    secret: process.env.SESSION_SECRET || "123456789",
    resave: false,
    saveUninitialized: true
}));

// Routes
app.get('/', (req, res) => res.sendFile('public/login.html', { root: __dirname }) );
app.post('/login', (req, res) => {
    req.session.username = req.body.username;
    return res.redirect('/chat');
});
app.get('/chat', (req, res) => {
    if(!req.session.username) return res.redirect('/');

    return res.sendFile('public/chat.html', { root: __dirname })
});

// Socket io
io.on('connection', socket => {
    io.emit('message', 'A user connected');

    socket.on('disconnect', () => {
        io.emit('message', 'A user disconnected');
    });
});

// Listen port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running at ${PORT} port.`));