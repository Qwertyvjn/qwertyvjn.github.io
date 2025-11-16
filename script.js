// ===== TODAY'S PULSE — IQAir (AirVisual) Integration =====

function getLocation() {
  const locationData = document.getElementById('location-data');
  if (!locationData) return console.warn('location-data element not found');

  locationData.textContent = '📍 Detecting your location...';
  locationData.classList.remove('hidden');

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      success => {
        fetchIQAirData(success.coords.latitude, success.coords.longitude);
      },
      error => {
        console.warn('Geolocation denied or error:', error);
        locationData.textContent = '❌ Location access denied. Using Jakarta.';
        fetchIQAirData(-6.2088, 106.8456); // Jakarta fallback
      }
    );
  } else {
    locationData.textContent = '❌ Geolocation not supported. Using Jakarta.';
    fetchIQAirData(-6.2088, 106.8456);
  }
}

async function fetchIQAirData(lat, lon) {
  const API_KEY = 'YOUR_IQAIR_API_KEY'; // 🔑 ← REPLACE THIS WITH YOUR ACTUAL KEY

  const url = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'success' || !data.data) {
      throw new Error(data.data || 'Invalid API response');
    }

    const city = data.data.city || 'Nearby City';
    const state = data.data.state || '';
    const aqius = data.data.current.pollution.aqius;
    const tempC = data.data.current.weather.tp;
    const co2Estimate = Math.round(400 + (aqius / 300) * 150); // Approximation

    // EPA AQI Categories
    const categories = [
      { max: 50, name: 'Good', color: '#00e400' },
      { max: 100, name: 'Moderate', color: '#ffff00' },
      { max: 150, name: 'Unhealthy for Sensitive', color: '#ff7e00' },
      { max: 200, name: 'Unhealthy', color: '#ff0000' },
      { max: 300, name: 'Very Unhealthy', color: '#8f3f97' },
      { max: Infinity, name: 'Hazardous', color: '#7e0023' }
    ];
    const category = categories.find(c => aqius <= c.max) || categories[0];

    // Safely update DOM
    const elements = {
      aqiDisplay: document.getElementById('aqi-display'),
      cityName: document.getElementById('city-name'),
      aqiValue: document.getElementById('aqi-value'),
      aqiCategory: document.getElementById('aqi-category'),
      co2Value: document.getElementById('co2-value'),
      tempValue: document.getElementById('temp-value'),
    };

    if (!Object.values(elements).every(el => el)) {
      throw new Error('Required DOM elements missing');
    }

    elements.cityName.textContent = `${city}${state ? `, ${state}` : ''}`;
    elements.aqiValue.textContent = aqius;
    elements.aqiCategory.textContent = category.name;
    elements.aqiCategory.style.color = category.color;
    elements.co2Value.textContent = co2Estimate;
    elements.tempValue.textContent = tempC;

    locationData.classList.add('hidden');
    elements.aqiDisplay.classList.remove('hidden');
  } catch (err) {
    console.error('IQAir API error:', err);
    const locationData = document.getElementById('location-data');
    const aqiDisplay = document.getElementById('aqi-display');
    if (locationData) {
      locationData.textContent = `⚠️ Data unavailable: ${err.message}`;
      locationData.classList.remove('hidden');
    }
    if (aqiDisplay) aqiDisplay.classList.add('hidden');
  }
}

// ===== CARBON FOOTPRINT COUNTER =====
let secondsSpent = 0;
const timeSpentEl = document.getElementById('time-spent');
const carbonValueEl = document.getElementById('carbon-value');
const equivalentEl = document.getElementById('equivalent');

if (timeSpentEl && carbonValueEl && equivalentEl) {
  setInterval(() => {
    secondsSpent++;
    timeSpentEl.textContent = secondsSpent;
    const co2Grams = (secondsSpent * 0.0003).toFixed(1);
    carbonValueEl.textContent = co2Grams;
    const riceEquivalent = (co2Grams * 1).toFixed(3);
    equivalentEl.textContent = `${riceEquivalent} g of rice`;
  }, 1000);
}

// ===== THEME TOGGLE — SAFE INIT =====
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
    });
  }

  // Init data
  getLocation();
});
