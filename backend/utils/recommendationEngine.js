/**
 * Smart Shuttle Recommendation Engine
 * Ranks trip options based on ETA, Crowd Occupancy Ratio, and On-Time reliability.
 */

function rankAndRecommendShuttles(tripOptions = []) {
  if (!tripOptions || tripOptions.length === 0) return tripOptions;

  // Score each option:
  // Score = (1 / ETA_mins) * 0.45 + (1 - Occupancy_ratio) * 0.35 + Status_factor * 0.20
  const scoredOptions = tripOptions.map((opt) => {
    const etaMins = opt.boardingEtaMinutes || 1;
    const etaScore = 1 / Math.max(1, etaMins);

    const occRatio = (opt.crowd?.percentage || 50) / 100;
    const crowdScore = 1 - occRatio;

    let statusScore = 1.0;
    if (opt.shuttle?.status === "DELAYED") statusScore = 0.4;
    if (opt.shuttle?.status === "STOPPED") statusScore = 0.2;

    const totalScore = etaScore * 0.45 + crowdScore * 0.35 + statusScore * 0.20;

    return {
      ...opt,
      recommendationScore: Number(totalScore.toFixed(3)),
    };
  });

  // Sort descending by total score
  scoredOptions.sort((a, b) => b.recommendationScore - a.recommendationScore);

  // Mark top 1 option as recommended and generate explanation
  if (scoredOptions.length > 0) {
    const top = scoredOptions[0];

    let reason = `Recommended because Shuttle ${top.shuttle.shuttleId} has the fastest boarding ETA (~${top.boardingEtaMinutes} mins), low crowd occupancy (${top.crowd.percentage}%), and is operating on time.`;
    if (top.crowd.percentage > 60) {
      reason = `Recommended because Shuttle ${top.shuttle.shuttleId} provides the fastest direct arrival (~${top.boardingEtaMinutes} mins) despite moderate crowd density.`;
    }

    scoredOptions[0] = {
      ...top,
      isRecommended: true,
      recommendationReason: reason,
    };
  }

  return scoredOptions;
}

module.exports = {
  rankAndRecommendShuttles,
};
