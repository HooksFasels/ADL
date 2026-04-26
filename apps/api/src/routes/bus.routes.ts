import { Router } from 'express';
import { BusController } from '../controllers/bus.controller';
import { BusService } from '../services/bus.service';

const router = Router();

// Dependency Injection
const busService = new BusService();
const busController = new BusController(busService);

router.post('/buses', busController.createBus);
router.get('/buses', busController.getBuses);

export { router as busRoutes };
