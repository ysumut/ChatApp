const socket = io();
const token = ("; " + document.cookie).split("; chatapp_token=").pop().split(";").shift();
const chat_container = document.querySelector('.chatContainerScroll');

let to_id = "";

localStorage.setItem('chatapp-messages', "[]");

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

const getLocalMsg = (user_id) => JSON.parse(localStorage.getItem('chatapp-messages')).find(item => item.id == user_id);

const printMsg = (type, random, username, msg, date) => {
    if (type == 'get') {
        $('.chatContainerScroll').append(`
            <li class="chat-left">
                <div class="chat-avatar">
                    <img src="https://www.bootdey.com/img/Content/avatar/avatar${random}.png">
                    <div class="chat-name">${username}</div>
                </div>
                <div class="chat-text">${msg}</div>
                <div class="chat-hour">${date} <span class="fa fa-check-circle"></span></div>
            </li>
        `);
    }
    if (type == 'send') {
        $('.chatContainerScroll').append(`
            <li class="chat-right">
                <div class="chat-hour">${date} <span class="fa fa-check-circle"></span></div>
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

socket.on('chat_message', res => {
    // Convert UTC to Local Time
    let message_date = new Date(res.date).toLocaleTimeString().substr(0, 5);

    // Print chat screen
    if(res.type == 'send' || (res.type == 'get' && to_id == res.from_id))
        printMsg(res.type, res.user_random, res.username, res.msg, message_date);

    // Add local storage
    let user_id = (res.type == 'get') ? res.from_id : res.to_id;
    addLocalMsg(user_id, { type: res.type, msg: res.msg, date: message_date });

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
            let to_user = result.to_user;
            if (to_user) {
                $('.to-name').html(to_user.username);
                $('.chat-profile').attr('src', `https://www.bootdey.com/img/Content/avatar/avatar${to_user.random}.png`);
                $('.chatContainerScroll').html('');

                let local_chat = getLocalMsg(person_id);
                if (local_chat) {
                    for(let each of local_chat.messages) {
                        let random = (each.type == 'get') ? to_user.random : result.my_random;
                        printMsg(each.type, random, to_user.username, each.msg, each.date);
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

$('#message-area').keypress(e => {
    if (e.which == 13) {
        let msg = e.currentTarget.value.trim();
        e.currentTarget.value = '';

        if (!msg) return;
        socket.emit('chat_message', { token, to_id, msg });
    }
})