const passport = require("passport");
const { Strategy } = require("passport-facebook");
const { authenticate } = require("./jwt")
const UserModel = require("../user/schema")
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy



passport.use(
  new Strategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `http://localhost:3003/user/facebookLogIn/redirect`,
      profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']

    },
    async (accessToken, refreshToken, profile, done) => {
      const newUser = {
        facebookId: profile.id,
        name: profile.name.givenName,
        surname: profile.name.familyName,
        email: profile.emails[0].value,
        //role: "user",
        password: profile.id,
        refreshTokens: [],
      }
       
      try {
         const user = await UserModel.findOne({ facebookId: profile.id })
        if (user) {
          const tokens = await authenticate(user)
          done(null, { user, tokens })
        } else {
          let createdUser = await UserModel.create(newUser)
          const tokens = await authenticate(createdUser)
          done(null, { user, tokens })
        } 
      } catch (error) {
        console.log(error)
        done(error)
      }
    }
  )
)

passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_APP_ID,
      clientSecret: process.env.LINKEDIN_APP_SECRET,
      callbackURL: `http://localhost:3003/user/auth/LinkedIn/redirect`,
      scope: ["r_liteprofile", "r_emailaddress"],

    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      const newUser = {
        LinkedInId: profile.id,
        name: profile.name.givenName,
        surname: profile.name.familyName,
        email: profile.emails[0].value,
        //role: "user",
        password: profile.id,
        refreshTokens: [],
      }
       
      try {
         const user = await UserModel.findOne({ LinkedInId: profile.id })
        if (user) {
          const tokens = await authenticate(user)
          done(null, { user, tokens })
        } else {
          let createdUser = await UserModel.create(newUser)
          const tokens = await authenticate(createdUser)
          done(null, { user, tokens })
        } 
      } catch (error) {
        console.log(error)
        done(error)
      }
    }
  )
)

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})


module.exports = passport;