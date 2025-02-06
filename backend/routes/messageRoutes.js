const express = require('express');
const router = express.Router();
const GroupMessage = require('../models/GroupMessage');

const CHAT_ROOMS = ['devops', 'cloud computing', 'covid19', 'sports', 'nodeJS'];

router.get('/rooms', (req, res) => {
    res.json(CHAT_ROOMS);
});


router.get('/messages/:room', async (req, res) => {
    try {
        const messages = await GroupMessage.find({ room: req.params.room })
        .sort({ date_sent: -1 })
            .limit(50);
        res.json(messages);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
});

module.exports = router;