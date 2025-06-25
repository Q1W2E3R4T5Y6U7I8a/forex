function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  // Calculate initial average gains and losses
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Calculate subsequent values
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    let currentGain = 0;
    let currentLoss = 0;

    if (change > 0) {
      currentGain = change;
    } else {
      currentLoss = Math.abs(change);
    }

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
  }

  // Avoid division by zero
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function getRSIColor(rsiValue) {
  // Gradient from red (0) to yellow (50) to green (100)
  if (rsiValue < 30) return '#ff0000'; // Red
  if (rsiValue < 50) return '#ff8000'; // Orange
  if (rsiValue < 70) return '#ffff00'; // Yellow
  if (rsiValue < 80) return '#80ff00'; // Yellow-green
  return '#00ff00'; // Green
}

module.exports = { calculateRSI, getRSIColor };