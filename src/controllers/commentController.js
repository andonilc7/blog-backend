const createError = require("http-errors")
const postService = require("../services/postService")
const {body, validationResult} = require("express-validator")
const commentService = require("../services/commentService")

async function getCommentByRawId(rawCommentId) {
  const commentId = parseInt(rawCommentId)

  if (isNaN(commentId)) {
    throw new createError(400, "Invalid comment id")
  }

  // get the comment to see if it exists
  const comment = await commentService.getCommentById(commentId)

  if (!comment) {
    throw new createError(404, "Comment not found")
  }

  return comment
}

async function getComment(req, res, next) {
  const rawCommentId = req.params.commentId

  // get the comment to see if it exists
  const comment = await getCommentByRawId(rawCommentId)

  // add error hadnling for if post isnt published etc, auth stuff
  if (!comment.post.published) {
    if (!req.user) {
      throw new createError(401, "You must log in to access this")
    }
    if (comment.post.authorId !== req.user) {
    throw new createError(403, "Cannot get comment: associated post is not published")
    }
  }

  res.json(comment)
}

async function editCommentHandler(req, res, next) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    })
  }
  const rawCommentId = req.params.commentId
  const comment = await getCommentByRawId(rawCommentId)
  // will do that you have to be the author of the comment to edit it
  // and if the post is not published, no one can edit it
  if (!comment.post.published) {
    throw new createError(403, "Cannot edit comment: associated post is not published")
  }

  if (comment.authorId !== req.user) {
    throw new createError(403, "You are not authorized to edit this comment")
  }

  const editedComment = await commentService.editComment(comment.id, req.body.text)
  res.json(editedComment)
}

const editComment = [
  body("text").trim().notEmpty().withMessage("Comment text cannot be empty"),
  editCommentHandler
]

async function deleteComment(req, res) {
  const rawCommentId = req.params.commentId
  // handles invalid param and also if comment doesn't exist
  const comment = await getCommentByRawId(rawCommentId)

  if (comment.authorId !== req.user) {
    throw new createError(403, "You are not authorized to delete this comment")
  }

  const deletedComment = await commentService.deleteComment(comment.id)
  res.json(deletedComment)
}

module.exports = {
  getComment,
  editComment,
  deleteComment
}