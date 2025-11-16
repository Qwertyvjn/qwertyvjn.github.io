document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  // Load saved theme or use system preference
  const saved = localStorage.getItem('theme');
  const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'light' || (!saved && !systemDark)) {
    root.classList.remove('dark');
    root.classList.add('light');
  }

  // Toggle theme
  toggle.addEventListener('click', () => {
    const isDark = root.classList.contains('dark');
    
    if (isDark) {
      root.classList.remove('dark');
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }

    // Optional: Add ripple effect
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      pointer-events: none;
      z-index: 1;
    `;
    const rect = toggle.getBoundingClientRect();
    ripple.style.left = `${rect.left + rect.width / 2 - 20}px`;
    ripple.style.top = `${rect.top + rect.height / 2 - 20}px`;
    
    document.body.appendChild(ripple);
    
    // Animate ripple
    setTimeout(() => {
      ripple.style.transition = 'transform 0.6s, opacity 0.6s';
      ripple.style.transform = 'scale(3)';
      ripple.style.opacity = '0';
    }, 10);

    // Remove after animation
    setTimeout(() => {
      ripple.remove();
    }, 700);
  });

  // 🌍 Fetch local air quality (IQAir) + weather/CO₂ (Open-Meteo)
  function fetchLocationData() {
    if (!navigator.geolocation) {
      document.getElementById('location-data').textContent = '📍 Geolocation not supported.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        document.getElementById('location-data').textContent = 
          `📍 Fetching data for ${latitude.toFixed(2)}, ${longitude.toFixed(2)}...`;

        try {
          // 🔹 1. Get Air Quality from IQAir (FREE)
          const aqiRes = await fetch(
            `https://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=f74e14f9-86c9-4246-8065-ec2018624690`
          );
          const aqiData = await aqiRes.json();

          let aqi = '--', category = '--', pm25 = '--', cityName = 'Unknown';
          if (aqiData.status === 'success') {
            aqi = aqiData.data.current.pollution.aqius;
            pm25 = aqiData.data.current.pollution.mainus;
            category = getAQICategory(aqi);
            cityName = aqiData.data.city; // Get city name from response
          }

          // 🔹 2. Get Temp & CO₂ from Open-Meteo (100% FREE, no key!)
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,co2_ppm`
          );
          const weatherData = await weatherRes.json();

          let temp = '--', co2 = '--';
          if (weatherData.current) {
            temp = weatherData.current.temperature_2m;
            co2 = weatherData.current.co2_ppm ? Math.round(weatherData.current.co2_ppm) : '--';
          }

          // 🎯 Update UI
          document.getElementById('aqi-value').textContent = aqi;
          document.getElementById('aqi-category').textContent = category;
          document.getElementById('co2-value').textContent = co2;
          document.getElementById('temp-value').textContent = temp;
          document.getElementById('city-name').textContent = cityName;
          document.getElementById('aqi-display').classList.remove('hidden');
          document.getElementById('location-data').remove();

        } catch (err) {
          console.error(err);
          document.getElementById('location-data').textContent = '❌ Failed to load local data.';
        }
      },
      (err) => {
        console.error(err);
        document.getElementById('location-data').textContent = '📍 Location access denied.';
        // Fallback: show global stats
        document.getElementById('aqi-value').textContent = "65";
        document.getElementById('aqi-category').textContent = "Moderate";
        document.getElementById('co2-value').textContent = "428";
        document.getElementById('temp-value').textContent = "--";
        document.getElementById('city-name').textContent = "Global";
        document.getElementById('aqi-display').classList.remove('hidden');
        document.getElementById('location-data').remove();
      }
    );
  }

  // Run on page load
  fetchLocationData();

  // 📉 Calculate carbon footprint based on time spent
  let startTime = Date.now();
  let carbonEstimate = 0;

  function updateCarbonFootprint() {
    const now = Date.now();
    const seconds = Math.floor((now - startTime) / 1000);
    document.getElementById('time-spent').textContent = seconds;

    // Estimate: ~0.3g CO₂ per minute for average web browsing (adjust as needed)
    carbonEstimate = (seconds / 60) * 0.3;
    document.getElementById('carbon-value').textContent = carbonEstimate.toFixed(1);

    // Equivalents
    const equivalents = [
      "0.001 g of rice",
      "0.01 g of coffee",
      "0.1 g of bread",
      "1 g of chocolate",
      "10 g of beef"
    ];
    const index = Math.min(Math.floor(carbonEstimate / 2), equivalents.length - 1);
    document.getElementById('equivalent').textContent = equivalents[index];
  }

  // Update every second
  setInterval(updateCarbonFootprint, 1000);

  // 🎓 Auto-rotate thesis snippets
  const thesisSnippets = [
    "Policy lag explains 62% of PM₂.₅ exceedance in Jakarta (2020–2024). — Undergraduate Thesis, Universitas Indonesia",
    "Reverse Electrodialysis efficiency drops 30% when membrane cost exceeds $20/m². — Simulation Analysis",
    "Gravitational storage requires 10x more mass than lithium batteries for same energy density. — Concept Note"
  ];

  let currentSnippetIndex = 0;

  function rotateThesisSnippet() {
    const content = document.getElementById('thesis-content');
    content.textContent = thesisSnippets[currentSnippetIndex];
    currentSnippetIndex = (currentSnippetIndex + 1) % thesisSnippets.length;
  }

  // Rotate every 10 seconds
  setInterval(rotateThesisSnippet, 10000);

  // Load first snippet on page load
  rotateThesisSnippet();

  // 📩 Handle newsletter signup
  document.getElementById('newsletter-form').addEventListener('submit', e => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    // Mock success
    document.getElementById('form-status').textContent = '✅ Thanks! Check your inbox.';
    document.getElementById('form-status').classList.remove('hidden');
    e.target.reset();
  });
});

// Helper: AQI to category (US EPA scale)
function getAQICategory(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}
