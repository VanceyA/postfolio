# Postfolio

## Resource

**Posts**

Attributes:

* description (String)
* website_url (String)
* image_url (String)
* author_id (ObjectId)
* author_username (String)
* likes (Number)
* likedBy ([ObjectId])
* createdAt (Timestamp)
* updatedAt (Timestamp)


**User**

Attributes:

* username (string)
* posts (ObjectId)


## Schema

```javascript
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
    author_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Post must have an author id!"]
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
}, {timestamps: true});


const userSchema = Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post"}],
});
```

## REST Endpoints

Name                                         | Method | Path
---------------------------------------------|--------|------------------
Retrieve posts collection (default page = 1) | GET    | /api/posts?page=x
Create post member                           | POST   | /api/posts
Update post member                           | PUT    | /api/posts/*\<id\>*
Delete post member                           | DELETE | /api/posts/*\<id\>*
Retrieve popular posts (default page = 1)    | GET    | /api/explore?page=x


## Deployed URL

Deployed together on Render.com
https://s24-project1-vanceya.onrender.com


## Designs
All designs are located in the designs folder