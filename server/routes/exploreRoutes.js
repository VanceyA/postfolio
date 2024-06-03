const express = require('express');
const router = express.Router();
const API = require('../controllers/api');

function authorizeRequest(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).send("Not authenticated!");
    }
}


router.get('/', authorizeRequest, API.fetchSomePopularPosts);


module.exports = router;