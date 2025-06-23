const express = require('express');
const fs = require('fs');
const path = require('path');
const { parse } = require('date-fns');
const { calculateRSI, getRSIColor } = require('./src/indicators/rsi');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/api/data', (req, res) => {
  try {
    const pair = req.query.pair;
    if (!pair) return res.status(400).json({ error: 'Pair parameter required' });
    
    const raw = fs.readFileSync(path.join(__dirname, 'data', `${pair}.csv`), 'utf-8');
    const lines = raw.trim().split('\n').slice(1);

    const candles = lines.map(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 5) return null;
      
      const dateStr = `${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`;
      const date = parse(dateStr, 'MMM dd, yyyy HH:mm', new Date());
      
      return {
        x: date.getTime(),
        o: parseFloat(parts[4]),
        h: parseFloat(parts[5]),
        l: parseFloat(parts[6]),
        c: parseFloat(parts[7])
      };
    }).filter(Boolean).reverse();

    // Calculate RSI for the most recent period
    const closePrices = candles.map(c => c.c);
    const currentRSI = calculateRSI(closePrices);
    const rsiColor = currentRSI ? getRSIColor(currentRSI) : null;
    
    res.json({ 
      candles,
      indicators: {
        rsi: currentRSI ? {
          value: currentRSI.toFixed(2),
          color: rsiColor
        } : null
      }
    });
  } catch (error) {
    console.error('Error loading data:', error);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});