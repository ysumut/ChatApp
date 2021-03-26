const socket = io();
const token = ("; " + document.cookie).split("; chatapp_token=").pop().split(";").shift();
const random = Math.floor(Math.random() * 8) + 1;

let to_id = "";

socket.emit('join_app', { token, random });

socket.on('chat_message', msg => {
    $('.chatContainerScroll').append(`
        <li class="chat-left">
            <div class="chat-avatar">
                <img src="https://www.bootdey.com/img/Content/avatar/avatar8.png">
                <div class="chat-name">Sam</div>
            </div>
            <div class="chat-text">${msg}</div>
            <div class="chat-hour">08:56 <span class="fa fa-check-circle"></span></div>
        </li>
    `);
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

    $('.person').off('click');

    $('[class=person]').click(e => {
        let person = users.filter(item => item.id == e.target.id)[0];
        to_id = person.id;

        $('.to-name').html(person.username)
    });
});

$('#message-area').keypress(e => {
    if (e.which == 13) {
        let msg = e.target.value.trim();
        e.target.value = '';

        $('.chatContainerScroll').append(`
            <li class="chat-right">
                <div class="chat-hour">08:56 <span class="fa fa-check-circle"></span></div>
                <div class="chat-text">${msg}</div>
                <div class="chat-avatar">
                    <img src="https://www.bootdey.com/img/Content/avatar/avatar${random}.png">
                    <div class="chat-name">Sam</div>
                </div>
            </li>
        `);

        socket.emit('chat_message', { token: token, to: to_id, message: msg});
    }


})