const prisma = require("../db/prismaClient")
const userService = require("../services/userService")

async function main() {
  const comment = await prisma.post.delete({
    where: {
      id: 9
    }
    
  })
  console.log(comment)
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