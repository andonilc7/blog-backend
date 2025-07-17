const { createParam } = require('@prisma/client/runtime/library')
const userService = require('../services/userService')
const bcrypt = require("bcryptjs")
const createError = require("http-errors")

async function getUserByIdHelper(rawUserId) {
  const userId = parseInt(rawUserId)
  if (isNaN(userId)) {
    throw new createError(400, "Invalid User ID")
  }
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new createError(404, "User not found")
  }
  return user
}

async function getUserById(req, res, next) {
  try {
    const user = await getUserByIdHelper(req.params.userId)
    res.json({
      id: user.id,
      username: user.username,
      role: user.role

    })
  } catch(err) {
    next(err)
  }
}

async function createUser(req, res, next) {
  // put express validator stuff here
  try {
    const {username, password, role} = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await userService.createUser({username, passwordHash: hashedPassword, role})
    res.json({
      id: user.id,
      username: user.username,
      role: user.role
    })
  } catch(err) {
    if (err.code === 'P2002') {
      // return res.status(409).json({
      //   error: "Username already exists"
      // })
      // dont actually need try, catch for async functino bc i am now in express 5
      // and now they automatically forardf to error handler if u have error (e.g. throw new error) wihtout try catch or next(err)
      return next(new createError(409, "Username already exists"))
    }
    res.status(500).json({error: "Internal server error"})
  }
}

// allowing update to username or password
// not doing role bc ill do trhe functioality as u just sign up initially for iether normal or author
async function updateUser(req, res, next) {
  try {
    const user = await getUserByIdHelper(req.params.userId)
    const userId = user.id
    if (userId !== req.user) {
      throw new createError(403, "You are not authorized to edit this user")
    }
    // new username, new password (will prob only be one of the two)
    const {username, password} = req.body
    // not hashing yet, fix later!!!
    const updatedUser = await userService.updateUser({id: userId, username, passwordHash: password})
    console.log(updatedUser)
    return res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role
    })
  } catch(err) {
    if (err.message === 'User not found') {
      return res.status(404).json({
        error: err.message
      })
    } else if (err.message === 'Invalid User ID') {
      return res.status(400).json({
        error: "Invalid user ID"
      })
    }
    res.status(500).json({error: "Internal server error"})
    // next(err)
  }
}

async function deleteUser(req, res, next) {
  try {
    // making sure user exists and req was valid first
    const userToDelete = await getUserByIdHelper(req.params.userId)
    const user = await userService.deleteUser(userToDelete.id)
    if (userId !== req.user) {
      throw new createError(403, "You are not authorized to edit this user")
    }
    return res.json({
      id: user.id,
      username: user.username,
      role: user.role
    })

  } catch(err) {
    // res.status(500).json({error: "Internal server error"})
    next(err)
  }
}

// allowing query of status = draft or published
// i'll default to published if status isn't there, but if wrong it will error
// this will still default to published if no value for status (?status=), bc using truthy/falsy check
async function getPostsForUser(req, res) {
  const status = req.query.status || "published"
  const user = await getUserByIdHelper(req.params.userId)
  if (status !== "published" && status !=="draft") {
    throw new createError(400, `Invalid query parameter for status. Must either be 'draft' or 'published'`)
  }

  let published;
  if (status == "published") {
    published = true
  } else {
    published = false
  }

  if (!published) {
    if (!req.user) {
      throw new createError(401, "You must be logged in to access this")
    }
    // need to check if the logged in user is same as the userId
    if (user.id != req.user) {
      throw new createError(403, "You are not authorized to access these unpublished posts")
    }
  }

  const posts = await userService.getPostsForUser(user.id, published)
  res.json(posts)

  


  // do the service functions in userService for getting posts based on user (draft or published, + auth stuff if draft)
  // if (status === "published") {

  // }
  // res.json("hi")
}


module.exports = {
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getPostsForUser
}