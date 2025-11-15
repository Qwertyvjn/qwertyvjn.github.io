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

  // 🌍 Get user location & fetch local environmental data
  function fetchLocationData() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          document.getElementById('location-data').textContent = `📍 Fetching data for ${latitude.toFixed(2)}, ${longitude.toFixed(2)}...`;

          // Example: OpenWeather Air Pollution API (free tier)
          // ⚠️ Replace YOUR_API_KEY with your own from https://openweathermap.org/api
          fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=YOUR_API_KEY`)
            .then(res => res.json())
            .then(data => {
              const aqi = data.list[0].main.aqi;
              const co2 = data.list[0].components.co; // CO in µg/m³ — convert to ppm if needed
              const category = ["Good", "Fair", "Moderate", "Poor", "Very Poor"][aqi - 1] || "Unknown";

              document.getElementById('aqi-value').textContent = aqi;
              document.getElementById('aqi-category').textContent = category;
              document.getElementById('co2-value').textContent = Math.round(co2 / 1000); // Convert µg/m³ to ppm
              document.getElementById('temp-value').textContent = "--"; // Temp not in air_pollution API — add separate call if needed
              document.getElementById('aqi-display').classList.remove('hidden');
              document.getElementById('location-data').remove();
            })
            .catch(err => {
              document.getElementById('location-data').textContent = '❌ Could not fetch data. Try again later.';
            });
        },
        err => {
          document.getElementById('location-data').textContent = '📍 Location access denied. Showing global data...';
          // Fallback: show global stats
          document.getElementById('aqi-value').textContent = "428";
          document.getElementById('aqi-category').textContent = "Moderate";
          document.getElementById('co2-value').textContent = "428";
          document.getElementById('temp-value').textContent = "--";
          document.getElementById('aqi-display').classList.remove('hidden');
          document.getElementById('location-data').remove();
        }
      );
    } else {
      document.getElementById('location-data').textContent = '📍 Browser does not support geolocation.';
    }
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
