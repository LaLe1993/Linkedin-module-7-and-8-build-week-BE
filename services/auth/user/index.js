const router = require("express").Router()
const UserModel = require("./schema")
const authorize = require("../middleware/authorize")
const {authenticate, refreshToken} = require("../utilits/jwt")

router.get("/", authorize , (req, res, next)=>{
    try {      
        res.send(req.user)
      } catch (error) {        
        next("No user Found")
      }
})

router.post("/signUp",async(req,res,next)=>{
    try {
        const newUser = new UserModel(req.body)
        const { _id } = await newUser.save()

        res.status(201).send(_id)
    } catch (error) {
        next(error)
    }
    
})

router.post("/signIn", async (req, res, next) => {
    try {
      const { email, password } = req.body
      const user = await UserModel.findByCredentials(email, password)
      const { token, refreshToken } = await authenticate(user)
      res.cookie("accessToken", token, {
        httpOnly: true,
        path: "/",
      })
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: "/",
      })
      res.status(200).send({accessToken:token,refreshToken})
    } catch (error) {
      next(error)
    }
  })
router.post("/signOut", authorize, async (req, res, next) => {
    try {
      
      req.user.refreshTokens = req.user.refreshTokens.filter(
        (t) => t.token !== req.body.refreshToken
      )
      await req.user.save()
      res.clearCookie("accessToken")
      res.clearCookie("refreshToken")
      res.send('You are succesfully Sign out from LinkedIn');
      
    } catch (err) {
      next(err)
    }
  })

router.post("/refreshToken", async (req, res, next) => {
    const oldRefreshToken = req.cookies.refreshToken
    if (!oldRefreshToken) {
      const err = new Error("Refresh token missing")
      err.httpStatusCode = 403
      next(err)
    } else {
      try {
        const tokens = await refreshToken(oldRefreshToken)
  
        res.cookie("accessToken", tokens.token, {
          httpOnly: true,
          path: "/",
        })
        res.cookie("refreshToken", tokens.refreshToken, {
          httpOnly: true,
          path: "/",
        })
        res.send()
      } catch (error) {
        console.log(error)
        const err = new Error(error)
        err.httpStatusCode = 403
        next(err)
      }
    }
  })


module.exports = router

