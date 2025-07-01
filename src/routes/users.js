const { Router } = require('express')
const userController = require('../controllers/userController')

const userRouter = Router()
userRouter.get("/", (req, res) => {
  res.json({
    message: "This is the users route"
  })
})

userRouter.post("/", userController.createUser)
userRouter.get("/:userId", userController.getUserById)
userRouter.patch("/:userId", userController.updateUser)
userRouter.delete("/:userId", userController.deleteUser)

module.exports = userRouter