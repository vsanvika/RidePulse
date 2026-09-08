const User = require("../models/User");

const demoAccounts = [
  {
    name: "Demo Student",
    email: "student@ridepulse.demo",
    password: "Student123!",
    role: "STUDENT",
    studentId: "STU-2026-001",
    department: "Computer Science",
    phone: "+1-555-0101",
  },
  {
    name: "Demo Driver",
    email: "driver@ridepulse.demo",
    password: "Driver123!",
    role: "DRIVER",
    department: "Campus Transit",
    phone: "+1-555-0102",
  },
  {
    name: "Demo Admin",
    email: "admin@ridepulse.demo",
    password: "Admin123!",
    role: "ADMIN",
    department: "Campus Operations",
    phone: "+1-555-0103",
  },
];

async function seedDemoUsers() {
  try {
    for (const account of demoAccounts) {
      const existing = await User.findOne({ email: account.email });
      if (!existing) {
        await User.create(account);
        console.log(`Demo account created: ${account.email} (${account.role})`);
      }
    }
  } catch (error) {
    console.error("Error seeding demo users:", error.message);
  }
}

module.exports = { seedDemoUsers };
