import { PrismaClient } from './packages/db/generated/prisma/index.js';
const prisma = new PrismaClient();
async function run() {
  await prisma.route.update({
    where: { code: 'GRAND_LINE' },
    data: { destLat: 11.0247, destLng: 77.0028 }
  });
  console.log("Updated GRAND_LINE destination to PSG Tech Peelamedu.");
}
run();
