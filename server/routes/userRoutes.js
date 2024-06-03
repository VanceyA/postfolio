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



// create user
router.post('/users', API.createUser);

// retrieve session
router.get('/session', authorizeRequest, API.getSession);

// logout user
router.delete('/session', authorizeRequest, API.logoutUser);

// authentication: create session
router.post('/session', API.loginUser);



module.exports = router;