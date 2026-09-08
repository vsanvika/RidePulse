const Stop = require("../models/Stop");
const Route = require("../models/Route");
const User = require("../models/User");
const Driver = require("../models/Driver");
const Shuttle = require("../models/Shuttle");
const Ride = require("../models/Ride");
const Alert = require("../models/Alert");

const mockStops = [
  { stopId: "ST01", name: "Main Campus Gate", code: "MCG", location: { latitude: 17.4450, longitude: 78.3470 }, facilities: ["Shelter", "Digital Board", "CCTV"] },
  { stopId: "ST02", name: "Administration Building", code: "ADM", location: { latitude: 17.4462, longitude: 78.3485 }, facilities: ["Shelter", "Benches"] },
  { stopId: "ST03", name: "Engineering Complex", code: "ENG", location: { latitude: 17.4475, longitude: 78.3498 }, facilities: ["Shelter", "Digital Board", "Vending"] },
  { stopId: "ST04", name: "Central Library", code: "LIB", location: { latitude: 17.4468, longitude: 78.3512 }, facilities: ["Shelter", "Benches", "Wi-Fi"] },
  { stopId: "ST05", name: "Science & Tech Block", code: "STB", location: { latitude: 17.4482, longitude: 78.3525 }, facilities: ["Shelter", "Digital Board"] },
  { stopId: "ST06", name: "Student Activity Center", code: "SAC", location: { latitude: 17.4458, longitude: 78.3530 }, facilities: ["Shelter", "Food Kiosk", "Wi-Fi"] },
  { stopId: "ST07", name: "North Campus Hostels", code: "NCH", location: { latitude: 17.4495, longitude: 78.3505 }, facilities: ["Shelter", "Digital Board"] },
  { stopId: "ST08", name: "South Campus Hostels", code: "SCH", location: { latitude: 17.4435, longitude: 78.3480 }, facilities: ["Shelter", "Benches"] },
  { stopId: "ST09", name: "Sports & Athletics Complex", code: "SAC", location: { latitude: 17.4442, longitude: 78.3515 }, facilities: ["Shelter", "Water Dispenser"] },
  { stopId: "ST10", name: "Campus Food Court", code: "CFC", location: { latitude: 17.4460, longitude: 78.3500 }, facilities: ["Shelter", "Digital Board", "Benches"] },
  { stopId: "ST11", name: "Research & Innovation Park", code: "RIP", location: { latitude: 17.4502, longitude: 78.3538 }, facilities: ["Shelter", "Digital Board"] },
  { stopId: "ST12", name: "Grand Auditorium", code: "AUD", location: { latitude: 17.4452, longitude: 78.3490 }, facilities: ["Shelter"] },
  { stopId: "ST13", name: "University Health Center", code: "UHC", location: { latitude: 17.4438, longitude: 78.3495 }, facilities: ["Shelter", "Emergency Telephone"] },
  { stopId: "ST14", name: "Central Transport Terminal", code: "CTT", location: { latitude: 17.4448, longitude: 78.3465 }, facilities: ["Shelter", "Ticketing Kiosk", "Digital Board"] },
  { stopId: "ST15", name: "International Guest House", code: "IGH", location: { latitude: 17.4488, longitude: 78.3478 }, facilities: ["Shelter"] },
  { stopId: "ST16", name: "Bio-Technology Wing", code: "BTW", location: { latitude: 17.4490, longitude: 78.3520 }, facilities: ["Shelter"] },
];

async function seedCampusData() {
  try {
    // 1. Seed Stops
    const stopDocs = {};
    for (const stopData of mockStops) {
      let stop = await Stop.findOne({ stopId: stopData.stopId });
      if (!stop) {
        stop = await Stop.create(stopData);
      }
      stopDocs[stopData.stopId] = stop;
    }
    console.log(`Seeded ${Object.keys(stopDocs).length} campus stops.`);

    // 2. Seed Routes
    const mockRoutes = [
      {
        routeId: "R01",
        name: "Express Loop",
        code: "EXP-01",
        color: "#2563EB",
        estimatedDuration: 18,
        stops: [stopDocs.ST01._id, stopDocs.ST02._id, stopDocs.ST03._id, stopDocs.ST04._id, stopDocs.ST06._id, stopDocs.ST10._id, stopDocs.ST14._id],
      },
      {
        routeId: "R02",
        name: "Academic Line",
        code: "ACD-02",
        color: "#059669",
        estimatedDuration: 22,
        stops: [stopDocs.ST01._id, stopDocs.ST03._id, stopDocs.ST05._id, stopDocs.ST11._id, stopDocs.ST16._id, stopDocs.ST04._id],
      },
      {
        routeId: "R03",
        name: "Hostel Express",
        code: "HST-03",
        color: "#DC2626",
        estimatedDuration: 15,
        stops: [stopDocs.ST07._id, stopDocs.ST10._id, stopDocs.ST08._id, stopDocs.ST13._id, stopDocs.ST06._id, stopDocs.ST01._id],
      },
      {
        routeId: "R04",
        name: "Research Corridor",
        code: "RSH-04",
        color: "#7C3AED",
        estimatedDuration: 25,
        stops: [stopDocs.ST14._id, stopDocs.ST02._id, stopDocs.ST05._id, stopDocs.ST11._id, stopDocs.ST15._id],
      },
      {
        routeId: "R05",
        name: "Perimeter Ring",
        code: "PRM-05",
        color: "#D97706",
        estimatedDuration: 30,
        stops: [stopDocs.ST01._id, stopDocs.ST08._id, stopDocs.ST09._id, stopDocs.ST06._id, stopDocs.ST11._id, stopDocs.ST07._id, stopDocs.ST15._id, stopDocs.ST01._id],
      },
    ];

    const routeDocs = {};
    for (const routeData of mockRoutes) {
      let route = await Route.findOne({ routeId: routeData.routeId });
      if (!route) {
        route = await Route.create(routeData);
      }
      routeDocs[routeData.routeId] = route;
    }
    console.log(`Seeded ${Object.keys(routeDocs).length} routes.`);

    // 3. Seed Additional Drivers
    const driverUsersData = [
      { name: "Robert Miller", email: "driver.robert@ridepulse.demo", password: "Driver123!", role: "DRIVER", licenseNumber: "DL-HYD-2021-881" },
      { name: "Suresh Kumar", email: "driver.suresh@ridepulse.demo", password: "Driver123!", role: "DRIVER", licenseNumber: "DL-HYD-2020-412" },
      { name: "Priya Sharma", email: "driver.priya@ridepulse.demo", password: "Driver123!", role: "DRIVER", licenseNumber: "DL-HYD-2022-909" },
      { name: "David Chen", email: "driver.david@ridepulse.demo", password: "Driver123!", role: "DRIVER", licenseNumber: "DL-HYD-2019-115" },
    ];

    const driverDocs = [];
    for (const dData of driverUsersData) {
      let user = await User.findOne({ email: dData.email });
      if (!user) {
        user = await User.create({
          name: dData.name,
          email: dData.email,
          password: dData.password,
          role: "DRIVER",
          department: "Campus Transit",
        });
      }
      let driver = await Driver.findOne({ user: user._id });
      if (!driver) {
        driver = await Driver.create({
          user: user._id,
          licenseNumber: dData.licenseNumber,
        });
      }
      driverDocs.push(driver);
    }

    // 4. Seed Shuttles
    const mockShuttles = [
      {
        shuttleId: "S01",
        vehicleNumber: "TS-09-UB-1001",
        capacity: 40,
        route: routeDocs.R01._id,
        driver: driverDocs[0]?._id || null,
        currentLocation: { latitude: 17.4455, longitude: 78.3482 },
        currentStop: stopDocs.ST01._id,
        nextStop: stopDocs.ST02._id,
        speed: 24,
        passengerCount: 18,
        crowdLevel: "MEDIUM",
        status: "ON_TIME",
      },
      {
        shuttleId: "S02",
        vehicleNumber: "TS-09-UB-1002",
        capacity: 45,
        route: routeDocs.R02._id,
        driver: driverDocs[1]?._id || null,
        currentLocation: { latitude: 17.4478, longitude: 78.3501 },
        currentStop: stopDocs.ST03._id,
        nextStop: stopDocs.ST05._id,
        speed: 28,
        passengerCount: 38,
        crowdLevel: "HIGH",
        status: "ON_TIME",
      },
      {
        shuttleId: "S03",
        vehicleNumber: "TS-09-UB-1003",
        capacity: 40,
        route: routeDocs.R03._id,
        driver: driverDocs[2]?._id || null,
        currentLocation: { latitude: 17.4438, longitude: 78.3482 },
        currentStop: stopDocs.ST08._id,
        nextStop: stopDocs.ST13._id,
        speed: 12,
        passengerCount: 10,
        crowdLevel: "LOW",
        status: "DELAYED",
      },
      {
        shuttleId: "S04",
        vehicleNumber: "TS-09-UB-1004",
        capacity: 50,
        route: routeDocs.R04._id,
        driver: driverDocs[3]?._id || null,
        currentLocation: { latitude: 17.4500, longitude: 78.3532 },
        currentStop: stopDocs.ST11._id,
        nextStop: stopDocs.ST15._id,
        speed: 32,
        passengerCount: 22,
        crowdLevel: "MEDIUM",
        status: "ON_TIME",
      },
      {
        shuttleId: "S05",
        vehicleNumber: "TS-09-UB-1005",
        capacity: 40,
        route: routeDocs.R05._id,
        driver: null,
        currentLocation: { latitude: 17.4442, longitude: 78.3515 },
        currentStop: stopDocs.ST09._id,
        nextStop: stopDocs.ST06._id,
        speed: 0,
        passengerCount: 0,
        crowdLevel: "LOW",
        status: "STOPPED",
      },
      {
        shuttleId: "S06",
        vehicleNumber: "TS-09-UB-1006",
        capacity: 35,
        route: routeDocs.R01._id,
        driver: null,
        currentLocation: { latitude: 17.4448, longitude: 78.3465 },
        currentStop: stopDocs.ST14._id,
        nextStop: stopDocs.ST01._id,
        speed: 0,
        passengerCount: 0,
        crowdLevel: "LOW",
        status: "OFFLINE",
      },
    ];

    const shuttleDocs = {};
    for (const shuttleData of mockShuttles) {
      let shuttle = await Shuttle.findOne({ shuttleId: shuttleData.shuttleId });
      if (!shuttle) {
        shuttle = await Shuttle.create(shuttleData);
      }
      shuttleDocs[shuttleData.shuttleId] = shuttle;
    }
    console.log(`Seeded ${Object.keys(shuttleDocs).length} shuttles.`);

    // 5. Seed Sample Alerts
    const mockAlerts = [
      {
        title: "Hostel Shuttle Delay",
        message: "Hostel Express (R03) running 10 minutes delayed due to heavy rain around South Hostels.",
        type: "DELAY",
        severity: "MEDIUM",
        route: routeDocs.R03._id,
        shuttle: shuttleDocs.S03._id,
        active: true,
      },
      {
        title: "Road Construction Alert",
        message: "Perimeter Ring route temporarily bypassing International Guest House stop due to maintenance.",
        type: "SERVICE_CHANGE",
        severity: "LOW",
        route: routeDocs.R05._id,
        active: true,
      },
    ];

    for (const alertData of mockAlerts) {
      const existing = await Alert.findOne({ title: alertData.title });
      if (!existing) {
        await Alert.create(alertData);
      }
    }
    console.log("Seeded sample campus alerts.");
  } catch (error) {
    console.error("Error seeding campus data:", error.message);
  }
}

module.exports = { seedCampusData };
