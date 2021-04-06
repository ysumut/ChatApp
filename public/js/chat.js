const socket = io();
const token = ("; " + document.cookie).split("; chatapp_token=").pop().split(";").shift();
const chat_container = document.querySelector('.chatContainerScroll');
const message_area = $('#message-area'), send_button = $('#send-button');

let to_id = "", typing_count = 0;

localStorage.setItem('chatapp-messages', "[]");

const getLocalMsg = (user_id) => JSON.parse(localStorage.getItem('chatapp-messages')).find(item => item.id == user_id);

const addLocalMsg = (user_id, message) => {
    let local_chat = JSON.parse(localStorage.getItem('chatapp-messages'));
    let chat_id = local_chat.findIndex(item => item.id == user_id);

    if (chat_id == -1) {
        local_chat.push({
            id: user_id,
            messages: [message]
        });
    }
    else {
        local_chat[chat_id].messages.push(message);
    }

    localStorage.setItem('chatapp-messages', JSON.stringify(local_chat));
}

const printMsg = (type, random, username, msg, date, is_read) => {
    let check_color = is_read ? 'green' : 'grey';

    if (type == 'get') {
        $('.chatContainerScroll').append(`
            <li class="chat-left">
                <div class="chat-avatar">
                    <img src="https://www.bootdey.com/img/Content/avatar/avatar${random}.png">
                    <div class="chat-name">${username}</div>
                </div>
                <div class="chat-text">${msg}</div>
                <div class="chat-hour">${date}</div>
            </li>
        `);
    }
    if (type == 'send') {
        $('.chatContainerScroll').append(`
            <li class="chat-right">
                <div class="chat-hour">${date} <span class="fa fa-check-circle" style="color: ${check_color}"></span></div>
                <div class="chat-text">${msg}</div>
                <div class="chat-avatar">
                    <img src="https://www.bootdey.com/img/Content/avatar/avatar${random}.png">
                    <div class="chat-name">${username}</div>
                </div>
            </li>
        `);
    }
}

socket.emit('join_app', token);

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
                    <span id="unread" class="badge badge-pill badge-success" style="visibility: hidden;">0</span>
                </p>
            </li>
        `);
    };
});

socket.on('chat_message', res => {
    let is_read = (res.type == 'get' && to_id == res.from_id) ? true : false;

    // Convert UTC to Local Time
    let message_date = new Date(res.date).toLocaleTimeString().substr(0, 5);

    // Print chat screen
    if (res.type == 'send' || (res.type == 'get' && to_id == res.from_id)) {
        printMsg(res.type, res.user_random, res.username, res.msg, message_date, is_read);
    }

    // Add local storage
    let user_id = (res.type == 'get') ? res.from_id : res.to_id;
    addLocalMsg(user_id, { type: res.type, msg: res.msg, date: message_date, is_read });

    // Read all messages of person
    if(is_read) socket.emit('read_messages', { msg_own: res.from_id });

    // Scroll down
    chat_container.scrollTop = chat_container.scrollHeight;
});

socket.on('chat_typing', res => {
    if (res.from_id == to_id) {
        $('#typing').css('visibility', 'visible');
        typing_count++;
        let scope_typing_count = typing_count;

        setTimeout(() => {
            if (scope_typing_count == typing_count)
                $('#typing').css('visibility', 'hidden');
        }, 500);
    }
});

socket.on('read_messages', res => {
    let local_chat = JSON.parse(localStorage.getItem('chatapp-messages'));
    let chat_id = local_chat.findIndex(item => item.id == res.user_id);
    let msg_type = res.is_own ? 'send' : 'get';

    if (chat_id !== -1) {
        for (let each of local_chat[chat_id].messages) if(each.type == msg_type) each.is_read = true;
        localStorage.setItem('chatapp-messages', JSON.stringify(local_chat));

        if (res.user_id == to_id) {
            let person = $('li#' + res.user_id).find('#unread');
            person.html(0);
            person.css('visibility', 'hidden');
        }
    }
});

$(document).on('click', '.person', e => {
    let person_id = e.currentTarget.id;

    if (person_id) {
        to_id = person_id;

        $.get('/find/' + person_id, (result) => {
            let from_user = result.from_user;
            let to_user = result.to_user;

            if (to_user) {
                $('.to-name').html(to_user.username);
                $('.chat-profile').attr('src', `https://www.bootdey.com/img/Content/avatar/avatar${to_user.random}.png`);
                $('.chatContainerScroll').html('');

                // Read all messages of person
                socket.emit('read_messages', { msg_own: person_id });

                let local_chat = getLocalMsg(person_id);
                if (local_chat) {
                    for (let each of local_chat.messages) {
                        let username = (each.type == 'get') ? to_user.username : from_user.username;
                        let random = (each.type == 'get') ? to_user.random : from_user.random;
                        printMsg(each.type, random, username, each.msg, each.date, each.is_read);
                    }
                }

                // Scroll down and visible
                chat_container.scrollTop = chat_container.scrollHeight;
                $('#chat-screen').css('display', 'block');
            }
        });
    }
    else console.log('Hata');
});

message_area.keydown(e => {
    if (e.which == 13) { // press enter
        e.preventDefault();
        send_button.click();
    }
    else {
        socket.emit('chat_typing', { to_id });
    }
});

send_button.click(() => {
    let msg = message_area.val().trim();
    message_area.val('');
    message_area.focus();

    if (!msg) return;
    socket.emit('chat_message', { token, to_id, msg });
});

setInterval(() => {
    const chatapp_local = JSON.parse(localStorage.getItem('chatapp-messages'));

    for (let each of chatapp_local) {
        let unread_count = 0;

        for (let msg of each.messages) if (msg.type == 'get' && !msg.is_read) unread_count++;

        if (unread_count > 0) {
            let person = $('li#' + each.id).find('#unread');
            person.html(unread_count);
            person.css('visibility', 'visible');
        }
    }
}, 1000);