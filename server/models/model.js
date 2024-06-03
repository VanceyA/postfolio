const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

// Post
const postSchema = Schema({
    description: String,
    website_url: {
        type: String,
        require: [true, "Post must have a website url!"]
    },
    image_url: {
        type: String,
        require: [true, "Post must have an image!"]
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Post must have an author!"]
    },
    author_username: {
        type: String,
        required: [true, "Post must have an author name!"]
    },
    likes: {
        type: Number,
        required: true,
        default: 0
    },
    likedBy: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        default: []
    }]
    // categories: [{ type: Schema.Types.ObjectId, ref: "Category"}]
}, {
    timestamps: true
});

const Post = mongoose.model('Post', postSchema);




// User
const userSchema = Schema({
    username: {
        type: String,
        required: [true, "User must have a username!"],
        unique: true
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: "Post",
        default: []
    }],
    liked_posts: [{
        type: Schema.Types.ObjectId,
        ref: "Post",
        default: []
    }],
    followers: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        default: []
    }],
    followerCount: {
        type: Number,
        default: 0
    },
    following: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        default: []
    }],
    followingCount: {
        type: Number,
        default: 0
    },
    encryptedPassword: {
        type: String,
        required: [true, "User must have a password!"]
    }
}, {
    toJSON: {
    versionKey: false,
    transform(doc, ret) {
        delete ret.encryptedPassword;
    }
    }
});

userSchema.methods.setEncryptedPassword = function(password) {
    var promise = new Promise((resolve, reject) => {
        bcrypt.hash(password, 12).then((hash) => {
            this.encryptedPassword = hash;
            resolve();
        })
        .catch((err) => {
            reject(err);
        });
    });

    return promise;
};

userSchema.methods.verifyPassword = function(password) {
    var promise = new Promise((resolve, reject) => {
        bcrypt.compare(password, this.encryptedPassword).then((isVerified) => {
            resolve(isVerified);
        })
        .catch((err) => {
            reject(err);
        });
    });

    return promise;
};

const User = mongoose.model('User', userSchema);







/*
// Category
const categorySchema = mongoose.Schema({
    category_name: String,
    description: String,
    category_posts: [{ type: Schema.Types.ObjectId, ref: "Post"}]
});

const Category = mongoose.model('Category', categorySchema);

*/

module.exports = {
    Post: Post,
    User: User
    // Category: Category
};