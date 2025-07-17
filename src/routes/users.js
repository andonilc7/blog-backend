const { Router } = require('express')
const userController = require('../controllers/userController')
const authMiddleware = require("../middleware/authMiddleware")
// i think im gonna do that anyone can see psots
// only normal users can comment
// and only authors can write posts or delete comments on a post

const userRouter = Router()


userRouter.get("/", (req, res) => {
  res.json({
    message: "This is the users route"
  })
})

userRouter.post("/", userController.createUser)
userRouter.get("/:userId", authMiddleware.authenticateJWT, userController.getUserById)
// should do authorization logic of checking if user has the right role
// so it will go after the authenticateJWT and will be middleware that checks 
// req.user against req.params.uerId
// doing middleware bc its about whetehr the logic runs (access control) rather than the main action
userRouter.patch("/:userId", authMiddleware.authenticateJWT, userController.updateUser)
userRouter.delete("/:userId", authMiddleware.authenticateJWT, userController.deleteUser)
userRouter.get("/:userId/posts", authMiddleware.optionalAuthenticateJWT, userController.getPostsForUser)

module.exports = userRouter

// , (err, user, info) => {
//   if (err) {
//     return next(err)
//   }
//   if (!user) {
//     return res.status(401).json({
//       success: false,
//       error: "Unauthorized"
//     })
//   }
//   e