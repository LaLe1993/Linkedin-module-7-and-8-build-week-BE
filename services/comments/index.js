const express = require("express");
const commentModel = require("./schema");
const ProfilesModel = require("../profiles/schema");

const router = express.Router();

// GET all comments
router.get("/", async (req, res) => {
  const comments = await commentModel.find();
  //res.set("Content-Type", post.image.contentType);
  res.send(comments);
});

// GET comments by postid

router.get("/:id", async (req, res) => {
  let comments = await commentModel.find({ postId: req.params.id });
  res.send(comments);
});

//POST a post
router.post("/", async (req, res) => {
  console.log(req.headers.user);
  const user = await ProfilesModel.findOne({ username: req.headers.user });
  // console.log(user);
  if (user) {
    const post = { ...req.body, username: req.headers.user, user };
    const file = await new commentModel(post);
    console.log(post);
    file.save();

    res.send(file._id);
  } else {
    res.send("You need to registered to comment");
  }
});

//PUT
router.put("/:id", async (req, res) => {
  await postModel.findByIdAndUpdate(req.params.id, req.body);
  res.send("updated sucessfully");
});

//DELETE

router.delete("/:id", async (req, res) => {
  await postModel.findByIdAndDelete(req.params.id);
  res.send("Deleted sucessfully");
});

module.exports = router;
