const { Router } = require("express")
const postController = require("../controllers/postController")
const { post } = require("./auth")
const { authenticateJWT, optionalAuthenticateJWT } = require('../middleware/authMiddleware')
// just to note, I started doing these routes before doing the extra middleware functions
// so that I can get these to work and then just make the role-based middleware for example
// and be able to plug right in

const postRouter = Router()

// gets all the PUBLISHED posts
// this doesn't need authorization
postRouter.get("/", postController.getPublicPosts)
// gets the specific post, published or unpublished 
// but will only show unpublished posts if its the right user
// if public, anyone can see them
// if unpublished, then we need req.user to see if the user is the author of the post
// so i need to make a custom middelware with passport.authenticate with custom clalback that doesn't return
// error if not authenticated, but does pass it along.s
postRouter.get("/:postId", optionalAuthenticateJWT, postController.getPostById)

// only checking that role is AUTHOR when someone makes a post bc for all others just checking that ownership matches
// also, in the API the user cant change their role anyway (bc just set when sign up)
postRouter.post("/", authenticateJWT, postController.createPost)
postRouter.patch("/:postId", authenticateJWT, postController.patchPost)
postRouter.delete("/:postId", authenticateJWT, postController.deletePost)
// note that we shouldn't allow comments on unpublished posts
// but they can publish and unpublish and they should still remain
// maybe if own post, and is unpublished, u can see all comments
// otherwise can't
// but if published, anyone can see the comments
postRouter.get("/:postId/comments", optionalAuthenticateJWT, postController.getCommentsForPost)
postRouter.post("/:postId/comments", authenticateJWT, postController.postCommentOnPost)

module.exports = postRouter