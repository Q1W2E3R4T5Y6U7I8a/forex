// api/data.js
import fs from 'fs';
import path from 'path';
import { parse } from 'date-fns';
import { calculateRSI, getRSIColor } from '../public/components/rsi.js';

export default async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const pair = req.query.pair;
    if (!pair) {
      return res.status(400).json({ error: 'Pair parameter required' });
    }

    // Path to data file
    const filePath = path.join(process.cwd(), 'data', `${pair}.csv`);

    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return res.json({ 
        candles: [],
        indicators: { rsi: null },
        warning: `Data file not found for ${pair}`
      });
    }

    // Read and parse CSV
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

    // Calculate RSI
    let currentRSI = null;
    let rsiColor = null;
    
    if (candles.length > 0) {
      const closePrices = candles.map(c => c.c);
      currentRSI = calculateRSI(closePrices);
      rsiColor = currentRSI ? getRSIColor(currentRSI) : null;
    }
    
    return res.status(200).json({ 
      candles,
      indicators: {
        rsi: currentRSI ? {
          value: currentRSI.toFixed(2),
          color: rsiColor
        } : null
      }
    });

  } catch (error) {
    console.error('Error in API handler:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}