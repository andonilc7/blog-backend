const prisma = require("../db/prismaClient")
const { post } = require("../routes/auth")

async function getPublicPosts() {
  return await prisma.post.findMany({
    where: {
      published: true
    },
    select: {
      id: true,
      title: true,
      text: true,
      createdAt: true,
      updatedAt: true,
      published: true,
      author: {
        select: {
          id: true,
          username: true
        }
      }
    }
  })
}

async function getPostById(postId) {
  return await prisma.post.findUnique({
    where: {
      id: postId
    },
    select: {
      id: true,
      title: true,
      text: true,
      createdAt: true,
      updatedAt: true,
      published: true,
      author: {
        select: {
          id: true,
          username: true
        }
      }
    }
  })
}

async function createPost({title, text, published, authorId}) {
  const data = {
    title, text, authorId
  }
  if (published) {
    data.published = published
  }
  console.log(data)
  const newPost = await prisma.post.create({
    data
  })
  return newPost
}

async function patchPost({postId, title, text, published}) {
  // note: when passing this to res.json(), it automatically removes undefined values
  const data = {
    title, text, published
  }
  return await prisma.post.update({
    where: {
      id: postId
    },
    data
  })
}

async function deletePostById(postId) {
  return await prisma.post.delete({
    where: {
      id: postId
    }
  })
}

async function getCommentsForPost(postId) {
  return await prisma.comment.findMany({
    where: {
      postId: postId
    }
  })
}

async function postCommentForPost(postId, commentText, authorId) {
  return await prisma.comment.create({
    data: {
      text: commentText,
      postId: postId,
      authorId: authorId
    },
    select: {
      id: true,
      text: true,
      postId: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
        id: true,
        username: true
        }
      }
    }
  })
}



module.exports = {
  getPublicPosts,
  getPostById,
  createPost,
  patchPost,
  deletePostById,
  getCommentsForPost,
  postCommentForPost
}