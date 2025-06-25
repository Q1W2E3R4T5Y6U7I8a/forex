const { Chart, TimeScale, LinearScale, CategoryScale, Tooltip, Legend } = window.Chart;

Chart.register(
  TimeScale,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

export function createChart(canvas, pairs) {
  return new Chart(canvas, {
    type: 'candlestick',
    data: {
      datasets: pairs.map(p => ({
        label: p.label,
        data: p.candles,
        color: { up: 'white', down: p.color, unchanged: p.color },
        yAxisID: 'y',
        hidden: p.id.includes('JPY') // hide JPY pairs by default
      }))
    },
    options: getChartOptions(pairs)
  });
}

function getChartOptions(pairs) {
  return {
    plugins: {
      legend: { display: true },
      annotation: {
        annotations: pairs.reduce((acc, p, i) => {
          if (p.indicators?.rsi?.value) {
            acc[`rsiLine${i}`] = createRSIAnnotation(p, i);
          }
          return acc;
        }, {})
      }
    },
    scales: {
      x: { type: 'time', time: { unit: 'day' } },
      y: { title: { display: true, text: 'Price' } },
      rsi: {
        position: 'right',
        min: 0,
        max: 100,
        display: true,
        title: { display: true, text: 'RSI' },
        grid: { drawOnChartArea: false }
      }
    }
  };
}

function createRSIAnnotation(pair, index) {
  return {
    type: 'line',
    yMin: Number(pair.indicators.rsi.value),
    yMax: Number(pair.indicators.rsi.value),
    borderColor: pair.color,
    borderWidth: 2,
    label: {
      display: true,
      content: `RSI: ${pair.indicators.rsi.value}`,
      position: 'start',
      color: pair.color,
      backgroundColor: 'rgba(0,0,0,0.7)',
      font: { weight: 'bold' },
    },
    yScaleID: 'rsi'
  };
}
