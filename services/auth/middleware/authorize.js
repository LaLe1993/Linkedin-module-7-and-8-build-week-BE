const passport = require("passport")
const jwt= require("jsonwebtoken")
const UserModel = require("../user/schema")
const { verifyJWT } = require("../utilits/jwt")

const authorize = async (req, res, next) => {
    try {
      const token = req.cookies.accessToken
       
      if(token){
        const decoded = await verifyJWT(token)
        const user = await UserModel.findOne({
          _id: decoded._id,
        })
    
        if (!user) {
          throw new Error('No user Found')
        }
    
        req.token = token
        req.user = user
        next()
      }
      else{
        next("Token is missing in cookies!")
      }
    } catch (e) {
      console.log(e)
      next(e)
    }
  }
  
  
  
  module.exports = authorize


