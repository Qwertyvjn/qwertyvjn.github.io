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
        // ⚠️ Replace 'YOUR_FREE_IQAIR_KEY' with your key from https://www.iqair.com/air-pollution-data-api
        const aqiRes = await fetch(
          `https://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=YOUR_FREE_IQAIR_KEY`
        );
        const aqiData = await aqiRes.json();

        let aqi = '--', category = '--', pm25 = '--';
        if (aqiData.status === 'success') {
          aqi = aqiData.data.current.pollution.aqius;
          pm25 = aqiData.data.current.pollution.mainus;
          category = getAQICategory(aqi);
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
        document.getElementById('pm25-value').textContent = pm25;
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
      document.getElementById('pm25-value').textContent = "18";
      document.getElementById('aqi-display').classList.remove('hidden');
      document.getElementById('location-data').remove();
    }
  );
}

// Helper: AQI to category (US EPA scale)
function getAQICategory(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}
