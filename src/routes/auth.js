const { Router } = require("express")
const authController = require("../controllers/authController")
const { optionalAuthenticateJWT } = require("../middleware/authMiddleware")

const authRouter = Router()

// logging in is here, but creating new user (registering) is in users router
// and logging out isn't rly something on sever side bc jwts ar stateless (unlike sessions)
// so that will be a client side thing where they delete the stored JWT from localStorage for example
authRouter.post("/login", authController.postLogin)
authRouter.get("/me", optionalAuthenticateJWT, (req, res) => {
  res.json({
    user: req.user
  })
})

module.exports = authRouter