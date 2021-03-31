const router = require("express").Router();
const { sign, verify } = require("../utils/tokenAuth");
const { findUser } = require("../utils/users");

// Routers
router.get('/', (req, res) => res.sendFile('public/login.html', { root: __dirname + '/..' }));

router.post('/login', (req, res) => {
    const random = Math.floor(Math.random() * 8) + 1;
    const token = sign({ username: req.body.username, random: random });
    
    res.cookie('chatapp_token', token);
    return res.redirect('/chat');
});

router.get('/chat', (req, res) => {
    const data = verify(req.cookies.chatapp_token);

    if (!data) return res.redirect('/');

    return res.sendFile('public/chat.html', { root: __dirname + '/..' })
});

router.get('/find/:id', (req, res) => {
    const token_result = verify(req.cookies.chatapp_token);
    if(!token_result) return res.json({});

    res.json({
        from_user: {username: token_result.username, random: token_result.random},
        to_user: findUser(req.params.id)
    });
});

module.exports = router;