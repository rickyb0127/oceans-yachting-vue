const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: String,
    body: String
  }, {
    timestamps: true
  }, {
    collection: 'posts'
});

const Post = mongoose.model('Post', PostSchema);

//GET
router.get("/", (req, res) => {
  Post.find({}, function (error, posts) {
    if (error) {
      console.error(error);
    } else {
      res.send({
        posts
      });
    }
  });
});

//POST
router.post("/", (req, res) => {
  var new_post = new Post({
    title: req.body.title,
    body: req.body.body
  });

  new_post.save(function (error) {
    if (error) {
      console.log(error);
    } else {
      res.send({
        success: true,
        message: "Post saved successfully"
      });
    }
  });
});

//DELETE
router.delete("/:id", (req, res) => {
  Post.deleteOne({
    _id: req.params.id
  }, function (error, post) {
    if (error) {
      res.send(error)
    } else {
      res.send({
        success: true
      });
    }
  });
});

module.exports = router;