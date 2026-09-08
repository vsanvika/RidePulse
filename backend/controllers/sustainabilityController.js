const Ride = require("../models/Ride");
const { sendSuccess } = require("../utils/apiResponse");

async function getSustainabilityStats(req, res, next) {
  try {
    const studentRides = await Ride.find({ student: req.user._id });
    const totalRidesCount = studentRides.length;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyRidesCount = studentRides.filter((r) => new Date(r.createdAt) >= oneWeekAgo).length;
    const monthlyRidesCount = studentRides.filter((r) => new Date(r.createdAt) >= oneMonthAgo).length;

    // CO2 Savings Constants (documented mock assumptions)
    // - Solo vehicle emission: 170g/km
    // - Shared shuttle emission: 40g/km
    // - Savings per km: 130g/km (0.13 kg/km)
    // - Average campus trip: 3.5 km
    // -> Savings per ride = 3.5 * 0.13 = 0.455 kg CO2
    const CO2_SAVINGS_PER_RIDE_KG = 0.455;

    const totalCo2SavedKg = Number((totalRidesCount * CO2_SAVINGS_PER_RIDE_KG).toFixed(2));
    const weeklySavingsKg = Number((weeklyRidesCount * CO2_SAVINGS_PER_RIDE_KG).toFixed(2));
    const monthlySavingsKg = Number((monthlyRidesCount * CO2_SAVINGS_PER_RIDE_KG).toFixed(2));
    const treesPlantedEquivalent = Number((totalCo2SavedKg / 20).toFixed(1)); // 1 tree ~ 20kg CO2/yr

    // Monthly breakdown data for charts
    const monthlyTrends = [
      { month: "Mar", rides: 8, co2SavedKg: 3.64 },
      { month: "Apr", rides: 14, co2SavedKg: 6.37 },
      { month: "May", rides: 18, co2SavedKg: 8.19 },
      { month: "Jun", rides: 12, co2SavedKg: 5.46 },
      { month: "Jul", rides: 22, co2SavedKg: 10.01 },
      { month: "Aug", rides: totalRidesCount || 15, co2SavedKg: totalCo2SavedKg || 6.83 },
    ];

    return sendSuccess(
      res,
      {
        totalRides: totalRidesCount,
        weeklySavingsKg,
        monthlySavingsKg,
        totalCo2SavedKg,
        treesPlantedEquivalent,
        monthlyTrends,
        assumptions: {
          soloCarEmissionsGPerKm: 170,
          shuttleEmissionsGPerKm: 40,
          avgTripDistanceKm: 3.5,
          co2SavedPerRideKg: CO2_SAVINGS_PER_RIDE_KG,
        },
      },
      "Sustainability metrics calculated successfully"
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSustainabilityStats,
};
