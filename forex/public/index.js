document.addEventListener('DOMContentLoaded', () => {
  const currencyGroups = {
    USD: [
      { id: 'USD_EUR_D1', label: 'USD/EUR', color: '#1f77b4' },
      { id: 'USD_CHF_D1', label: 'USD/CHF', color: '#ff7f0e' },
      { id: 'USD_GBP_D1', label: 'USD/GBP', color: '#2ca02c' },
      { id: 'USD_JPY_D1', label: 'USD/JPY', color: '#d62728' },
      { id: 'USD_CAD_D1', label: 'USD/CAD', color: '#9467bd' },
      { id: 'USD_AUD_D1', label: 'USD/AUD', color: '#8c564b' },
      { id: 'USD_NZD_D1', label: 'USD/NZD', color: '#e377c2' }
    ],
    CHF: [
      { id: 'CHF_EUR_D1', label: 'CHF/EUR', color: '#1f77b4' },
      { id: 'CHF_GBP_D1', label: 'CHF/GBP', color: '#ff7f0e' },
      { id: 'CHF_JPY_D1', label: 'CHF/JPY', color: '#2ca02c' },
      { id: 'CHF_CAD_D1', label: 'CHF/CAD', color: '#d62728' },
      { id: 'CHF_AUD_D1', label: 'CHF/AUD', color: '#9467bd' },
      { id: 'CHF_NZD_D1', label: 'CHF/NZD', color: '#8c564b' }
    ],
    EUR: [
      { id: 'EUR_GBP_D1', label: 'EUR/GBP', color: '#1f77b4' },
      { id: 'EUR_JPY_D1', label: 'EUR/JPY', color: '#ff7f0e' },
      { id: 'EUR_CAD_D1', label: 'EUR/CAD', color: '#2ca02c' },
      { id: 'EUR_AUD_D1', label: 'EUR/AUD', color: '#d62728' },
      { id: 'EUR_NZD_D1', label: 'EUR/NZD', color: '#9467bd' }
    ],
    GBP: [
      { id: 'GBP_JPY_D1', label: 'GBP/JPY', color: '#1f77b4' },
      { id: 'GBP_CAD_D1', label: 'GBP/CAD', color: '#ff7f0e' },
      { id: 'GBP_AUD_D1', label: 'GBP/AUD', color: '#2ca02c' },
      { id: 'GBP_NZD_D1', label: 'GBP/NZD', color: '#d62728' }
    ],
    JPY: [
      { id: 'JPY_CAD_D1', label: 'JPY/CAD', color: '#1f77b4' },
      { id: 'JPY_AUD_D1', label: 'JPY/AUD', color: '#ff7f0e' },
      { id: 'JPY_NZD_D1', label: 'JPY/NZD', color: '#2ca02c' }
    ],
    AUD: [
      { id: 'AUD_CAD_D1', label: 'AUD/CAD', color: '#1f77b4' },
      { id: 'AUD_NZD_D1', label: 'AUD/NZD', color: '#ff7f0e' }
    ]
  };

  const chartsContainer = document.getElementById('charts-container');
  const rsiListsContainer = document.getElementById('rsi-lists');

  Object.entries(currencyGroups).forEach(([currency, pairs]) => {
  
    const rsiList = document.createElement('div');
    rsiList.className = 'rsi-list';
    rsiList.id = `rsi-list-${currency}`;
    rsiListsContainer.appendChild(rsiList);

    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-group';
    
    const header = document.createElement('h1');
    header.textContent = currency;
    chartContainer.appendChild(header);
    
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'chart-container';
    
    const canvas = document.createElement('canvas');
    canvas.id = `chart-${currency}`;
    canvasContainer.appendChild(canvas);
    
    chartContainer.appendChild(canvasContainer);
    chartsContainer.appendChild(chartContainer);

    Promise.all(pairs.map(p =>
      fetch(`/api/data?pair=${p.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.warning) {
            console.warn(data.warning);
            return { ...p, candles: [], indicators: { rsi: null }, warning: data.warning };
          }
          return { ...p, ...data };
        })
        .catch(error => {
          console.error(`Error loading ${p.id}:`, error);
          return { ...p, candles: [], indicators: { rsi: null }, error: error.message };
        })
    ))
    .then(allPairData => {
      const validPairs = allPairData.filter(p => p.candles.length > 0);
      
      if (validPairs.length === 0) {
        rsiList.innerHTML = `<div class="no-data-warning">No data available for ${currency} pairs</div>`;
        return;
      }

      rsiList.innerHTML = allPairData.map(pair => {
        if (pair.warning) {
          return `<div class="rsi-item warning">
            <span class="rsi-dot" style="background:${pair.color}"></span>
            <span>${pair.label}:</span>
            <span>No data</span>
          </div>`;
        }
        
        const rsiValue = pair.indicators?.rsi?.value;
        const rsiNumber = rsiValue ? parseFloat(rsiValue) : null;
        
        // Create the RSI bar with gradient
        let rsiBar = '';
        if (rsiNumber !== null) {
          const percentage = Math.min(100, Math.max(0, rsiNumber));
          const color = getRsiColor(percentage);
          
          rsiBar = `
            <div class="rsi-bar-container">
              <div class="rsi-bar" style="width: ${percentage}%; background: ${color};"></div>
              <div class="rsi-bar-background"></div>
            </div>
          `;
        }
        
        return `<div class="rsi-item">
          <span class="rsi-dot" style="background:${pair.color}"></span>
          <span>${pair.label}:</span>
          <span class="rsi-value">${rsiNumber !== null ? rsiNumber.toFixed(2) : '--'}</span>
          ${rsiBar}
        </div>`;
      }).join('');

      // Create chart only with valid pairs
      const ctx = document.getElementById(`chart-${currency}`).getContext('2d');
      new Chart(ctx, {
        type: 'candlestick',
        data: {
          datasets: validPairs.map(p => ({
            label: p.label,
            data: p.candles,
            color: { up: 'white', down: p.color, unchanged: p.color },
            yAxisID: 'y'
          }))
        },
        options: {
          plugins: {
            legend: { display: true },
            annotation: {
              annotations: validPairs.reduce((acc, p, i) => {
                if (p.indicators?.rsi?.value) {
                  acc[`rsiLine${i}`] = {
                    type: 'line',
                    yMin: Number(p.indicators.rsi.value),
                    yMax: Number(p.indicators.rsi.value),
                    borderColor: p.color,
                    borderWidth: 2,
                    label: {
                      display: true,
                      content: `RSI: ${p.indicators.rsi.value}`,
                      position: 'start',
                      color: p.color,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      font: { weight: 'bold' }
                    },
                    yScaleID: 'rsi'
                  };
                }
                return acc;
              }, {})
            }
          },
          scales: {
            x: { type: 'time', time: { unit: 'day' } },
            y: {
              title: { display: true, text: 'Price' }
            },
            rsi: {
              position: 'right',
              min: 0,
              max: 100,
              display: true,
              title: { display: true, text: 'RSI' },
              grid: { drawOnChartArea: false }
            }
          }
        }
      });
    });
  });
  
  // Helper function to get color based on RSI value
  function getRsiColor(value) {
    // Value is between 0-100
    const hue = (value * 1.2); // 0 (red) to 120 (green)
    return `hsl(${hue}, 100%, 50%)`;
  }
});