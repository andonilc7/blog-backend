const passport = require("passport")
const createError = require("http-errors")

function authenticateJWT(req, res, next) {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      throw new createError(401, "Authentication required: You must be logged in to access this resource")
    }

    req.user = user
    next()
  })(req, res, next)
}

// this is for routes that might require a user
// e.g. when viewing a specific post, if it is unpublished thenin that case u need req.user to checl
// but otherwise, u dont need to be logged in
function optionalAuthenticateJWT(req, res, next) {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err) {
      return next(err)
    }
    // if no user, we just move along
    if (!user) {
      return next()
    }
    req.user = user
    next()
  })(req, res, next)
}

// later add requireRole to do a role hceck (e.g. author or normal for most things,
// then just author for author-related things)

module.exports = {
  authenticateJWT,
  optionalAuthenticateJWT
}