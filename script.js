// ===== TODAY'S PULSE — IQAir (AirVisual) Integration =====

function getLocation() {
  const locationData = document.getElementById('location-data');
  const aqiDisplay = document.getElementById('aqi-display');
  
  if (navigator.geolocation) {
    locationData.textContent = '📍 Detecting your location...';
    navigator.geolocation.getCurrentPosition(
      success => {
        fetchIQAirData(success.coords.latitude, success.coords.longitude);
      },
      error => {
        locationData.textContent = '❌ Location denied. Using Jakarta.';
        fetchIQAirData(-6.2088, 106.8456); // Jakarta fallback
      }
    );
  } else {
    locationData.textContent = '❌ Geolocation unsupported. Using Jakarta.';
    fetchIQAirData(-6.2088, 106.8456);
  }
}

async function fetchIQAirData(lat, lon) {
  const API_KEY =f74e14f9-86c9-4246-8065-ec2018624690; // ← REPLACE THIS
  const url = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 'success' && data.data) {
      const city = data.data.city || 'Nearby City';
      const state = data.data.state || '';
      const country = data.data.country || '';
      const aqius = data.data.current.pollution.aqius; // US AQI
      const mainus = data.data.current.pollution.mainus; // Main pollutant (e.g., 'p2')
      const tempC = data.data.current.weather.tp; // °C
      const humidity = data.data.current.weather.hu;
      const windSpeed = data.data.current.weather.ws;

      // Estimate CO₂ indirectly (⚠️ Note: IQAir does NOT provide direct CO₂)
      // Approximation: In polluted urban areas, CO₂ often correlates loosely with NO₂/PM2.5
      // We'll show a realistic *typical urban range* with disclaimer
      const co2Estimate = Math.round(400 + (aqius / 300) * 150); // ~400–550 ppm

      // AQI category (US EPA standard)
      let category, color;
      if (aqius <= 50) { category = 'Good'; color = '#00e400'; }
      else if (aqius <= 100) { category = 'Moderate'; color = '#ffff00'; }
      else if (aqius <= 150) { category = 'Unhealthy for Sensitive'; color = '#ff7e00'; }
      else if (aqius <= 200) { category = 'Unhealthy'; color = '#ff0000'; }
      else if (aqius <= 300) { category = 'Very Unhealthy'; color = '#8f3f97'; }
      else { category = 'Hazardous'; color = '#7e0023'; }

      // Update DOM
      document.getElementById('city-name').textContent = `${city}${state ? `, ${state}` : ''}`;
      document.getElementById('aqi-value').textContent = aqius;
      document.getElementById('aqi-category').textContent = category;
      document.getElementById('aqi-category').style.color = color;
      document.getElementById('co2-value').textContent = co2Estimate;
      document.getElementById('temp-value').textContent = tempC;

      document.getElementById('location-data').classList.add('hidden');
      aqiDisplay.classList.remove('hidden');
    } else {
      throw new Error(data.data || 'Unknown API error');
    }
  } catch (err) {
    console.error('IQAir API error:', err);
    document.getElementById('location-data').textContent = `⚠️ Data unavailable: ${err.message || 'Check console'}`;
  }
}

// ===== CARBON FOOTPRINT COUNTER (unchanged) =====
let secondsSpent = 0;
const timeSpentEl = document.getElementById('time-spent');
const carbonValueEl = document.getElementById('carbon-value');
const equivalentEl = document.getElementById('equivalent');

setInterval(() => {
  secondsSpent++;
  timeSpentEl.textContent = secondsSpent;
  const co2Grams = (secondsSpent * 0.0003).toFixed(1);
  carbonValueEl.textContent = co2Grams;
  const riceEquivalent = (co2Grams * 1).toFixed(3);
  equivalentEl.textContent = `${riceEquivalent} g of rice`;
}, 1000);

// ===== THEME TOGGLE =====
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  getLocation();
});
