// ===== TODAY'S PULSE - REAL-TIME DATA FEEDS =====

// Get user's location (if permitted)
function getLocation() {
  const locationData = document.getElementById('location-data');
  const aqiDisplay = document.getElementById('aqi-display');
  
  if (navigator.geolocation) {
    locationData.textContent = '📍 Detecting your location...';
    
    navigator.geolocation.getCurrentPosition(
      success => {
        fetchAirQuality(success.coords.latitude, success.coords.longitude);
      },
      error => {
        locationData.textContent = '❌ Location access denied. Using default city.';
        fetchAirQuality(-6.2088, 106.8456); // Jakarta as fallback
      }
    );
  } else {
    locationData.textContent = '❌ Geolocation not supported. Using default city.';
    fetchAirQuality(-6.2088, 106.8456); // Jakarta
  }
}

// Fetch Air Quality Index (AQI) from OpenWeatherMap
async function fetchAirQuality(lat, lon) {
  const apiKey = 'f74e14f9-86c9-4246-8065-ec2018624690'; // ← GET ONE FREE AT https://openweathermap.org/api
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.list && data.list[0]) {
      const aqi = data.list[0].main.aqi;
      const co2 = Math.round(data.list[0].components.co);
      const temp = Math.round(data.list[0].components.no2 / 10); // Placeholder temp logic

      // Map AQI to category
      const categories = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
      const category = categories[aqi - 1] || 'Unknown';

      document.getElementById('city-name').textContent = 'Your City';
      document.getElementById('aqi-value').textContent = aqi;
      document.getElementById('aqi-category').textContent = category;
      document.getElementById('co2-value').textContent = co2;
      document.getElementById('temp-value').textContent = temp;

      document.getElementById('location-data').classList.add('hidden');
      aqiDisplay.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Error fetching air quality:', err);
    document.getElementById('location-data').textContent = '⚠️ Data unavailable';
  }
}

// ===== CARBON FOOTPRINT COUNTER =====

let secondsSpent = 0;
const timeSpentEl = document.getElementById('time-spent');
const carbonValueEl = document.getElementById('carbon-value');
const equivalentEl = document.getElementById('equivalent');

setInterval(() => {
  secondsSpent++;
  timeSpentEl.textContent = secondsSpent;

  // Estimate CO2 per second (based on avg web page energy use ~0.0003g CO2/sec)
  const co2Grams = (secondsSpent * 0.0003).toFixed(1);
  carbonValueEl.textContent = co2Grams;

  // Equivalent: 1g rice ≈ 1g CO2 (roughly)
  const riceEquivalent = (co2Grams * 1).toFixed(3);
  equivalentEl.textContent = `${riceEquivalent} g of rice`;
}, 1000);

// ===== THEME TOGGLE =====

const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
});

// ===== INIT ON LOAD =====

document.addEventListener('DOMContentLoaded', () => {
  getLocation();
});
