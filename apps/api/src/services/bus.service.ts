import { PrismaService } from 'db/client';

const prisma = new PrismaService().getClient();

export class BusService {
  async createBus(data: {
    collegeId: string;
    registration: string;
    capacity: number;
    gpsDeviceId?: string;
    type?: string;
  }) {
    // Business logic separation
    const existingBus = await prisma.vehicle.findUnique({
      where: { registration: data.registration }
    });

    if (existingBus) {
      throw new Error('A bus with this registration already exists.');
    }

    const newBus = await prisma.vehicle.create({
      data: {
        collegeId: data.collegeId,
        registration: data.registration,
        capacity: data.capacity,
        gpsDeviceId: data.gpsDeviceId,
        type: data.type || 'Standard Bus',
      }
    });

    return newBus;
  }

  async getAllBuses(collegeId: string) {
    return prisma.vehicle.findMany({
      where: { collegeId }
    });
  }
}
