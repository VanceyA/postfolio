const model = require('../models/model');
const aws = require('aws-sdk');
const { request } = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

aws.config.update({
    accessKeyId: process.env.AMAZON_ACCESS_KEY,
    secretAccessKey: process.env.AMAZON_SECRET_KEY,
    region: 'us-west-1'
});

const s3 = new aws.S3();
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'postfolio-post-images',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        fileName: file.originalname
      });
    },
    key: function (req, file, cb) {
      let path = `images/${Date.now()}-${file.originalname}`;
      cb(null, path);
    }
  })
});
const singleUpload = upload.single('image');

class API {

    // static async testHello(req, res) {
    //     res.status(200).send("Hello world!");
    // }
    
    // fetch all posts
    // static async fetchAllPosts(req, res) {
    //     try {
    //         const posts = await model.Post.find();
    //         res.status(200).json(posts);
    //     } catch (err) {
    //         // res.status(404).json({message: err.message});
    //         res.status(500);

    //     }
    // }

    // fetch up to number requested by client
    static async fetchSomePosts(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = 3;

        try {
            const posts = await model.Post.find()
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 });
            res.status(200).json(posts);
            return;
        } catch (err) {
            if (err.errors) {
                var errorMessages = {};
                for (var fieldName in err.errors) {
                    errorMessages[fieldName] = err.errors[fieldName].message;
                }
                return res.status(422).json(errorMessages);
            } else {
                return res.status(500).send("Unknown server error");
            }
        }
    }

    // fetch posts in order by likes
    static async fetchSomePopularPosts(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = 3;

        try {
            const posts = await model.Post.find()
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ likes: -1 });
            res.status(200).json(posts);
            return;
        } catch (err) {
            if (err.errors) {
                var errorMessages = {};
                for (var fieldName in err.errors) {
                    errorMessages[fieldName] = err.errors[fieldName].message;
                }
                return res.status(422).json(errorMessages);
            } else {
                return res.status(500).send("Unknown server error");
            }
        }
    }

    // like a post
    static async likeOrUnlikePost(req, res) {
        const id = req.params.id;
        
        try {
            model.Post.findById(id)
            .then((post) => {
                if (!post) {
                    res.status(404).send("Post not found!");
                }

                model.User.findOne({_id: req.session.userId})
                .then((user)=> {
                    if (!user) {
                        res.status(404).send("User not found!");
                        return;
                    }
                    if (!post.likedBy.includes(user._id)) {
                        post.likes += 1;
                        post.likedBy.push(user._id);
                        post.save().then((newPost) => {
                            res.status(201).json(newPost);
                            return;
                        });
                        ;
                    } else {
                        post.likes -= 1;
                        const index = post.likedBy.indexOf(user._id);
                        const removedUser = post.likedBy.splice(index, 1);

                        post.save().then((newPost) => {
                            res.status(201).json(newPost);
                            return;
                        });
                    }
                })
            });      
        } catch (err) {
            if (err.errors) {
                var errorMessages = {};
                for (var fieldName in err.errors) {
                    errorMessages[fieldName] = err.errors[fieldName].message;
                }
                return res.status(422).json(errorMessages);
            } else {
                return res.status(500).send("Unknown server error");
            }
        }
    }

    // create a post
    static async createPost(req, res) {

        singleUpload(req, res, function (err) {
            if (err) {
                console.error('Error occurred:', err);
                return res.sendStatus(422);
            }

            model.User.findOne({_id: req.session.userId})
            .then((user)=> {
                let website = req.body.website_url;
                website = website.replace(/^https?:\/\//, '');

                model.Post.create({
                    author: user._id,
                    author_username: user.username,
                    website_url: website,
                    description: req.body.description,
                    image_url: req.file.location
                })
                .then((post) => {
                    user.posts.push(post._id);
                    user.save();
                    return res.sendStatus(201);
                })
                .catch((err) => {
                    if (err.errors) {
                        var errorMessages = {};
                        for (var fieldName in err.errors) {
                            errorMessages[fieldName] = err.errors[fieldName].message;
                        }
                        return res.status(422).json(errorMessages);
                    } else {
                        return res.status(500).send("Unknown server error");
                    }
                });
            })
            .catch((err) => {
                return res.status(404).json(err);
            });
        });

    }

    // delete a post
    static async deletePost(req, res) {
        const id = req.params.id;
        try {
            model.User.findOne({_id: req.session.userId})
            .then((user)=> {
                if (!user) {
                    res.status(404).send("User not found!");
                    return;
                }
                try {
                    model.Post.findOneAndDelete({ _id: id, author: req.session.userId })
                    .then((post) => {
                        if (post) {
                            const index = user.posts.indexOf(post._id);
                            const removedPost = user.posts.splice(index, 1);
                            user.save();
                            return res.sendStatus(204);
                        } else {
                            return res.status(404).send("Post not found!");
                        }
                    })
                    .catch((err) => {
                        if (err.errors) {
                            var errorMessages = {};
                            for (var fieldName in err.errors) {
                                errorMessages[fieldName] = err.errors[fieldName].message;
                            }
                            return res.status(422).json(errorMessages);
                        } else {
                            return res.status(500).send("Unknown server error");
                        }
                    });
                } catch (err) {
                    if (err.errors) {
                        var errorMessages = {};
                        for (var fieldName in err.errors) {
                            errorMessages[fieldName] = err.errors[fieldName].message;
                        }
                        return res.status(422).json(errorMessages);
                    } else {
                        return res.status(500).send("Unknown server error");
                    }
                }
            })   
        } catch (err) {
            if (err.errors) {
                var errorMessages = {};
                for (var fieldName in err.errors) {
                    errorMessages[fieldName] = err.errors[fieldName].message;
                }
                return res.status(422).json(errorMessages);
            } else {
                return res.status(500).send("Unknown server error");
            }
        }
    }

    // create user
    static async createUser(req, res) {

        const newUser = new model.User({
            username: req.body.username
        });

        newUser.setEncryptedPassword(req.body.password).then(function () {
            newUser.save().then(() => {
                req.session.userId = newUser._id;
                res.status(201).json(newUser);
            }).catch((err) => {
                if (err.errors) {
                    var errorMessages = {};
                    for (var fieldName in err.errors) {
                        errorMessages[fieldName] = err.errors[fieldName].message;
                    }
                    return res.status(422).json(errorMessages);
                } else if (err.code == 11000) {
                    return res.status(422).json({ username: "User with that username already exists!" });
                } else {
                    console.log(err);
                    return res.status(500).send("Unknown error creating user.");
                }
            });
        });
    }

    static async getSession(req, res) {
        model.User.findOne({_id: req.session.userId}).then((user) => {
            res.json(user);
        })
    }

    static async logoutUser(req, res) {
        req.session.userId = null;
        res.status(200).send("Logged out!");
    }

    static async loginUser(req, res) {
        model.User.findOne({ username: req.body.username }).then((user) => {
            if (user) {
                user.verifyPassword(req.body.password).then((isVerified) => {
                    if (isVerified) {
                        req.session.userId = user._id;
                        res.status(201).json(user);
                    } else {
                        res.status(401).send("Invalid password!");
                    }
                });
            } else {
                res.status(401).send("Not authenticated!");
            }
        });
    }
}

module.exports = API;