const prisma = require("../db/prismaClient")

async function main() {
  console.log(await prisma.user.findMany())
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