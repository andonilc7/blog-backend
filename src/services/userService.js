const prisma = require('../db/prismaClient')

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: {
      id: id
    }
  })
  
  return user
}

async function createUser({username, passwordHash, role}) {
  const data = {
    username,
    passwordHash
  }
  if (role) {
    data.role = role
  }
  const user = prisma.user.create({
    data: data
  })
  return user
}

async function updateUser({id, username, passwordHash}) {
  console.log(id)
  const data = {}
  if (username) {
    data.username = username
  }
  if (passwordHash) {
    data.passwordHash = passwordHash
  }

  const user = prisma.user.update({
    where: {
      id: id
    },
    data
  })
  return user
}

async function deleteUser(id) {
  const user = prisma.user.delete({
    where: {
      id
    }
  })
  return user
}

async function getUserByUsername(username) {
  const user = prisma.user.findUnique({
    where: {
      username: username
    }
  })

  return user
}

async function getPostsForUser(userId, published) {
  return await prisma.post.findMany({
    where: {
      authorId: userId,
      published
    }
  })
}

module.exports = {
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserByUsername,
  getPostsForUser
}