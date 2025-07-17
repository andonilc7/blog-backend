const passport = require("passport")
const jwt = require("jsonwebtoken")

// {
//   "username": "AndoniC",
//   "password": "secretpassword"
// }

// {
//   "username": "Andoni",
//   "password": "secretpassword"
// }

function postLogin(req, res, next) {
  console.log(req.body)
  // this is the only spot that passporet authenticate local is used
  // bc this is for logging in
  // if it works, itll return a jwt to client (in session version, it was using sessions bc of serialize user and the passport session middleware)
  // then later, to protect routes, we use passport authenticate jwt
  passport.authenticate("local", {session: false}, (err, user, info) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: info.message
    })
    }

    jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '1 day'}, (err, token) => {
      if (err) {
        return next(err)
      }
      res.json({
        success: true,
        token
      })
    })
    
  })(req, res, next)
}



module.exports = {
  postLogin
}