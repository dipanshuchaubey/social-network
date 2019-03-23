const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Post Model
const Post = require("../../models/Post");
// Load Validator
const validatePostInput = require("../../validation/post");
// Load profile model
const profile = require("../../models/Profile");

// route    >>  GET api/posts/test
// desc     >>  Test post route
// access   >>  Public
router.get("/test", (req, res) => res.json({ msg: "Posts Works" }));

// route    >>  GET api/posts
// desc     >>  GET all Posts
// access   >>  Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopost: "No posts found" }));
});

// route    >>  GET api/posts/:id
// desc     >>  GET Post by id
// access   >>  Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ nopost: "No post found" }));
});

// route    >>  POST api/posts
// desc     >>  Create Post
// access   >>  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

// route    >>  DELETE api/posts/:id
// desc     >>  DELETE Post
// access   >>  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check for post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: "User not authorized" });
          }

          // delete
          post.delete().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ nopost: "No post found" }));
    });
  }
);

module.exports = router;
