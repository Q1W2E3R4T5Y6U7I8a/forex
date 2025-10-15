import { currencyGroups } from './components/currencies.js';
import { createChart } from './components/chart.js';

import { createTradingAnalysis } from './components/tradingAnalytics.js';

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
    const response = await fetch('./data/trades.csv');
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

async function createCurrencySection(currency, pairs, chartsContainer, rsiListsContainer) {
  const rsiList = document.createElement('div');
  rsiList.className = 'rsi-list';
  rsiList.id = `rsi-list-${currency}`;
  rsiListsContainer.appendChild(rsiList);

  const details = document.createElement('details');
    details.open = true;


  const summary = document.createElement('summary');
  summary.textContent = currency;
  summary.style.fontSize = '1.5em';
  summary.style.cursor = 'pointer';

  const chartContainer = document.createElement('div');
  chartContainer.className = 'chart-group';

  const canvasContainer = document.createElement('div');
  canvasContainer.className = 'chart-container';

  const canvas = document.createElement('canvas');
  canvas.id = `chart-${currency}`;
  canvasContainer.appendChild(canvas);

  chartContainer.appendChild(canvasContainer);
  details.appendChild(summary);
  details.appendChild(chartContainer);
  chartsContainer.appendChild(details);

  const allPairData = await Promise.all(pairs.map(pair => fetchPairData(pair)));
  const validPairs = allPairData.filter(p => p.candles.length > 0);

  updateRSIList(rsiList, allPairData);

  if (validPairs.length > 0) {
    createChart(canvas, validPairs);
  }
}

async function fetchPairData(pair) {
  try {
    const response = await fetch(`/api/data?pair=${pair.id}`);
    const data = await response.json();
    return data.warning 
      ? { ...pair, candles: [], indicators: { rsi: null }, warning: data.warning }
      : { ...pair, ...data };
  } catch (error) {
    console.error(`Error loading ${pair.id}:`, error);
    return { ...pair, candles: [], indicators: { rsi: null }, error: error.message };
  }
}

function updateRSIList(container, pairs) {
  if (pairs.every(p => p.warning || p.error)) {
    container.innerHTML = `<div class="no-data-warning">No data available</div>`;
    return;
  }

  container.innerHTML = pairs.map(pair => createRSIItem(pair)).join('');
}

function createRSIItem(pair) {
  if (pair.warning || pair.error) {
    return `<div class="rsi-item warning">
      <span class="rsi-dot" style="background:${pair.color}"></span>
      <span>${pair.label}:</span>
      <span>No data</span>
    </div>`;
  }

  const rsiValue = pair.indicators?.rsi?.value;
  const rsiNumber = rsiValue ? parseFloat(rsiValue) : null;
  const rsiBar = rsiNumber !== null ? createRSIBar(rsiNumber) : '';

  return `<div class="rsi-item">
    <span class="rsi-dot" style="background:${pair.color}"></span>
    <span>${pair.label}:</span>
    <span class="rsi-value">${rsiNumber?.toFixed(2) || '--'}</span>
    ${rsiBar}
  </div>`;
}

function createRSIBar(value) {
  const percentage = Math.min(100, Math.max(0, value));
  const color = `hsl(${value * 1.2}, 100%, 50%)`;
  
  return `
    <div class="rsi-bar-container">
      <div class="rsi-bar" style="width: ${percentage}%; background: ${color};"></div>
      <div class="rsi-bar-background"></div>
    </div>
  `;
}