// APG Simulator JavaScript
// Handles chart creation, form submission and UI interactions

document.addEventListener('DOMContentLoaded', () => {
  // Canvas context for custom chart drawing
  const canvas = document.getElementById('thrustChart');
  const ctx = canvas.getContext('2d');
  let runCount = 0;
  // Array to hold result values (in μN)
  const results = [];

  /**
   * Draw the chart onto the canvas. This function clears the canvas,
   * computes scaling based on the data array, and draws axes, lines and points.
   */
  function drawChart() {
    const width = canvas.width;
    const height = canvas.height;
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    // Define chart area with margins
    const margin = 40;
    const chartWidth = width - margin * 2;
    const chartHeight = height - margin * 2;
    // Draw axes
    ctx.strokeStyle = '#263859';
    ctx.lineWidth = 1;
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.stroke();
    // Determine max value for scaling
    let maxVal = 1;
    if (results.length > 0) {
      maxVal = Math.max(...results) * 1.1;
      if (maxVal <= 0) maxVal = 1;
    }
    // Draw Y-axis labels (5 intervals)
    const yIntervals = 5;
    ctx.fillStyle = '#8693a5';
    ctx.font = '12px Arial';
    for (let i = 0; i <= yIntervals; i++) {
      const yVal = (maxVal / yIntervals) * i;
      const yPos = height - margin - (chartHeight * i) / yIntervals;
      ctx.fillText(yVal.toFixed(1), 0, yPos + 4);
      // horizontal grid lines
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.moveTo(margin, yPos);
      ctx.lineTo(width - margin, yPos);
      ctx.stroke();
    }
    // Draw X-axis labels and data points
    if (results.length > 0) {
      const xStep = chartWidth / (results.length - 1 || 1);
      ctx.beginPath();
      ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary')
        .trim();
      ctx.lineWidth = 2;
      results.forEach((val, index) => {
        const x = margin + xStep * index;
        const y = height - margin - (val / maxVal) * chartHeight;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      // Draw points
      results.forEach((val, index) => {
        const x = margin + xStep * index;
        const y = height - margin - (val / maxVal) * chartHeight;
        ctx.beginPath();
        ctx.fillStyle = getComputedStyle(document.documentElement)
          .getPropertyValue('--primary')
          .trim();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      // Draw X-axis labels
      ctx.fillStyle = '#8693a5';
      ctx.font = '12px Arial';
      results.forEach((val, index) => {
        const x = margin + xStep * index;
        ctx.fillText(`Run ${index + 1}`, x - 10, height - margin + 15);
      });
    } else {
      // No data placeholder
      ctx.fillStyle = '#8693a5';
      ctx.font = '14px Arial';
      ctx.fillText('No data', width / 2 - 30, height / 2);
    }
  }

  // Constant derived from APG report (approximate)
  const K = 0.00135;

  const phaseRange = document.getElementById('phaseGradient');
  const phaseValue = document.getElementById('phaseValue');

  // Sync slider and number input both ways
  phaseRange.addEventListener('input', (e) => {
    phaseValue.value = parseFloat(e.target.value).toFixed(2);
  });
  phaseValue.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= parseFloat(phaseRange.min) && val <= parseFloat(phaseRange.max)) {
      phaseRange.value = val;
    }
  });

  // Simulation form submission
  document.getElementById('simForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const pg = parseFloat(phaseValue.value);
    const area = parseFloat(document.getElementById('arrayArea').value);
    const intensity = parseFloat(document.getElementById('intensity').value);
    if (
      isNaN(pg) ||
      isNaN(area) ||
      isNaN(intensity) ||
      pg < 0 ||
      area < 0 ||
      intensity < 0
    ) {
      alert('Please enter valid non-negative values for all parameters.');
      return;
    }
    // Calculate thrust in microNewtons
    const thrust = K * Math.pow(pg, 2) * area * intensity * 1e6;
    runCount++;
    results.push(thrust);
    drawChart();
    document.getElementById('resultDisplay').innerText = `${thrust.toFixed(3)} μN`;
  });

  // Clear chart handler
  document.getElementById('clearChart').addEventListener('click', () => {
    results.length = 0;
    runCount = 0;
    drawChart();
    document.getElementById('resultDisplay').innerText = 'No simulation run yet.';
  });

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile navigation toggle
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });
  // Close navigation when a link is clicked (mobile)
  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
    });
  });

  // Draw initial empty chart
  drawChart();
});