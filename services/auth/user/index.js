const router = require("express").Router();
const UserModel = require("./schema");
const authorize = require("../middleware/authorize");
const { authenticate, refreshToken } = require("../utilits/jwt");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const upload = multer({});
const passport = require("../utilits/oauth")

//return all profiles

router.get("/", authorize, async (req, res, next) => {
  try {
    const users = await UserModel.find();
    console.log(users);
    res.status(200).send(users);
  } catch (error) {
    next("No user Found");
  }
});
// return single user
router.get("/me", authorize, (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next("No user Found");
  }
});

//register route

router.post("/signUp", upload.single("image"), async (req, res, next) => {
  try {
    if (req.file) {
      const imagesPath = path.join(__dirname, "/images");
      await fs.writeFile(
        path.join(
          imagesPath,
          req.body.username + "." + req.file.originalname.split(".").pop()
        ),
        req.file.buffer
      );
      var obj = {
        ...req.body,
        image: fs.readFileSync(
          path.join(
            __dirname +
              "/images/" +
              req.body.username +
              "." +
              req.file.originalname.split(".").pop()
          )
        ),
      };
    } else {
      var obj = {
        ...req.body,
        image: fs.readFileSync(path.join(__dirname, "./images/default.jpg")),
      };
    }

    const newUser = new UserModel(obj);
    const { _id } = await newUser.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

// add profile picture
router.post(
  "/uploadImage",
  upload.single("image"),
  authorize,
  async (req, res) => {
    const imagesPath = path.join(__dirname, "/images");
    await fs.writeFile(
      path.join(
        imagesPath,
        req.params.id + "." + req.file.originalname.split(".").pop()
      ),
      req.file.buffer
    );

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
    //
    await UserModel.findByIdAndUpdate(req.user._id, obj);
    res.send("image added successfully");
  }
);

//login route
router.post("/signIn", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findByCredentials(email, password);
    console.log(user);
    const { token, refreshToken } = await authenticate(user);
    console.log("created", token);
    res.cookie("accessToken", token, {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: false,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: false,
    });
    res.status(200).send({ accessToken: token, refreshToken });
  } catch (error) {
    next(error);
  }
});

//logout route
router.post("/signOut", authorize, async (req, res, next) => {
  try {
    req.user.refreshTokens = req.user.refreshTokens.filter(
      (t) => t.token !== req.body.refreshToken
    );
    await req.user.save();
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.send("You are succesfully Sign out from LinkedIn");
  } catch (err) {
    next(err);
  }
});

router.post("/refreshToken", async (req, res, next) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    const err = new Error("Refresh token missing");
    err.httpStatusCode = 403;
    next(err);
  } else {
    try {
      const tokens = await refreshToken(oldRefreshToken);

      res.cookie("accessToken", tokens.token, {
        //httpOnly: true,
        //path: "/",
      });
      res.cookie("refreshToken", tokens.refreshToken, {
        //httpOnly: true,
        path: ["/user/refreshToken", "/user/signOut"],
      });
      res.send(tokens);
    } catch (error) {
      console.log(error);
      const err = new Error(error);
      err.httpStatusCode = 403;
      next(err);
    }
  }
});

// Modify a profile
router.put("/", authorize, async (req, res, next) => {
  try {
    const profile = await UserModel.findOneAndUpdate(req.user._id, req.body);
    if (profile) {
      res.status(200).send("OK");
    } else {
      const error = new Error(`Profile with id ${req.params.id} not found!`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

// Delete a profile
router.delete("/", async (req, res, next) => {
  try {
    const profile = await UserModel.findByIdAndDelete(req.user._id);
    if (profile) {
      res.status(200).send("Delete!");
    } else {
      const error = new Error(`Profile with id ${req.params.id} not found!`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});
router.get(
  "/auth/fbSignIn",
  passport.authenticate('facebook')
)
router.get(
  "/auth/fbSignIn/redirect",
  passport.authenticate("facebook"),
  async (req, res, next) => {
    try {
      console.log(req.user)
      const { token, refreshToken } = req.user.tokens
      res.cookie("accessToken", token, {
        httpOnly: true,
        path: "/"
      })
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: ["/user/refreshToken", "/user/signOut"],
      })
      res.status(200)
    } catch (error) {
      console.log(error)
      next(error)
    
    }
  }
)

router.get(
  "/auth/LinkedIn",
  passport.authenticate('linkedin')
)
router.get(
  "/auth/LinkedIn/redirect",
  passport.authenticate("linkedin"),
  async (req, res, next) => {
    try {
      console.log(req.user)
      const { token, refreshToken } = req.user.tokens
      res.cookie("accessToken", token, {
        //httpOnly: true,
        path: "/"
      })
      res.cookie("refreshToken", refreshToken, {
        //httpOnly: true,
        path: ["/user/refreshToken", "/user/signOut"],
      })
      res.status(200)
    } catch (error) {
      console.log(error)
      next(error)
    
    }
  }
)

module.exports = router;
