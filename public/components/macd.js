const { calculateEMA } = require('../utils/calculateEMA');

function calculateMACD(data) {
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);
    const macdLine = ema12.map((val, i) => val - ema26[i]);
    const signalLine = calculateEMA(macdLine.filter(val => val !== null), 9);

    const diff = macdLine.length - signalLine.length;
    const alignedSignalLine = Array(diff).fill(null).concat(signalLine);
    const histogram = macdLine.map((val, i) => val - alignedSignalLine[i]);

    return { macdLine, signalLine: alignedSignalLine, histogram };
}

module.exports = { calculateMACD };
