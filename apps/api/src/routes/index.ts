import { Router } from 'express';
import { collegeRoutes } from './college.routes';
import { userRoutes } from './user.routes';
import { driverProfileRoutes } from './driver-profile.routes';
import { vehicleRoutes } from './vehicle.routes';
import { routeRoutes } from './route.routes';
import { vehicleAssignmentRoutes } from './vehicle-assignment.routes';
import { tripRoutes } from './trip.routes';
import { locationRoutes } from './location.routes';

const router = Router();

const routes = [
  { path: '/colleges', route: collegeRoutes },
  { path: '/users', route: userRoutes },
  { path: '/drivers', route: driverProfileRoutes },
  { path: '/vehicles', route: vehicleRoutes },
  { path: '/routes', route: routeRoutes },
  { path: '/assignments', route: vehicleAssignmentRoutes },
  { path: '/trips', route: tripRoutes },
  { path: '/location', route: locationRoutes },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
