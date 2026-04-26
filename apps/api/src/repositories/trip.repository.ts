import { prisma } from '../config/database';
import { Prisma, TripStatus } from 'db/client';

export class TripRepository {
  async create(data: Prisma.TripUncheckedCreateInput) {
    return prisma.trip.create({ data });
  }

  async findAll(collegeId?: string) {
    return prisma.trip.findMany({
      where: collegeId ? { collegeId } : {},
      include: {
        vehicle: { select: { registration: true } },
        route: { select: { name: true, code: true } }
      },
      orderBy: { startedAt: 'desc' }
    });
  }

  async findById(id: string) {
    return prisma.trip.findUnique({
      where: { id },
      include: {
        vehicle: true,
        route: { include: { stops: true } },
        locations: {
          take: 10,
          orderBy: { recordedAt: 'desc' }
        }
      }
    });
  }

  async findActiveTripByVehicle(vehicleId: string) {
    return prisma.trip.findFirst({
      where: {
        vehicleId,
        status: TripStatus.RUNNING
      }
    });
  }

  async update(id: string, data: Prisma.TripUpdateInput) {
    return prisma.trip.update({
      where: { id },
      data
    });
  }
}
