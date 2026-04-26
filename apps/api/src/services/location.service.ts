import { LocationRepository } from '../repositories/location.repository';
import { TripRepository } from '../repositories/trip.repository';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { ApiError } from '../utils/ApiError';
import { Prisma } from 'db/client';

export class LocationService {
  private repository: LocationRepository;
  private tripRepository: TripRepository;
  private vehicleRepository: VehicleRepository;

  constructor() {
    this.repository = new LocationRepository();
    this.tripRepository = new TripRepository();
    this.vehicleRepository = new VehicleRepository();
  }

  async updateLocation(data: Prisma.LocationHistoryUncheckedCreateInput) {
    // 1. Validate vehicle
    const vehicle = await this.vehicleRepository.findById(data.vehicleId);
    if (!vehicle) throw new ApiError(404, 'Vehicle not found');

    // 2. Automagically find active trip if tripId not provided
    let finalTripId = data.tripId;
    if (!finalTripId) {
      const activeTrip = await this.tripRepository.findActiveTripByVehicle(data.vehicleId);
      if (activeTrip) {
        finalTripId = activeTrip.id;
      }
    }

    return this.repository.create({
      ...data,
      tripId: finalTripId,
      recordedAt: new Date()
    });
  }

  async getVehicleHistory(vehicleId: string) {
    const vehicle = await this.vehicleRepository.findById(vehicleId);
    if (!vehicle) throw new ApiError(404, 'Vehicle not found');
    return this.repository.findByVehicleId(vehicleId);
  }

  async getTripHistory(tripId: string) {
    return this.repository.findByTripId(tripId);
  }
}
