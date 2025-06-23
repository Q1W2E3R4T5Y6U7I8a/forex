function calculateEMA(data, period) {
    const k = 2 / (period + 1);
    const ema = [];
    ema[period - 1] = data.slice(0, period).reduce((a, b) => a + b) / period;

    for (let i = period; i < data.length; i++) {
        ema[i] = data[i] * k + ema[i - 1] * (1 - k);
    }
    return ema;
}

module.exports = { calculateEMA };
