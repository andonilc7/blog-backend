const postService = require("../services/postService")
const { getUserById, getUserByUsername } = require("../services/userService")
const {body, validationResult} = require("express-validator")
const createError = require("http-errors")

function sanitizeRawId(rawId) {
  const postId = parseInt(rawId)
  if (isNaN(postId)) {
    throw new createError(400, "Invalid post ID")
  }
  return postId
}

async function getPostByRawId(rawId) {
  const postId = sanitizeRawId(rawId)
  const post = await postService.getPostById(postId)
  if (!post) {
    throw new createError(404, "Post not found")
  }
  return post
}

async function getPublicPosts(req, res) {
  const publicPosts = await postService.getPublicPosts()
  console.log(publicPosts)
  res.json(
    publicPosts
  )
}

async function getPostById(req, res, next) {
  try {
    const post = await getPostByRawId(req.params.postId)
    if (post.published || post.author.id === req.user) {
      return res.json(post)
    }

    return res.status(404).json({
      error: "Post not found or not authorized to edit"
    })
    
  } catch(err) {
    // if (err.message == "Invalid post ID") {
    //   return res.status(400).json({
    //     error: err.message
    //   })
    // } else if (err.message === "Post not found") {
    //   return res.status(404).json({
    //     error: err.message
    //   })
    // }
    next(err)
  }
}

async function createPostHandler(req, res, next) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    // returning errors that are known early, whereas i think the global
    // error handlers are more for unknown/unexpected errors like if the server crashed or db failed,
    // but stuff like invalid queries or invalid body should be returned early i think
    return res.status(400).json({
      success: false,
      errors: errors.array()
    })
  }
  // fetching user to make sure their role is AUTHOR
  const prospectiveAuthor = await getUserById(req.user)
  console.log(prospectiveAuthor)
  if (prospectiveAuthor.role == "NORMAL") {
    console.log("error")
    throw new createError(403, "You must have the role of an author to create a post")
  }
  // data will take req.body and add on the userId to it from req.user
  // body expects title, text, and optionally published
  data = req.body
  data.authorId = req.user
  const newPost = await postService.createPost(data)
  res.json(newPost)

  // const newPost = await postService.createPost({req})
}

const createPost = [
  // checks the fields that are there
  // if theres extra fields passed, my backend doesn't use it so it should be fine
  body("title").trim().notEmpty().withMessage("Title cannot be empty"),
  body("text").trim().notEmpty().withMessage("Text cannot be empty"),
  body("published").optional().isBoolean({strict: true}).withMessage("Published must be a boolean"),
  createPostHandler
]

async function patchPostHandler(req, res, next) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    // returning errors that are known early, whereas i think the global
    // error handlers are more for unknown/unexpected errors like if the server crashed or db failed,
    // but stuff like invalid queries or invalid body should be returned early i think
    // actually just doing everything global error handler, this keeping how is for now tho bc format slightly differet (not message?)
    return res.status(400).json({
      success: false,
      errors: errors.array()
    })
  }
  try {
    const post = await getPostByRawId(req.params.postId)
    if (post.author.id === req.user) {
      // i think ill do where everything in the body is required for this
      // bc in the frontend, it'll show all current values and then let u edit ones that u want to chagne
      // but itll send all of them back, whether changed or not 
      const patchedPost = await postService.patchPost({postId: post.id, ...req.body})
      return res.json(patchedPost)
    }

    return res.status(403).json({
      error: "You are not authorized to edit this post"
    })
    
  } catch(err) {
    // if (err.message == "Invalid post ID") {
    //   return res.status(400).json({
    //     error: err.message
    //   })
    // } else if (err.message === "Post not found") {
    //   return res.status(404).json({
    //     error: err.message
    //   })
    // }
    next(err)
  }
}

const patchPost = [
  body("title").trim().notEmpty().withMessage("Title cannot be empty"),
  body("text").trim().notEmpty().withMessage("Text cannot be empty"),
  // DONT PUT .trim() IN BOOLEAN FIELDS! IT WILL MESS UP!
  // and doing strict: true in the isBoolean makes sure that "false" (string) doesn't get passed through
  body("published").notEmpty().withMessage("Published cannot be empty").isBoolean({strict: true}).withMessage("Published must be a boolean"),
  patchPostHandler
]

async function deletePost(req, res, next) {
  const post = await getPostByRawId(req.params.postId)
  if (post.author.id !== req.user) {
    throw new createError(403, "You are not auhorized to delete this post")
  } 
  const deletedPost = await postService.deletePostById(post.id)
  res.json(deletedPost)
  // might need to add some error handling for failing to delete
}

async function getCommentsForPost(req, res, next) {
  const post = await getPostByRawId(req.params.postId)
  const postId = post.id
  if (!post.published) {
    // if post is not published
    // if theres no user, then we automatically know they cant access 
    // (this is 401 but if logged in and not authorized then 403)
    if (!req.user) {
      throw new createError(401, "You must be logged in to access this post")
    }
    if (req.user !== post.author.id) {
      throw new createError(403, "You are not authorized to access this post")
    }
  } 
  
  // this happens if either the post is published or if it's not published but the user is the auhtor
  const comments = await postService.getCommentsForPost(postId)
  res.json(comments)
}

async function postCommentOnPostHandler(req, res, next) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    })
  }
  // the functino throws if not existing or not formed prop, etc
  const post = await getPostByRawId(req.params.postId)
  const postId = post.id
  // if user not published, no one can post a comment
  // but will still make 401 vs 403 distinction
  // already have 401 built into the required authenticate JWT middleware
  if (!post.published) {
    throw new createError(403, "You can't comment on an unpublished post")
  }
  const { text } = req.body
  const comment = await postService.postCommentForPost(postId, text, req.user)
  res.json(comment)
}

const postCommentOnPost = [
  // note: React automatically escapes text submitted to html
  body("text").trim().notEmpty().withMessage("Comment text cannot be empty"),
  postCommentOnPostHandler
]

module.exports = {
  getPublicPosts,
  getPostById,
  createPost,
  patchPost,
  deletePost,
  getCommentsForPost,
  postCommentOnPost
}