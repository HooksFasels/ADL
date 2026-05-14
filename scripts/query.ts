import { PrismaService } from '../packages/db/prisma/index';
const prismaService = new PrismaService();
const prisma = prismaService.getClient();
async function run() {
  const route = await prisma.route.findUnique({
    where: { code: 'GRAND_LINE' },
    include: { stops: true }
  });
  console.log(JSON.stringify(route, null, 2));
}
run();
