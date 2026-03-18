const fs = require('fs');
const path = require('path');

// Read the data file
const data = fs.readFileSync(path.join(__dirname, 'data.txt'), 'utf8');

const trades = [];
let currentTrade = {};

// Process each line
data.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;

    // Check for timestamp line (new trade)
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(line)) {
        if (currentTrade.date) trades.push(currentTrade);
        currentTrade = { date: line.split('\t')[0] };
    }
    // Check for outcome line
    else if (/^[+−-]/.test(line)) {
        currentTrade.outcome = line.replace('−', '-');
    }
    // Check for position line
    else if (line.includes('symbol') && (line.includes('long') || line.includes('short'))) {
        // Extract pair (e.g. "GBPAUD" from "CMCMARKETS:GBPAUD")
        const pairMatch = line.match(/symbol \w+:(\w+)/);
        currentTrade.pair = pairMatch ? pairMatch[1] : '';

        // Extract position type
        currentTrade.positionType = line.includes('long') ? 'long' : 'short';
    }
});

// Push the last trade if it exists
if (currentTrade.date) trades.push(currentTrade);

// Convert to CSV
let csv = 'Date,Outcome,Pair,PositionType\n';
trades.forEach(trade => {
    csv += `"${trade.date}","${trade.outcome}","${trade.pair}","${trade.positionType}"\n`;
});

// Write to CSV file
fs.writeFileSync(path.join(__dirname, 'trades.csv'), csv);

console.log('✅ trades.csv created successfully!');