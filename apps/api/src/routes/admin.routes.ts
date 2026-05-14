import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const controller = new AdminController();

// Driver management
router.post('/drivers', controller.createDriver);
router.get('/drivers', controller.getDrivers);

// Route & Stop management
router.post('/routes', controller.createRoute);
router.post('/stops', controller.createStop);

// Vehicle Assignment management
router.post('/assignments', controller.createAssignment);
router.get('/assignments', controller.getAssignments);
router.patch('/assignments/:id/end', controller.endAssignment);

export { router as adminRoutes };
