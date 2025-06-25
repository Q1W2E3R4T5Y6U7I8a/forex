// api/trades.js
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const filePath = path.join(process.cwd(), 'data', 'trades.csv');

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: 'Trades data not found',
        warning: 'trades.csv file not found in data directory'
      });
    }

    // Read and send the file
    const data = fs.readFileSync(filePath, 'utf-8');
    res.setHeader('Content-Type', 'text/csv');
    return res.status(200).send(data);

  } catch (error) {
    console.error('Error in trades API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}