document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('theme') || 'dark';
  root.classList.toggle('light', savedTheme === 'light');
  root.classList.toggle('dark', savedTheme === 'dark');

  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = root.classList.contains('dark');
    root.classList.toggle('light', isDark);
    root.classList.toggle('dark', !isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  });

  // Fetch local data
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        document.getElementById('location-data').textContent = '📍 Loading...';

        // Open-Meteo (free, no key)
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,co2_ppm`)
          .then(res => res.json())
          .then(data => {
            const temp = data.current?.temperature_2m ?? '--';
            const co2 = data.current?.co2_ppm ? Math.round(data.current.co2_ppm) : '--';
            document.getElementById('temp-value').textContent = temp;
            document.getElementById('co2-value').textContent = co2;
            document.getElementById('city-name').textContent = 'Near you';
            document.getElementById('aqi-value').textContent = '—';
            document.getElementById('aqi-category').textContent = '—';
            document.getElementById('aqi-display').classList.remove('hidden');
            document.getElementById('location-data').remove();
          })
          .catch(() => fallbackData());
      },
      () => fallbackData()
    );
  } else {
    fallbackData();
  }

  function fallbackData() {
    document.getElementById('city-name').textContent = 'Global';
    document.getElementById('aqi-value').textContent = '65';
    document.getElementById('aqi-category').textContent = 'Moderate';
    document.getElementById('co2-value').textContent = '428';
    document.getElementById('temp-value').textContent = '18';
    document.getElementById('aqi-display').classList.remove('hidden');
    document.getElementById('location-data').remove();
  }

  // Carbon counter
  let start = Date.now();
  setInterval(() => {
    const secs = Math.floor((Date.now() - start) / 1000);
    const co2 = (secs / 60) * 0.3;
    document.getElementById('time-spent').textContent = secs;
    document.getElementById('carbon-value').textContent = co2.toFixed(1);
    
    const equivalents = [
      "0.001 g of rice",
      "0.01 g of coffee",
      "0.1 g of bread",
      "1 g of chocolate",
      "10 g of beef"
    ];
    const idx = Math.min(Math.floor(co2 / 2), equivalents.length - 1);
    document.getElementById('equivalent').textContent = equivalents[idx];
  }, 1000);

  // Thesis rotation
  const snippets = [
    "Policy lag explains 62% of PM₂.₅ exceedance in Jakarta (2020–2024).",
    "Reverse Electrodialysis efficiency drops 30% when membrane cost exceeds $20/m².",
    "Gravitational storage requires 10x more mass than lithium batteries for same energy density."
  ];
  let i = 0;
  setInterval(() => {
    document.getElementById('thesis-content').textContent = snippets[i];
    i = (i + 1) % snippets.length;
  }, 8000);

  // Newsletter
  document.getElementById('newsletter-form').addEventListener('submit', e => {
    e.preventDefault();
    alert('✅ Thanks! Check your inbox.');
    e.target.reset();
  });
});
