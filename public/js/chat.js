const socket = io();
const token = ("; "+document.cookie).split("; chatapp_token=").pop().split(";").shift();

// TODO: Add message event
socket.emit('chat_message', {token: token, message: 'Hello'});

socket.on('message', msg => {
    console.log(msg);
});
