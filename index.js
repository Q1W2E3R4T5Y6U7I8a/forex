document.addEventListener('DOMContentLoaded', () => {
  const pairs = [
    { id: 'CHF_EUR_D1', label: 'CHF/EUR', color: '#1f77b4' },
    { id: 'CHF_GBP_D1', label: 'CHF/GBP', color: '#ff7f0e' },
    { id: 'CHF_JPY_D1', label: 'CHF/JPY', color: '#2ca02c' },
    { id: 'CHF_CAD_D1', label: 'CHF/CAD', color: '#d62728' },
    { id: 'CHF_NZD_D1', label: 'CHF/NZD', color: '#9467bd' }
  ];

  const rsiValueElement = document.getElementById('rsi-value');
  const pairSelect = document.getElementById('pair-select');

  Promise.all(pairs.map(p =>
    fetch(`/api/data?pair=${p.id}`)
      .then(res => res.json())
      .then(data => ({ ...p, ...data }))
  ))
  .then(allPairData => {
    const rsiList = document.getElementById('rsi-list');
    rsiList.innerHTML = allPairData.map(pair =>
      `<div class="rsi-item">
        <span class="rsi-dot" style="background:${pair.color}"></span>
        <span>${pair.label}:</span>
        <span>${pair.indicators?.rsi?.value ?? '--'}</span>
      </div>`
    ).join('');

    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, {
      type: 'candlestick',
      data: {
        datasets: allPairData.map(p => ({
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
            annotations: allPairData.reduce((acc, p, i) => {
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

    pairSelect.addEventListener('change', e => {
      updateRSIDisplay(e.target.value);
    });

    updateRSIDisplay(pairs[0].id);

    function updateRSIDisplay(selectedId) {
      const selected = allPairData.find(p => p.id === selectedId);
      rsiValueElement.textContent = selected?.indicators?.rsi?.value ?? '--';
    }
  })
  .catch(error => {
    console.error('Error loading data:', error);
    rsiValueElement.textContent = 'Error';
  });
});
