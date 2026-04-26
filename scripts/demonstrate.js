/**
 * ADL ENTERPRISE FLOW TESTER
 *
 * BEFORE every request:
 * - explains what the request does
 * - explains why it is needed
 * - explains business importance
 * - waits 5 seconds so you can read
 *
 * Then:
 * - sends request
 * - logs colorful response
 * - extracts IDs automatically
 *
 * Run:
 * bun run test-flow.js
 * OR
 * node test-flow.js
 */

const BASE_URL = "http://localhost:3009/api/v1";

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",

  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function line() {
  console.log(
    `${C.brightCyan}${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`
  );
}

function title(text) {
  console.log("\n");
  line();
  console.log(`${C.brightMagenta}${C.bold}🚀 ${text}${C.reset}`);
  line();
  console.log("\n");
}

function success(msg) {
  console.log(`${C.brightGreen}${C.bold}✅ SUCCESS:${C.reset} ${msg}`);
}

function error(msg) {
  console.log(`${C.brightRed}${C.bold}❌ ERROR:${C.reset} ${msg}`);
}

function info(msg) {
  console.log(`${C.brightBlue}${C.bold}ℹ INFO:${C.reset} ${msg}`);
}

function idLog(name, value) {
  console.log(
    `${C.brightYellow}${C.bold}🆔 ${name}:${C.reset} ${C.brightGreen}${value}${C.reset}`
  );
}

async function explain(step, heading, what, why) {
  console.log("\n");
  line();

  console.log(
    `${C.brightYellow}${C.bold}📌 STEP ${step}: ${heading}${C.reset}\n`
  );

  console.log(
    `${C.brightBlue}${C.bold}WHAT THIS REQUEST DOES:${C.reset}\n${C.white}${what}${C.reset}\n`
  );

  console.log(
    `${C.brightMagenta}${C.bold}WHY THIS REQUEST IS NEEDED:${C.reset}\n${C.white}${why}${C.reset}\n`
  );

  console.log(
    `${C.brightCyan}${C.bold}⏳ Waiting 5 seconds so you can read...${C.reset}\n`
  );

  line();

  await sleep(5000);
}

async function api(method, endpoint, body = null) {
  try {
    console.log(
      `\n${C.brightCyan}${C.bold}📤 REQUEST:${C.reset} ${method} ${endpoint}`
    );

    if (body) {
      console.log(
        `${C.blue}${C.bold}REQUEST BODY:${C.reset}`
      );
      console.log(JSON.stringify(body, null, 2));
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await response.json();

    console.log(
      `\n${C.brightMagenta}${C.bold}📥 RESPONSE:${C.reset}`
    );
    console.log(JSON.stringify(json, null, 2));

    if (!response.ok) {
      throw new Error(json.message || "API Failed");
    }

    return json;
  } catch (err) {
    error(err.message);
    throw err;
  }
}

async function run() {
  try {
    title("ADL COMPLETE SYSTEM FLOW TESTING");

    /**
     * STEP 1
     */
    await explain(
      1,
      "CREATE COLLEGE",
      "This request creates the parent organization (College). Every user, vehicle, route, and trip belongs to a college in this multi-tenant system.",
      "Without College, the system has no root entity. Since this is a transport platform for institutions, everything starts from College creation."
    );

    const college = await api("POST", "/colleges", {
      name: "MIT Institute of Technology",
      domain: `mit-${Date.now()}.edu`,
      isActive: true,
    });

    const COLLEGE_ID = college.data.id;
    success("College created successfully");
    idLog("COLLEGE_ID", COLLEGE_ID);

    /**
     * STEP 2
     */
    await explain(
      2,
      "CREATE DRIVER USER",
      "This request creates the main system login account for the driver. Authentication, login, permissions, and access control happen through User.",
      "DriverProfile cannot exist without User. First create authentication identity, then create business profile."
    );

    const user = await api("POST", "/users", {
      email: `driver.${Date.now()}@example.com`,
      password: "securePassword123",
      name: "John Doe",
      role: "DRIVER",
      collegeId: COLLEGE_ID,
    });

    const USER_ID = user.data.id;
    success("Driver User created");
    idLog("USER_ID", USER_ID);

    /**
     * STEP 3
     */
    await explain(
      3,
      "CREATE DRIVER PROFILE",
      "This request creates the transport-specific driver profile like phone number and driving license details.",
      "User handles authentication. DriverProfile handles transport operations. This separation is industry standard and follows clean architecture."
    );

    const driver = await api("POST", "/drivers", {
      userId: USER_ID,
      phone: "+1234567890",
      licenseNo: `DL-${Date.now()}`,
    });

    const DRIVER_ID = driver.data.id;
    success("Driver Profile created");
    idLog("DRIVER_ID", DRIVER_ID);

    /**
     * STEP 4
     */
    await explain(
      4,
      "CREATE VEHICLE",
      "This request registers the physical bus into the system including registration number, GPS device mapping, and operational status.",
      "Without Vehicle, no trip can happen. GPS tracking, trip management, and assignments depend on Vehicle."
    );

    const vehicle = await api("POST", "/vehicles", {
      collegeId: COLLEGE_ID,
      registration: `BUS-${Date.now()}`,
      type: "Electric Bus",
      capacity: 45,
      gpsDeviceId: `GPS-${Date.now()}`,
      status: "ACTIVE",
    });

    const VEHICLE_ID = vehicle.data.id;
    success("Vehicle created");
    idLog("VEHICLE_ID", VEHICLE_ID);

    /**
     * STEP 5
     */
    await explain(
      5,
      "CREATE ROUTE",
      "This request creates the travel route the bus will follow such as pickup zones and destination flow.",
      "Trips always require a Route. Without Route, there is no destination planning or ETA calculation."
    );

    const route = await api("POST", "/routes", {
      collegeId: COLLEGE_ID,
      code: `R-${Date.now()}`,
      name: "Downtown Express",
      city: "New York",
    });

    const ROUTE_ID = route.data.id;
    success("Route created");
    idLog("ROUTE_ID", ROUTE_ID);

    /**
     * STEP 6
     */
    await explain(
      6,
      "ADD ROUTE STOP",
      "This request adds individual stops inside the route such as stations or pickup points.",
      "A route without stops is incomplete. Stops are needed for live ETA, nearest stop detection, and student pickup management."
    );

    await api("POST", `/routes/${ROUTE_ID}/stops`, {
      name: "Central Park Station",
      latitude: 40.785091,
      longitude: -73.968285,
      sequence: 1,
    });

    success("Route Stop created");

    /**
     * STEP 7
     */
    await explain(
      7,
      "VEHICLE ASSIGNMENT",
      "This request connects Vehicle + Driver + Route together into one operational assignment.",
      "Until assignment happens, the system does not know which driver is driving which bus on which route."
    );

    const assignment = await api("POST", "/assignments", {
      vehicleId: VEHICLE_ID,
      driverId: DRIVER_ID,
      routeId: ROUTE_ID,
      startDate: new Date().toISOString(),
    });

    const ASSIGNMENT_ID = assignment.data.id;
    success("Vehicle Assignment created");
    idLog("ASSIGNMENT_ID", ASSIGNMENT_ID);

    /**
     * STEP 8
     */
    await explain(
      8,
      "START TRIP",
      "This request starts the live operational trip. The bus is now officially in motion.",
      "Trip state is the heart of real-time tracking. Kafka events, WebSocket updates, and ETA logic depend on active trips."
    );

    const trip = await api("POST", "/trips/start", {
      collegeId: COLLEGE_ID,
      vehicleId: VEHICLE_ID,
      routeId: ROUTE_ID,
    });

    const TRIP_ID = trip.data.id;
    success("Trip started");
    idLog("TRIP_ID", TRIP_ID);

    /**
     * STEP 9
     */
    await explain(
      9,
      "LIVE LOCATION UPDATE",
      "This request stores real-time GPS coordinates of the moving bus.",
      "This powers the entire live tracking system for parents, students, admins, and transport office monitoring."
    );

    await api("POST", "/location/update", {
      vehicleId: VEHICLE_ID,
      latitude: 40.7128,
      longitude: -74.0060,
      speed: 65.5,
    });

    success("Live Location updated");

    /**
     * STEP 10
     */
    await explain(
      10,
      "END TRIP",
      "This request marks the trip as completed and stores the trip end timestamp.",
      "Without proper trip closure, reporting, analytics, attendance, and historical tracking become inaccurate."
    );

    await api("PATCH", `/trips/${TRIP_ID}/end`);

    success("Trip ended successfully");

    title("FINAL GENERATED IDS");

    idLog("COLLEGE_ID", COLLEGE_ID);
    idLog("USER_ID", USER_ID);
    idLog("DRIVER_ID", DRIVER_ID);
    idLog("VEHICLE_ID", VEHICLE_ID);
    idLog("ROUTE_ID", ROUTE_ID);
    idLog("ASSIGNMENT_ID", ASSIGNMENT_ID);
    idLog("TRIP_ID", TRIP_ID);

    console.log(
      `\n${C.brightGreen}${C.bold}🔥 FULL ADL SYSTEM FLOW COMPLETED SUCCESSFULLY 🔥${C.reset}\n`
    );
  } catch (err) {
    console.log(
      `\n${C.brightRed}${C.bold}💀 FLOW STOPPED DUE TO ERROR 💀${C.reset}\n`
    );
  }
}

run();
