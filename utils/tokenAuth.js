const jwt = require('jsonwebtoken');
const TOKEN_SECRET = process.env.TOKEN_SECRET || "123456789";

const sign = (payload) => {
    return jwt.sign(payload, TOKEN_SECRET, { expiresIn: '1h' });
}

const verify = (chatapp_token) => {
    try {
        return jwt.verify(chatapp_token, TOKEN_SECRET);
    } catch (err) {
        return false;
    }
}

module.exports = {
    sign, verify
}