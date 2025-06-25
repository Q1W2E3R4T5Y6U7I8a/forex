export function createTradingAnalysis(data) {
  const container = document.createElement('div');
  container.className = 'trading-analysis';
  
  // Process data first to ensure proper chronological order and cumulative calculation
  const processedData = processTradingData(data);
  const stats = calculateTradingStats(processedData);
  
  // Create stats panel
  const statsPanel = createStatsPanel(processedData, stats);
  container.appendChild(statsPanel);
  
  // Create chart container
  const chartContainer = document.createElement('div');
  chartContainer.className = 'chart-container';
  const canvas = document.createElement('canvas');
  canvas.id = 'trading-performance-chart';
  chartContainer.appendChild(canvas);
  container.appendChild(chartContainer);
  
  // Create detailed trade list
  const tradeList = createTradeList(processedData);
  container.appendChild(tradeList);
  
  // Create pair performance section
  const pairPerformance = createPairPerformance(processedData);
  container.appendChild(pairPerformance);
  
  // Create position type analysis
  const positionAnalysis = createPositionAnalysis(processedData);
  container.appendChild(positionAnalysis);
  
  // Create chart with processed data
  createTradingChart(canvas, processedData, stats);
  
  return container;
}

function processTradingData(rawData) {
  // Sort data chronologically (oldest first)
  const sortedData = [...rawData].sort((a, b) => new Date(a.Date) - new Date(b.Date));
  
  let cumulative = 0;
  const processedData = [];
  
  // Add starting point at 0
  if (sortedData.length > 0) {
    processedData.push({
      date: sortedData[0].Date,
      pnl: 0,
      cumulative: 0,
      pair: '',
      positionType: ''
    });
  }
  
  // Process all trades
  sortedData.forEach(trade => {
    const value = parseFloat(trade.Outcome);
    cumulative += value;
    
    processedData.push({
      date: trade.Date,
      pnl: value,
      cumulative: parseFloat(cumulative.toFixed(2)),
      pair: trade.Pair,
      positionType: trade.PositionType
    });
  });
  
  return processedData;
}

function createStatsPanel(data, stats) {
  const panel = document.createElement('div');
  panel.className = 'stats-panel';
  
  // Calculate additional metrics
  const maxDrawdown = calculateMaxDrawdown(data);
  const profitPerDay = data.length > 1 ? 
    (stats.totalProfit / ((new Date(data[data.length-1].date) - new Date(data[1].date)) / (1000 * 60 * 60 * 24))) : 0;
  
  panel.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Profit/Loss</div>
        <div class="stat-value ${stats.totalProfit >= 0 ? 'positive' : 'negative'}">
          ${stats.totalProfit.toFixed(2)} USD
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">Win Rate</div>
        <div class="stat-value">${stats.winRate}%</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">Total Trades</div>
        <div class="stat-value">${stats.tradeCount}</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">Avg. Win</div>
        <div class="stat-value">${stats.avgWin.toFixed(2)}</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">Avg. Loss</div>
        <div class="stat-value">${stats.avgLoss.toFixed(2)}</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">Max Drawdown</div>
        <div class="stat-value negative">${maxDrawdown.toFixed(2)} USD</div>
      </div>
    </div>
  `;
  
  return panel;
}

function calculateMaxDrawdown(data) {
  let peak = -Infinity;
  let maxDrawdown = 0;
  
  // Skip the first artificial 0 point
  for (let i = 1; i < data.length; i++) {
    const current = data[i].cumulative;
    if (current > peak) {
      peak = current;
    }
    const drawdown = peak - current;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown;
}

function calculateTradingStats(data) {
  let totalProfit = 0;
  let winCount = 0;
  let lossCount = 0;
  let winSum = 0;
  let lossSum = 0;
  
  // Skip the first artificial 0 point
  for (let i = 1; i < data.length; i++) {
    const profit = data[i].pnl;
    totalProfit += profit;
    
    if (profit >= 0) {
      winCount++;
      winSum += profit;
    } else {
      lossCount++;
      lossSum += Math.abs(profit);
    }
  }
  
  const tradeCount = data.length - 1; // Subtract the artificial starting point
  const winRate = tradeCount > 0 ? ((winCount / tradeCount) * 100).toFixed(1) : 0;
  const avgWin = winCount > 0 ? (winSum / winCount) : 0;
  const avgLoss = lossCount > 0 ? (lossSum / lossCount) : 0;
  const profitFactor = lossSum > 0 ? (winSum / lossSum) : winSum > 0 ? Infinity : 0;
  
  return {
    totalProfit,
    winRate,
    tradeCount,
    avgWin,
    avgLoss,
    profitFactor,
    winCount,
    lossCount
  };
}

function createTradeList(data) {
  const listContainer = document.createElement('div');
  listContainer.className = 'trade-list-container';
  
  const header = document.createElement('h2');
  header.textContent = 'Trade History';
  listContainer.appendChild(header);
  
  const table = document.createElement('table');
  table.className = 'trade-table';
  
  // Create table header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Date</th>
      <th>Pair</th>
      <th>Position</th>
      <th>Profit/Loss</th>
      <th>Cumulative</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // Create table body (skip the first artificial 0 point)
  const tbody = document.createElement('tbody');
  for (let i = 1; i < data.length; i++) {
    const trade = data[i];
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${trade.date}</td>
      <td>${trade.pair}</td>
      <td class="${trade.positionType}">${trade.positionType}</td>
      <td class="${trade.pnl >= 0 ? 'positive' : 'negative'}">${trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)} USD</td>
      <td class="${trade.cumulative >= 0 ? 'positive' : 'negative'}">${trade.cumulative.toFixed(2)} USD</td>
    `;
    tbody.appendChild(row);
  }
  
  table.appendChild(tbody);
  listContainer.appendChild(table);
  
  return listContainer;
}

function createPairPerformance(data) {
  const container = document.createElement('div');
  container.className = 'pair-performance';
  
  const header = document.createElement('h2');
  header.textContent = 'Winrate by pair';
  container.appendChild(header);
  
  const chartContainer = document.createElement('div');
  chartContainer.className = 'chart-container';
  const canvas = document.createElement('canvas');
  canvas.id = 'pair-performance-chart';
  chartContainer.appendChild(canvas);
  container.appendChild(chartContainer);
  
  // Calculate pair performance (skip first artificial point)
  const pairStats = {};
  for (let i = 1; i < data.length; i++) {
    const trade = data[i];
    const pair = trade.pair;
    const profit = trade.pnl;
    
    if (!pairStats[pair]) {
      pairStats[pair] = {
        profit: 0,
        count: 0,
        wins: 0,
        losses: 0
      };
    }
    
    pairStats[pair].profit += profit;
    pairStats[pair].count++;
    
    if (profit >= 0) {
      pairStats[pair].wins++;
    } else {
      pairStats[pair].losses++;
    }
  }
  
  // Create chart data
  const labels = Object.keys(pairStats);
  const profitData = labels.map(pair => pairStats[pair].profit);
  const winRateData = labels.map(pair => 
    pairStats[pair].count > 0 ? (pairStats[pair].wins / pairStats[pair].count) * 100 : 0
  );
  
  // Create chart
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Profit (USD)',
          data: profitData,
          backgroundColor: profitData.map(p => p >= 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)'),
          borderColor: profitData.map(p => p >= 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)'),
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Win Rate %',
          data: winRateData,
          type: 'line',
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: 'rgb(153, 102, 255)',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Profit (USD)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          min: 0,
          max: 100,
          title: {
            display: true,
            text: 'Win Rate %'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
  
  return container;
}

function createPositionAnalysis(data) {
  const container = document.createElement('div');
  container.className = 'position-analysis';
  
  const header = document.createElement('h2');
  header.textContent = 'Winrate in long vs short';
  container.appendChild(header);
  
  const chartContainer = document.createElement('div');
  chartContainer.className = 'chart-container';
  const canvas = document.createElement('canvas');
  canvas.id = 'position-analysis-chart';
  chartContainer.appendChild(canvas);
  container.appendChild(chartContainer);
  
  // Calculate position stats (skip first artificial point)
  const positionStats = {
    long: { profit: 0, count: 0, wins: 0 },
    short: { profit: 0, count: 0, wins: 0 }
  };
  
  for (let i = 1; i < data.length; i++) {
    const trade = data[i];
    const position = trade.positionType.toLowerCase();
    const profit = trade.pnl;
    
    if (positionStats[position]) {
      positionStats[position].profit += profit;
      positionStats[position].count++;
      
      if (profit >= 0) {
        positionStats[position].wins++;
      }
    }
  }
  
  // Create chart data
  const labels = ['Long', 'Short'];
  const profitData = [positionStats.long.profit, positionStats.short.profit];
  const winRateData = [
    positionStats.long.count > 0 ? (positionStats.long.wins / positionStats.long.count) * 100 : 0,
    positionStats.short.count > 0 ? (positionStats.short.wins / positionStats.short.count) * 100 : 0
  ];
  
  // Create chart
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Profit (USD)',
          data: profitData,
          backgroundColor: profitData.map(p => p >= 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)'),
          borderColor: profitData.map(p => p >= 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)'),
          borderWidth: 1
        },
        {
          label: 'Win Rate %',
          data: winRateData,
          backgroundColor: 'rgba(153, 102, 255, 0.7)',
          borderColor: 'rgb(153, 102, 255)',
          borderWidth: 1,
          type: 'line',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: 'rgb(153, 102, 255)'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Value'
          }
        }
      }
    }
  });
  
  return container;
}

function createTradingChart(canvas, data, stats) {
  return new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.map(d => d.date),
      datasets: [
        {
          label: 'Cumulative P/L (USD)',
          data: data.map(d => d.cumulative),
          borderColor: '#82ca9d',
          backgroundColor: 'rgba(130, 202, 157, 0.1)',
          borderWidth: 3,
          tension: 0.1,
          pointRadius: (ctx) => ctx.dataIndex === 0 ? 0 : 4,
          pointBackgroundColor: (ctx) => 
            ctx.dataIndex === 0 ? 'transparent' : (data[ctx.dataIndex].pnl >= 0 ? '#82ca9d' : '#ff6384'),
          fill: true
        },
        {
          label: 'Daily P/L (USD)',
          data: data.map(d => d.pnl),
          borderColor: '#8884d8',
          backgroundColor: 'rgba(136, 132, 216, 0.3)',
          borderWidth: 2,
          tension: 0.1,
          type: 'bar',
          order: 1,
          pointRadius: (ctx) => ctx.dataIndex === 0 ? 0 : 3,
          barThickness: 5 
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.dataIndex === 0) return null;
              const datasetLabel = context.dataset.label || '';
              const value = context.parsed.y;
              return `${datasetLabel}: ${value >= 0 ? '+' : ''}${value.toFixed(2)} USD`;
            },
            afterLabel: function(context) {
              if (context.dataIndex === 0) return null;
              const trade = data[context.dataIndex];
              return `Pair: ${trade.pair}\nPosition: ${trade.positionType}`;
            }
          }
        },
        legend: {
          position: 'top',
        },
        annotation: {
          annotations: {
            zeroLine: {
              type: 'line',
              yMin: 0,
              yMax: 0,
              borderColor: 'black',
              borderWidth: 1,
              borderDash: [3, 3]
            },
            startLine: {
              type: 'line',
              xMin: data[0].date,
              xMax: data[0].date,
              borderColor: 'gray',
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                display: true,
                content: 'Start',
                position: 'start'
              }
            },
            endLine: {
              type: 'line',
              xMin: data[data.length-1].date,
              xMax: data[data.length-1].date,
              borderColor: 'gray',
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                display: true,
                content: 'End',
                position: 'end'
              }
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            tooltipFormat: 'yyyy-MM-dd HH:mm:ss'
          },
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Profit/Loss (USD)'
          },
          ticks: {
            callback: function(value) {
              return value + ' USD';
            }
          }
        }
      }
    }
  });
}