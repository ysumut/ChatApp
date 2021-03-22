const socket = io();

socket.on('message', msg => {
    console.log(msg);
});

