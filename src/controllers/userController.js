const userService = require('../services/userService')

async function getUserByIdHelper(rawUserId) {
  const userId = parseInt(rawUserId)
  if (isNaN(userId)) {
    throw new Error("Invalid User ID")
  }
  const user = await userService.getUserById(userId)
  if (!user) {
    throw new Error("User not found")
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
    if (err.message === 'User not found') {
      return res.status(404).json({
        error: err.message
      })
    } else if (err.message === 'Invalid User ID') {
      return res.status(400).json({
        error: "Invalid user ID"
      })
    }
    next(err)
  }
}

async function createUser(req, res, next) {
  try {
    const userData = req.body
    const user = await userService.createUser(userData)
    res.json(user)
  } catch(err) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: "Username already exists"
      })
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
    return res.json({
      id: user.id,
      username: user.username,
      role: user.role
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
    // res.status(500).json({error: "Internal server error"})
    next(err)
  }
}


module.exports = {
  getUserById,
  createUser,
  updateUser,
  deleteUser
}