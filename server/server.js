const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();


const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: false
}));

mongoose.connect(process.env.MONGO_URI);

const port = process.env.PORT || 8080;

// my middleware



app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/explore', require('./routes/exploreRoutes'));
app.use('/api', require('./routes/userRoutes'));


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});