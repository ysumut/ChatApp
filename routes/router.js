const router = require("express").Router();
const { sign, verify } = require("../utils/tokenAuth");

// Routers
router.get('/', (req, res) => res.sendFile('public/login.html', { root: __dirname + '/..' }));

router.post('/login', (req, res) => {
    const token = sign({ username: req.body.username });
    res.cookie('chatapp_token', token);

    return res.redirect('/chat');
});

router.get('/chat', (req, res) => {
    const data = verify(req.cookies.chatapp_token);

    if(!data) return res.redirect('/');
        
    return res.sendFile('public/chat.html', { root: __dirname + '/..' })
});

module.exports = router;