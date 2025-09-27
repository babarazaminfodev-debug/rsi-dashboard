export const calculateRSI = (prices: number[], period: number = 14): number | null => {
  if (prices.length <= period) {
    return null; // Not enough data
  }

  const changes = prices.slice(1).map((price, i) => price - prices[i]);
  
  let gain = 0;
  let loss = 0;

  // Calculate initial average gain/loss for the first period
  for (let i = 0; i < period; i++) {
    const change = changes[i];
    if (change > 0) {
      gain += change;
    } else {
      loss -= change; // loss is positive
    }
  }

  let avgGain = gain / period;
  let avgLoss = loss / period;

  // Smooth the average for the rest of the prices
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - change) / period;
    }
  }

  if (avgLoss === 0) {
    return 100; // RSI is 100 if average loss is zero
  }
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return rsi;
};
