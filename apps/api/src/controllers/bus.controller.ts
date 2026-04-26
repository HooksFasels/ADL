import type { Request, Response } from 'express';
import { BusService } from '../services/bus.service';

export class BusController {
  constructor(private busService: BusService) {}

  public createBus = async (req: Request, res: Response) => {
    try {
      // In production, use Zod for payload validation here
      const { collegeId, registration, capacity, gpsDeviceId, type } = req.body;

      if (!collegeId || !registration || !capacity) {
        return res.status(400).json({ success: false, error: 'Missing required fields: collegeId, registration, capacity' });
      }

      const bus = await this.busService.createBus({
        collegeId,
        registration,
        capacity: Number(capacity),
        gpsDeviceId,
        type
      });

      res.status(201).json({ success: true, data: bus });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  };

  public getBuses = async (req: Request, res: Response) => {
    try {
      const collegeId = req.query.collegeId as string;
      if (!collegeId) {
        return res.status(400).json({ success: false, error: 'collegeId query param is required' });
      }

      const buses = await this.busService.getAllBuses(collegeId);
      res.status(200).json({ success: true, data: buses });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
}
