import { TripRepository } from '../repositories/trip.repository';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { RouteRepository } from '../repositories/route.repository';
import { ApiError } from '../utils/ApiError';
import { TripStatus } from 'db/client';

export class TripService {
  private repository: TripRepository;
  private vehicleRepository: VehicleRepository;
  private routeRepository: RouteRepository;

  constructor() {
    this.repository = new TripRepository();
    this.vehicleRepository = new VehicleRepository();
    this.routeRepository = new RouteRepository();
  }

  async startTrip(data: { collegeId: string; vehicleId: string; routeId: string }) {
    // 1. Validate vehicle exists
    const vehicle = await this.vehicleRepository.findById(data.vehicleId);
    if (!vehicle) throw new ApiError(404, 'Vehicle not found');

    // 2. Validate route exists
    const route = await this.routeRepository.findById(data.routeId);
    if (!route) throw new ApiError(404, 'Route not found');

    // 3. Check if vehicle already has an active trip
    const activeTrip = await this.repository.findActiveTripByVehicle(data.vehicleId);
    if (activeTrip) {
      throw new ApiError(400, 'Vehicle already has an active trip running');
    }

    return this.repository.create({
      collegeId: data.collegeId,
      vehicleId: data.vehicleId,
      routeId: data.routeId,
      status: TripStatus.RUNNING,
      startedAt: new Date()
    });
  }

  async endTrip(tripId: string) {
    const trip = await this.repository.findById(tripId);
    if (!trip) throw new ApiError(404, 'Trip not found');
    if (trip.status !== TripStatus.RUNNING) {
      throw new ApiError(400, 'Trip is not in RUNNING status');
    }

    return this.repository.update(tripId, {
      status: TripStatus.COMPLETED,
      endedAt: new Date()
    });
  }

  async getAllTrips(collegeId?: string) {
    return this.repository.findAll(collegeId);
  }

  async getTripById(id: string) {
    const trip = await this.repository.findById(id);
    if (!trip) throw new ApiError(404, 'Trip not found');
    return trip;
  }
}
