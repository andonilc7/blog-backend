const prisma = require('../db/prismaClient')

async function getCommentById(id) {
  return await prisma.comment.findUnique({
    where: {
      id: id
    },
    // can't use select and include on same level,
    // but can use them if nested (different levels)!
    include: {
      post: {
        select: {
          id: true,
          published: true,
          authorId: true
        }
      }
    }
  })
}

async function editComment(id, text) {
  return await prisma.comment.update({
    where: {
      id: id
    },
    data: {
      text: text
    }
  })
}

async function deleteComment(id) {
  return await prisma.comment.delete({
    where: {
      id
    }
  })
}

module.exports = {
  getCommentById,
  editComment,
  deleteComment
}