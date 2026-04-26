import { prisma } from '../config/database';
import { Prisma } from 'db/client';

export class VehicleRepository {
  async create(data: Prisma.VehicleUncheckedCreateInput) {
    return prisma.vehicle.create({ data });
  }

  async findAll(collegeId?: string) {
    return prisma.vehicle.findMany({
      where: collegeId ? { collegeId } : {},
      include: {
        college: { select: { name: true } }
      }
    });
  }

  async findById(id: string) {
    return prisma.vehicle.findUnique({
      where: { id },
      include: {
        college: { select: { name: true } },
        assignments: {
          include: {
            driver: {
              include: { user: { select: { name: true } } }
            },
            route: true
          }
        },
        trips: {
          take: 5,
          orderBy: { startedAt: 'desc' }
        }
      }
    });
  }

  async findByRegistration(registration: string) {
    return prisma.vehicle.findUnique({
      where: { registration }
    });
  }

  async findByGpsDeviceId(gpsDeviceId: string) {
    return prisma.vehicle.findUnique({
      where: { gpsDeviceId }
    });
  }

  async update(id: string, data: Prisma.VehicleUpdateInput) {
    return prisma.vehicle.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.vehicle.delete({
      where: { id }
    });
  }
}
