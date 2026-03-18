import { createTradingAnalysis } from './src/utils/tradingAnalytics.js';


document.addEventListener('DOMContentLoaded', async () => {
  const chartsContainer = document.getElementById('charts-container');
  const rsiListsContainer = document.getElementById('rsi-lists');
  const tradingData = await fetchTradingData();
  if (tradingData.length > 0) {
  const tradingAnalysis = createTradingAnalysis(tradingData);
  chartsContainer.prepend(tradingAnalysis);
  } else {
    console.log("Trading data is empty.");
  }

  Object.entries(currencyGroups).forEach(([currency, pairs]) => {
    createCurrencySection(currency, pairs, chartsContainer, rsiListsContainer);
  });
});

async function fetchTradingData() {
  try {
    const response = await fetch('/public/data/trades.csv');
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('Error loading trading data:', error);
    return [];
  }
}

function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map(v => v.replace(/^"|"$/g, '').trim());
    
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i];
      return obj;
    }, {});
  }).filter(row => row.Date);
}
