const socket = io();
const token = ("; " + document.cookie).split("; chatapp_token=").pop().split(";").shift();
const random = Math.floor(Math.random() * 8) + 1;
const chat_container = document.querySelector('.chatContainerScroll');

let userInfo = {};
let to_id = "";

socket.emit('join_app', { token, random });

socket.on('user_me', res => {
    userInfo = res;
});

socket.on('chat_message', res => {
    let message_date = new Date(res.date).toLocaleTimeString().substr(0, 5);

    if (res.type == 'get') {
        $('.chatContainerScroll').append(`
        <li class="chat-left">
            <div class="chat-avatar">
                <img src="https://www.bootdey.com/img/Content/avatar/avatar${res.user_random}.png">
                <div class="chat-name">${res.username}</div>
            </div>
            <div class="chat-text">${res.msg}</div>
            <div class="chat-hour">${message_date} <span class="fa fa-check-circle"></span></div>
        </li>
        `);
    }
    if (res.type == 'send') {
        $('.chatContainerScroll').append(`
            <li class="chat-right">
                <div class="chat-hour">${message_date} <span class="fa fa-check-circle"></span></div>
                <div class="chat-text">${res.msg}</div>
                <div class="chat-avatar">
                    <img src="https://www.bootdey.com/img/Content/avatar/avatar${res.user_random}.png">
                    <div class="chat-name">${res.username}</div>
                </div>
            </li>
        `);
    }

    // Scroll down
    chat_container.scrollTop = chat_container.scrollHeight;
});

socket.on('users_list', users => {
    $('.users').html('');

    for (let each of users) {
        $('.users').append(`
            <li class="person" id="${each.id}">
                <div class="user">
                    <img src="https://www.bootdey.com/img/Content/avatar/avatar${each.random}.png">
                    <span class="status online"></span>
                </div>
                <p class="name-time">
                    <span class="name">${each.username}</span>
                    <span class="time"></span>
                </p>
            </li>
        `);
    };
});

$(document).on('click', '.person', e => {
    let person_id = e.currentTarget.id;

    if (person_id) {
        to_id = person_id;

        $.get('/find/' + person_id, (result) => {
            if (result) {
                $('.to-name').html(result.username);
                $('.chat-profile').attr('src', `https://www.bootdey.com/img/Content/avatar/avatar${result.random}.png`);
                $('#chat-screen').css('display', 'block');
            }
        });
    }
    else console.log('Hata');
});

$('#message-area').keypress(e => {
    if (e.which == 13) {
        let msg = e.target.value.trim();
        e.target.value = '';

        socket.emit('chat_message', { token, to_id, msg });
    }
})