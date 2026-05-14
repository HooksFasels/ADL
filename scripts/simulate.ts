import { PrismaService } from '../packages/db/prisma/index';
import * as readline from 'readline';

const prismaService = new PrismaService();
const prisma = prismaService.getClient();
const API_URL = 'http://localhost:4000/api/v1/location/update';

// Removed interpolate function in favor of OSRM routing

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('--- Setting up Simulation Data ---');

  // 1. (Removed college setup as model was removed)

  // 2. Find or Create Driver "Luffy"
  let driver = await prisma.user.findFirst({
    where: { name: { contains: 'luffy', mode: 'insensitive' } },
    include: { driverProfile: true }
  });
  if (!driver) {
    driver = await prisma.user.create({
      data: {
        name: 'Monkey D. Luffy',
        email: 'luffy@example.com',
        password: 'password123',
        role: 'DRIVER',
        driverProfile: { create: { phone: '1234567890' } }
      },
      include: { driverProfile: true }
    });
    console.log('Created Driver:', driver.name);
  } else {
    if (!driver.driverProfile) {
      await prisma.driverProfile.create({ data: { userId: driver.id } });
      driver = await prisma.user.findUniqueOrThrow({ where: { id: driver.id }, include: { driverProfile: true } });
    }
    console.log('Found Driver:', driver.name);
  }

  // 3. Find or Create Vehicle
  let vehicle = await prisma.vehicle.findFirst({
    where: { registration: 'TN 38 PIRATE' }
  });
  if (!vehicle) {
    vehicle = await prisma.vehicle.create({
      data: {
        registration: 'TN 38 PIRATE',
        capacity: 40,
        type: 'Bus'
      }
    });
    console.log('Created Vehicle:', vehicle.registration);
  } else {
    console.log('Found Vehicle:', vehicle.registration);
  }

  // 4. Fetch all Routes from the database
  const allRoutes = await prisma.route.findMany({
    include: { stops: { orderBy: { sequence: 'asc' } } }
  });

  if (allRoutes.length === 0) {
    console.error('No routes found in the database. Please create a route first.');
    return;
  }

  // 5. Ask user to select a route
  console.log('\nAvailable Routes:');
  allRoutes.forEach((r, idx) => {
    console.log(`[${idx + 1}] ${r.code} (${r.startLocation} -> ${r.destinationLocation})`);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const selectedRouteIndex = await new Promise<number>((resolve) => {
    rl.question('\nSelect a route by number: ', (answer) => {
      rl.close();
      resolve(parseInt(answer, 10) - 1);
    });
  });

  if (selectedRouteIndex < 0 || selectedRouteIndex >= allRoutes.length || isNaN(selectedRouteIndex)) {
    console.error('Invalid selection. Exiting.');
    return;
  }

  const route = allRoutes[selectedRouteIndex];
  console.log(`\nSelected Route: ${route.code}`);

  // 6. Create Assignment
  let assignment = await prisma.vehicleAssignment.findFirst({
    where: { driverId: driver.driverProfile!.id, routeId: route.id, vehicleId: vehicle.id }
  });
  if (!assignment) {
    assignment = await prisma.vehicleAssignment.create({
      data: {
        driverId: driver.driverProfile!.id,
        routeId: route.id,
        vehicleId: vehicle.id,
        startDate: new Date()
      }
    });
    console.log('Created Assignment');
  }

  // 7. Stop any existing running trips for this vehicle
  await prisma.trip.updateMany({
    where: { vehicleId: vehicle.id, status: 'RUNNING' },
    data: { status: 'COMPLETED', endedAt: new Date() }
  });

  // 8. Start a new Trip
  const trip = await prisma.trip.create({
    data: {
      routeId: route.id,
      vehicleId: vehicle.id,
      status: 'RUNNING',
      startedAt: new Date()
    }
  });
  console.log('Started new Trip ID:', trip.id);

  // --- SIMULATION LOOP ---
  console.log('\n--- Starting Simulation ---');

  // Build coordinates array for OSRM: start -> stops -> dest
  const routeCoords: {lat: number, lng: number}[] = [];
  if (route.startLat && route.startLng) routeCoords.push({lat: route.startLat, lng: route.startLng});
  route.stops.forEach((s: any) => routeCoords.push({lat: s.latitude, lng: s.longitude}));
  if (route.destLat && route.destLng) routeCoords.push({lat: route.destLat, lng: route.destLng});

  if (routeCoords.length < 2) {
    console.error('Route does not have enough coordinates to simulate.');
    return;
  }

  const coordsString = routeCoords.map(c => `${c.lng},${c.lat}`).join(';');
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;

  console.log('Fetching road path from OSRM...');
  const osrmRes = await fetch(osrmUrl);
  const osrmData = await osrmRes.json();
  
  if (osrmData.code !== 'Ok' || !osrmData.routes || osrmData.routes.length === 0) {
    console.error('Failed to fetch OSRM route:', osrmData);
    return;
  }

  const rawCoords = osrmData.routes[0].geometry.coordinates;

  // Convert raw polyline into a step-by-step path
  const fullPath = [];
  const stepSize = 1; // Visit every single point to flawlessly hug the road curves
  for (let i = 0; i < rawCoords.length; i += stepSize) {
    const [lon, lat] = rawCoords[i];
    
    // Calculate stops crossed based on proximity to stops
    let stopsCrossed = 0;
    for (let sIdx = 0; sIdx < route.stops.length; sIdx++) {
      const stop = route.stops[sIdx];
      const dist = Math.sqrt(Math.pow(lat - stop.latitude, 2) + Math.pow(lon - stop.longitude, 2));
      // if within roughly 100m, consider it crossed
      if (dist < 0.001 || (i > (rawCoords.length * ((sIdx + 1) / (route.stops.length + 1))))) {
        stopsCrossed = sIdx + 1;
      } else {
        break;
      }
    }

    fullPath.push({ latitude: lat, longitude: lon, stopsCrossed, targetSpeed: 30 + Math.random() * 15 });
  }
  // Make sure last point is exactly destination
  const [destLon, destLat] = rawCoords[rawCoords.length - 1];
  fullPath.push({ latitude: destLat, longitude: destLon, stopsCrossed: route.stops.length, targetSpeed: 0 });

  for (let i = 0; i < fullPath.length; i++) {
    const point = fullPath[i];
    if (!point) continue;

    const speed = Math.max(0, point.targetSpeed + (Math.random() * 10 - 5));

    const payload = {
      vehicleId: vehicle.id,
      tripId: trip.id,
      latitude: point.latitude,
      longitude: point.longitude,
      speed: speed,
      status: 'ACTIVE',
      stopsCrossed: point.stopsCrossed
    };

    console.log(`[Step ${i+1}/${fullPath.length}] Sending GPS: Lat ${point.latitude.toFixed(5)}, Lng ${point.longitude.toFixed(5)} | Speed: ${speed.toFixed(1)} km/h | Stops: ${point.stopsCrossed}`);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        console.error('Failed to send update:', await res.text());
      }
    } catch (err) {
      console.error('Error sending update:', err);
    }

    // Wait 500ms between updates for high-fidelity smooth animation
    await sleep(500);
  }

  // End the trip
  await prisma.trip.update({
    where: { id: trip.id },
    data: { status: 'COMPLETED', endedAt: new Date() }
  });

  console.log('\n--- Simulation Finished ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
