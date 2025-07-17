// this will just be for comments in terms of being on root (e.g. not like /posts/:postId/comments ;
//  that is in the postRouter)

const { Router } = require("express")
const commentController = require('../controllers/commentController')
const authMiddleware = require("../middleware/authMiddleware")

const commentRouter = Router()

commentRouter.get("/:commentId", authMiddleware.optionalAuthenticateJWT, commentController.getComment)
commentRouter.patch("/:commentId", authMiddleware.authenticateJWT, commentController.editComment)
commentRouter.delete("/:commentId", authMiddleware.authenticateJWT, commentController.deleteComment)

module.exports = commentRouter