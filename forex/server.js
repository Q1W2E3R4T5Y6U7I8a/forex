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
    
    const filePath = path.join(__dirname, 'data', `${pair}.csv`);

    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return res.json({ 
        candles: [],
        indicators: { rsi: null },
        warning: `Data file not found for ${pair}`
      });
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
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

    // Calculate RSI only if we have data
    let currentRSI = null;
    let rsiColor = null;
    
    if (candles.length > 0) {
      const closePrices = candles.map(c => c.c);
      currentRSI = calculateRSI(closePrices);
      rsiColor = currentRSI ? getRSIColor(currentRSI) : null;
    }
    
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
    res.status(500).json({ 
      error: 'Failed to load data',
      details: error.message 
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});