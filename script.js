// IQAir API key - Your provided key: f74e14f9-86c9-4246-8065-ec2018624690
// NOTE: For security on a public GitHub Page, it is best practice to secure API keys 
// (e.g., via a proxy server) but we are using it directly here for function demonstration.

// =========================================================================
// ===== TODAY'S PULSE — IQAir Integration (FIXED Scope & Error Handling)
// =========================================================================

function getLocation() {
    const locationData = document.getElementById('location-data');
    if (!locationData) {
        console.error('❌ #location-data element not found');
        return;
    }

    locationData.textContent = '📍 Detecting your location...';
    locationData.classList.remove('hidden');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            // Success: pass coordinates to fetch function
            success => fetchIQAirData(success.coords.latitude, success.coords.longitude),
            // Error: handle denial or timeout
            error => {
  console.warn('Geolocation denied or failed (Code ' + error.code + '):', error.message);
  locationData.textContent = '🔒 Data Inaccessible';
  locationData.classList.remove('hidden');
  locationData.style.color = '#ff7e00'; // Orange for warning
  
  const aqiDisplay = document.getElementById('aqi-display');
  if (aqiDisplay) aqiDisplay.classList.add('hidden');
  
  // Add explanation below the card
  const pulseSection = document.getElementById('pulse');
  if (pulseSection) {
    let notice = document.getElementById('iqair-notice');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'iqair-notice';
      notice.innerHTML = `
        <p style="font-size: 0.8rem; color: #a0a0a0; margin-top: 0.5rem;">
          📍 Why? Your browser blocked location access. 
          Enable location permissions to see local data.
          <br><br>
          💡 Data powered by <a href="https://www.iqair.com/air-pollution-data-api" target="_blank" style="color: #00b64c;">IQAir API</a>.
        </p>
      `;
      pulseSection.appendChild(notice);
    }
  }
},
            // Options: set timeout for better UX
            { timeout: 10000, enableHighAccuracy: false }
        );
    } else {
        locationData.textContent = '❌ Geolocation not supported. Using Jakarta.';
        fetchIQAirData(-6.2088, 106.8456);
    }
}

async function fetchIQAirData(lat, lon) {
    // 1. ✅ FIX: Define this element at the start of this function's scope.
    const locationData = document.getElementById('location-data'); 
    
    const API_KEY = 'f74e14f9-86c9-4246-8065-ec2018624690';
    const url = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== 'success' || !data.data) {
            throw new Error(`Invalid response from IQAir. Status: ${data.status} | Message: ${data.data.message || 'No data.'}`);
        }

        const city = data.data.city || 'Nearby City';
        const state = data.data.state || '';
        const aqius = data.data.current.pollution.aqius;
        const tempC = data.data.current.weather.tp;
        // Using a simple linear estimation for CO2 (400ppm base + AQI influence)
        const co2Estimate = Math.round(400 + (aqius / 300) * 150); 

        // AQI Category Mapping
        const categories = [
            { max: 50, name: 'Good', color: '#00e400' },
            { max: 100, name: 'Moderate', color: '#ffff00' },
            { max: 150, name: 'Unhealthy for Sensitive', color: '#ff7e00' },
            { max: 200, name: 'Unhealthy', color: '#ff0000' },
            { max: 300, name: 'Very Unhealthy', color: '#8f3f97' },
            { max: Infinity, name: 'Hazardous', color: '#7e0023' }
        ];
        const category = categories.find(c => aqius <= c.max) || categories[0];

        // DOM Elements
        const aqiDisplay = document.getElementById('aqi-display');
        const cityName = document.getElementById('city-name');
        const aqiValue = document.getElementById('aqi-value');
        const aqiCategory = document.getElementById('aqi-category');
        const co2Value = document.getElementById('co2-value');
        const tempValue = document.getElementById('temp-value');

        if (!aqiDisplay || !cityName || !aqiValue || !aqiCategory || !co2Value || !tempValue) {
            throw new Error('Required AQI display DOM elements missing');
        }

        // Update content
        cityName.textContent = `${city}${state ? `, ${state}` : ''}`;
        aqiValue.textContent = aqius;
        aqiCategory.textContent = category.name;
        aqiCategory.style.color = category.color;
        co2Value.textContent = co2Estimate;
        tempValue.textContent = tempC;

        // Show the data, hide the 'detecting' message
        if (locationData) locationData.classList.add('hidden');
        aqiDisplay.classList.remove('hidden');
    } catch (err) {
        console.error('IQAir API error:', err);
        const aqiDisplay = document.getElementById('aqi-display');
        if (locationData) locationData.textContent = `⚠️ Data unavailable. Check console.`;
        if (aqiDisplay) aqiDisplay.classList.add('hidden');
    }
}

// =========================================================================
// ===== CORE INITIALIZATION (Wait for DOM)
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Script loaded and DOM ready');

    // 3. ✅ FIX: THEME TOGGLE
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            console.log('🎯 Toggle clicked!');
            
            // Check current state based on 'dark' or 'light' class
            const htmlEl = document.documentElement;
            
            if (htmlEl.classList.contains('light')) {
                // Switch to Dark Mode (remove light, add dark/default)
                htmlEl.classList.remove('light');
                htmlEl.classList.add('dark');
            } else {
                // Switch to Light Mode (remove dark/default, add light)
                htmlEl.classList.remove('dark');
                htmlEl.classList.add('light');
            }
            // Note: Removed unnecessary force re-render logic.
        });
    }


    // 2. ✅ FIX: CARBON FOOTPRINT COUNTER (Logic moved inside DOMContentLoaded)
    // ===== CARBON FOOTPRINT COUNTER =====
// ===== CARBON FOOTPRINT COUNTER =====
let secondsSpent = 0;
const timeSpentEl = document.getElementById('time-spent');
const carbonValueEl = document.getElementById('carbon-value');
const equivalentEl = document.getElementById('equivalent');
const sourceEl = document.getElementById('rice-source'); // ← Add this ID to your HTML

if (timeSpentEl && carbonValueEl && equivalentEl) {
  setInterval(() => {
    secondsSpent++;
    timeSpentEl.textContent = secondsSpent;
    
    // Your CO2 calculation: (secondsSpent * 0.0003 g/s)
    const co2Grams = (secondsSpent * 0.0003).toFixed(1);
    carbonValueEl.textContent = co2Grams;
    
    // REALISTIC RICE EQUIVALENT: 1g rice ≈ 1.8g CO₂e (based on avg from Our World in Data)
    // So: g rice = g CO₂ / 1.8
    const riceGrams = (parseFloat(co2Grams) / 1.8).toFixed(3);
    equivalentEl.textContent = `${riceGrams} g of rice`;

    // Optional: Update source text if element exists
    if (sourceEl) {
      sourceEl.textContent = 'Based on: 1g rice ≈ 1.8g CO₂e (Our World in Data)';
    }
  }, 1000);
  console.log('✅ Carbon counter started');
}

    // Init pulse
    getLocation();
});
