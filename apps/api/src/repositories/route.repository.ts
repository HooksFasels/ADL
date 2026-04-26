import { prisma } from '../config/database';
import { Prisma } from 'db/client';

export class RouteRepository {
  async create(data: Prisma.RouteUncheckedCreateInput) {
    return prisma.route.create({ data });
  }

  async findAll(collegeId?: string) {
    return prisma.route.findMany({
      where: collegeId ? { collegeId } : {},
      include: {
        _count: { select: { stops: true, trips: true } }
      }
    });
  }

  async findById(id: string) {
    return prisma.route.findUnique({
      where: { id },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        college: { select: { name: true } }
      }
    });
  }

  async findByCode(code: string) {
    return prisma.route.findUnique({
      where: { code }
    });
  }

  async update(id: string, data: Prisma.RouteUpdateInput) {
    return prisma.route.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.route.delete({
      where: { id }
    });
  }
}
