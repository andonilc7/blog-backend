const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt
const bcrypt = require("bcryptjs")
const userService = require("../services/userService")

async function localVerifyCallback(username, password, done) {
  try {
    const user = await userService.getUserByUsername(username)
    if (!user) {
      return done(null, false, {message: "Incorrect username"})
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      return done(null, false, {message: "Incorrect password"})
    }

    return done(null, user)
  } catch(err) {
    return done(err)
  }
}

const localStrategy = new LocalStrategy(localVerifyCallback)

passport.use(localStrategy)

// jwt strategy section
const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.JWT_SECRET
async function jwtVerifyCallback(jwt_payload, done) {
  try {
    // jwt_payload example: {
    // note: in the user object i only kept id to ensure everything is up to date rather than getting confused with stale data
//   user: {
//     id: 14
//   },
//   iat: 1751404859,
//   exp: 1751491259
// }
// we still need to look it up in the db to be safe, e.g. if their account was deleted, etc
    // verify it hasn't been tampered with in the if condition
    if (!jwt_payload.id) {
      // auth failewd bc couldn't find user
      return done(null, false)
    }
    const user = await userService.getUserById(jwt_payload.id)
    if (!user) {
      return done(null, false)
    }
    // passing just the id as is to avoid stale values and nesting existence problems
    return done(null, user.id)
  } catch(err) {
    return done(err)
  }
}

const jwtStrategy = new JwtStrategy(opts, jwtVerifyCallback)
passport.use(jwtStrategy)