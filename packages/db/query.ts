import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const route = await prisma.route.findUnique({
    where: { code: 'GRAND_LINE' },
    include: { stops: true }
  });
  console.log(JSON.stringify(route, null, 2));
}
run();
