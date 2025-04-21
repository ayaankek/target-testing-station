async function updateDashboard() {
  try {
    const [status, pressure, temperature, chamber] = await Promise.all([
      fetch('/status').then(res => res.json()),
      fetch('/pressure').then(res => res.json()),
      fetch('/temperature').then(res => res.json()),
      fetch('/chamber').then(res => res.json()),
    ]);

    document.getElementById('status-led').className = `led ${status.status.toLowerCase()}`;
    document.getElementById('pressure').innerText = pressure.pressure;
    document.getElementById('temperature').innerText = temperature.temperature;
    document.getElementById('chamber').innerText = chamber.chamber;

    addToChart(Date.now(), pressure.pressure);
  } catch (err) {
    console.error("Update failed:", err);
  }
}

function togglePower() {
  fetch('/power', {
    method: 'POST',
    body: JSON.stringify({ state: "toggle" }),
    headers: { 'Content-Type': 'application/json' }
  });
}

let chart = new Chart(document.getElementById('pressureChart'), {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Pressure (psi)',
      data: [],
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      x: { type: 'linear', title: { display: true, text: 'Time (ms)' } },
      y: { beginAtZero: true }
    }
  }
});

function addToChart(x, y) {
  chart.data.labels.push(x);
  chart.data.datasets[0].data.push(y);
  if (chart.data.labels.length > 50) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.update();
}

setInterval(updateDashboard, 1000);
