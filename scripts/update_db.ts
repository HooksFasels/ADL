import { PrismaService } from '../packages/db/prisma/index.js';
const prismaService = new PrismaService();
const prisma = prismaService.getClient();
async function run() {
  await prisma.route.update({
    where: { code: 'GRAND_LINE' },
    data: { destLat: 11.0247, destLng: 77.0028 }
  });
  console.log("Updated GRAND_LINE destination to PSG Tech Peelamedu.");
}
run().finally(() => prisma.$disconnect());
