import { prisma } from '../config/database';

export class BusService {
  async createBus(data: {
    registration: string;
    capacity: number;
    type?: string;
    status?: string;
  }) {
    const existingBus = await prisma.vehicle.findUnique({
      where: { registration: data.registration }
    });

    if (existingBus) {
      throw new Error('A bus with this registration already exists.');
    }

    return prisma.vehicle.create({
      data: {
        registration: data.registration,
        capacity: data.capacity,
        type: data.type || 'Standard Bus',
        status: (data.status as any) || 'ACTIVE',
      }
    });
  }

  async deleteBus(id: string) {
    return prisma.vehicle.delete({ where: { id } });
  }

  async getAllBuses() {
    return prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getActiveBuses() {
    const STALE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes
    const staleThresholdDate = new Date(Date.now() - STALE_THRESHOLD_MS);

    const activeTrips = await prisma.trip.findMany({
      where: { status: 'RUNNING' },
      include: {
        vehicle: true,
        locations: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });

    // Separate fresh vs stale trips
    const freshTrips = [];
    const staleIds: string[] = [];

    for (const trip of activeTrips) {
      const lastLocation = trip.locations[0];
      const isStale =
        !lastLocation || new Date(lastLocation.recordedAt) < staleThresholdDate;

      if (isStale) {
        staleIds.push(trip.id);
      } else {
        freshTrips.push(trip);
      }
    }

    // Auto-complete stale trips so they don't accumulate
    if (staleIds.length > 0) {
      await prisma.trip.updateMany({
        where: { id: { in: staleIds } },
        data: { status: 'COMPLETED', endedAt: new Date() },
      });
    }

    return freshTrips.map(trip => ({
      vehicleId: trip.vehicleId,
      registration: trip.vehicle.registration,
      latitude: trip.locations[0]?.latitude,
      longitude: trip.locations[0]?.longitude,
      speed: trip.locations[0]?.speed,
      status: (trip.locations[0] as any)?.status,
      stopsCrossed: (trip.locations[0] as any)?.stopsCrossed,
      recordedAt: trip.locations[0]?.recordedAt,
      tripId: trip.id,
      routeId: trip.routeId,
    }));
  }
}
