import type { Request, Response } from 'express';
import { BusService } from '../services/bus.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

export class BusController {
  constructor(private busService: BusService) {}

  public createBus = catchAsync(async (req: Request, res: Response) => {
    const { registration, capacity, type, status } = req.body;

    if (!registration || capacity === undefined) {
      return res.status(400).json(new ApiResponse(null, 'Missing required fields: registration, capacity'));
    }

    const bus = await this.busService.createBus({
      registration,
      capacity: Number(capacity),
      type,
      status,
    });

    res.status(201).json(new ApiResponse(bus, 'Bus created successfully'));
  });

  public deleteBus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.busService.deleteBus(id as string);
    res.status(200).json(new ApiResponse(null, 'Bus deleted successfully'));
  });

  public getBuses = catchAsync(async (req: Request, res: Response) => {
    const buses = await this.busService.getAllBuses();
    res.status(200).json(new ApiResponse(buses));
  });

  public getActive = catchAsync(async (req: Request, res: Response) => {
    const activeBuses = await this.busService.getActiveBuses();
    res.status(200).json(new ApiResponse(activeBuses));
  });
}
