import { VehicleRepository } from '../repositories/vehicle.repository';
import { CollegeRepository } from '../repositories/college.repository';
import { ApiError } from '../utils/ApiError';
import { Prisma } from 'db/client';

export class VehicleService {
  private repository: VehicleRepository;
  private collegeRepository: CollegeRepository;

  constructor() {
    this.repository = new VehicleRepository();
    this.collegeRepository = new CollegeRepository();
  }

  async createVehicle(data: Prisma.VehicleUncheckedCreateInput) {
    // Validate college
    const college = await this.collegeRepository.findById(data.collegeId);
    if (!college) {
      throw new ApiError(404, 'College not found');
    }

    // Unique registration
    const existingReg = await this.repository.findByRegistration(data.registration);
    if (existingReg) {
      throw new ApiError(400, 'Vehicle with this registration already exists');
    }

    // Unique GPS Device
    if (data.gpsDeviceId) {
      const existingGps = await this.repository.findByGpsDeviceId(data.gpsDeviceId);
      if (existingGps) {
        throw new ApiError(400, 'GPS Device ID is already assigned to another vehicle');
      }
    }

    return this.repository.create(data);
  }

  async getAllVehicles(collegeId?: string) {
    return this.repository.findAll(collegeId);
  }

  async getVehicleById(id: string) {
    const vehicle = await this.repository.findById(id);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }
    return vehicle;
  }

  async updateVehicle(id: string, data: Prisma.VehicleUpdateInput) {
    await this.getVehicleById(id);

    if (data.registration && typeof data.registration === 'string') {
      const existing = await this.repository.findByRegistration(data.registration);
      if (existing && existing.id !== id) {
        throw new ApiError(400, 'Registration already in use');
      }
    }

    if (data.gpsDeviceId && typeof data.gpsDeviceId === 'string') {
      const existing = await this.repository.findByGpsDeviceId(data.gpsDeviceId);
      if (existing && existing.id !== id) {
        throw new ApiError(400, 'GPS Device ID already in use');
      }
    }

    return this.repository.update(id, data);
  }

  async deleteVehicle(id: string) {
    await this.getVehicleById(id);
    return this.repository.delete(id);
  }
}
