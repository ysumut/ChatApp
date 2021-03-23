const usersList = [];

const newUser = (id, user_name) => {
    const user = { id, user_name };
    usersList.push(user);

    return user;
}

module.exports = {
    newUser
}