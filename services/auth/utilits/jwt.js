const passport = require("passport")
const jwt = require("jsonwebtoken")
const User = require("../user/schema")

const refreshToken = async (oldRefreshToken) => {

  const decoded = await verifyRefreshToken(oldRefreshToken)

  const user = await User.findOne({_id: decoded._id})

  if (!user) {
      throw new Error(`Access is not allowed`)
  }

  const currentRefreshToken = user.refreshTokens.find(
      (t) => t.token === oldRefreshToken
  )

  if (!currentRefreshToken) {
      throw new Error (`Refresh Token is not correct`)
  }
  const newAccessToken = await generateJWT({ _id: user._id })
  const newRefreshToken = await generateRefreshJWT({ _id: user._id })

  const newRefreshTokens = user.refreshTokens
  .filter((t) => t.token !== oldRefreshToken)
  .concat({ token: newRefreshToken })

user.refreshTokens = [...newRefreshTokens]

await user.save()

return { token: newAccessToken, refreshToken: newRefreshToken }
}

const authenticate = async (user) => {
  try {
    // generate tokens
    const newAccessToken = await generateJWT({ _id: user._id })
    const newRefreshToken = await generateRefreshJWT({ _id: user._id })

    const newUser = await User.findById(user._id)
    newUser.refreshTokens.push({ token: newRefreshToken })
    await newUser.save()
    return { token: newAccessToken, refreshToken: newRefreshToken }
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
}

const generateJWT = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
      (err, token) => {
        if (err) rej(err)
        res(token)
      }
    )
  )

const verifyJWT = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) rej(err)
      res(decoded)
    })
  )

const generateRefreshJWT = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) rej(err)
        res(token)
      }
    )
  )

const verifyRefreshToken = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) rej(err)
      res(decoded)
    })
  )

module.exports = { authenticate, verifyJWT, refreshToken }