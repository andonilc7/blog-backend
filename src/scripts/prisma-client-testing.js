const prisma = require("../db/prismaClient")
const userService = require("../services/userService")

async function main() {
  const user = await userService.createUser({
    username: "bob1", passwordHash: 'bobpwd', role: 'AUTHOR'
  })
  console.log(user)
}

main()
.then(async () => {
  await prisma.$disconnect()
})
.catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})