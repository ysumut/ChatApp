let usersList = [];

const addUser = (id, username, random) => {
    let user = { id, username, random };
    usersList.push(user);

    return user;
}

const removeUser = (id) => {
    usersList = usersList.filter(item => item.id != id);
}

const getUsersList = () => usersList;

const findUser = (id) => usersList.find(item => item.id == id);

module.exports = {
    addUser, removeUser, getUsersList, findUser
}