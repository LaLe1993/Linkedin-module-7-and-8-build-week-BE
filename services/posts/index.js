const express = require("express");
const postModel = require("./schema");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const ProfilesModel = require("../profiles/schema");
const userModel = require("../auth/user/schema")
const { verifyJWT } = require("../auth/utilits/jwt.js");


const router = express.Router();
const upload = multer({});

// GET all posts
router.get("/", async (req, res) => {
  const posts = await postModel.find();
  //res.set("Content-Type", post.image.contentType);
  res.send(posts);
});

// GET a specific post

router.get("/:id", async (req, res) => {
  postModel.findById(req.params.id, function (err, post) {
    //res.set("Content-Type", post.image.contentType);
    console.log(post);
    res.send(post);
  });
});

//POST a post
router.post("/", async (req, res) => {
  const token = req.cookies.accessToken
  const decodedToken = await verifyJWT(token)
  console.log("decoded",decodedToken)
  const user = await userModel.findById(decodedToken._id);
   console.log("decodeduser",user);
  if (user) {
    const post = { ...req.body, username: user.username, user };
    const file = await new postModel(post);
    console.log(post);
    file.save();

    res.send(file._id);
  } else {
    res.send("You need to registered to post");
  }
});

//POST a image
router.post("/:id", upload.single("image"), async (req, res) => {
  const imagesPath = path.join(__dirname, "/images");
  await fs.writeFile(
    path.join(
      imagesPath,
      req.params.id + "." + req.file.originalname.split(".").pop()
    ),
    req.file.buffer
  );
  console.log(req.file);
  //
  var obj = {
    image: fs.readFileSync(
      path.join(
        __dirname +
          "/images/" +
          req.params.id +
          "." +
          req.file.originalname.split(".").pop()
      )
    ),
  };
  console.log(obj);
  //

  await postModel.findByIdAndUpdate(req.params.id, obj);
  res.send("image added successfully");
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
