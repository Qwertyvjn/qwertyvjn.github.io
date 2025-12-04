// ===== THEME TOGGLE =====
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      document.documentElement.classList.toggle('light');
    });
  }
});

// ===== IQAir + CARBON COUNTER =====
document.addEventListener('DOMContentLoaded', () => {
  // IQAir
  const API_KEY = 'f74e14f9-86c9-4246-8065-ec2018624690';
  const loc = document.getElementById('location-data');
  const aqiDisp = document.getElementById('aqi-display');
  const city = document.getElementById('city-name');
  const aqiVal = document.getElementById('aqi-value');
  const aqiCat = document.getElementById('aqi-category');
  const co2Val = document.getElementById('co2-value');
  const tempVal = document.getElementById('temp-value');
  
  function getLocation() {
    if (!navigator.geolocation) return loc.textContent = '🔒 Geolocation not supported.';
    loc.textContent = '📍 Detecting your location...';
    navigator.geolocation.getCurrentPosition(
      pos => fetchIQAir(pos.coords.latitude, pos.coords.longitude),
      err => {
        loc.textContent = '🔒 Data Inaccessible';
        loc.style.color = '#ff7e00';
        aqiDisp.classList.add('hidden');
      },
      { timeout: 10000 }
    );
  }
  
  async function fetchIQAir(lat, lon) {
    try {
      const res = await fetch(`https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${API_KEY}`);
      const data = await res.json();
      if (data.status !== 'success') throw new Error('Invalid IQAir response');
      const d = data.data;
      const aqius = d.current.pollution.aqius;
      const categories = [
        {max:50, name:'Good', color:'#00e400'},
        {max:100, name:'Moderate', color:'#ffff00'},
        {max:150, name:'Unhealthy for Sensitive', color:'#ff7e00'},
        {max:200, name:'Unhealthy', color:'#ff0000'},
        {max:300, name:'Very Unhealthy', color:'#8f3f97'},
        {max:Infinity, name:'Hazardous', color:'#7e0023'}
      ];
      const cat = categories.find(c => aqius <= c.max) || categories[0];
      city.textContent = `${d.city || 'Nearby'}${d.state ? `, ${d.state}` : ''}`;
      aqiVal.textContent = aqius;
      aqiCat.textContent = cat.name;
      aqiCat.style.color = cat.color;
      co2Val.textContent = Math.round(400 + (aqius / 300) * 150);
      tempVal.textContent = d.current.weather.tp;
      loc.classList.add('hidden');
      aqiDisp.classList.remove('hidden');
    } catch (err) {
      loc.textContent = '⚠️ Data unavailable';
      aqiDisp.classList.add('hidden');
    }
  }
  
  // Carbon Counter
  let sec = 0;
  const timeEl = document.getElementById('time-spent');
  const co2El = document.getElementById('carbon-value');
  const riceEl = document.getElementById('equivalent');
  const srcEl = document.getElementById('rice-source');
  setInterval(() => {
    sec++;
    timeEl.textContent = sec;
    const co2 = (sec * 0.0003).toFixed(1);
    co2El.textContent = co2;
    riceEl.textContent = (co2 / 1.8).toFixed(3) + ' g of rice';
    if (srcEl) srcEl.textContent = 'Based on: 1g rice ≈ 1.8g CO₂e (Our World in Data)';
  }, 1000);
  
  getLocation();
});

// ===== MODAL SYSTEM =====
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');
  const close = document.getElementById('modal-close');
  
  window.openModal = async (url) => {
    try {
      const res = await fetch(url);
      body.innerHTML = await res.text();
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    } catch (e) {
      body.innerHTML = `<h2 style="color:var(--accent)">⚠️ Failed to load</h2><p>${e.message || 'Check console'}</p>`;
      modal.classList.add('active');
    }
  };
  
  const closeModal = () => {
    modal.classList.remove('active');
    setTimeout(() => body.innerHTML = '', 300);
    document.body.style.overflow = '';
  };
  
  if (close) close.onclick = closeModal;
  if (modal) modal.onclick = e => { if (e.target === modal) closeModal(); };
  document.onkeydown = e => { if (e.key === 'Escape') closeModal(); };
});

// ===== SEARCH (FIXED: middle only, sidebars stay) =====
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const mainContent = document.getElementById('main-content');
  
  if (!input) return;
  
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      document.body.classList.remove('search-active');
      results.innerHTML = '';
      results.classList.remove('visible');
      mainContent.style.display = 'block';
      return;
    }
    
    // Hide main content, show results
    mainContent.style.display = 'none';
    results.classList.add('visible');
    
    // Search in #content and #tools cards
    const allCards = document.querySelectorAll('#content .card, #tools .card');
    const matches = [];
    
    allCards.forEach(card => {
      const title = card.querySelector('h3')?.textContent || '';
      const desc = card.querySelector('p')?.textContent || '';
      const btns = Array.from(card.querySelectorAll('a')).map(a => a.textContent).join(' ');
      const text = `${title} ${desc} ${btns}`.toLowerCase();
      if (text.includes(q)) matches.push(card.cloneNode(true));
    });
    
    if (matches.length) {
      results.innerHTML = `
        <h3 style="text-align:center; margin-bottom:1rem; color:var(--accent);">Results for "<strong>${q}</strong>"</h3>
        ${matches.map(c => c.outerHTML).join('')}
      `;
    } else {
      results.innerHTML = `<div class="card" style="text-align:center; padding:2rem;"><p>No results for "<strong>${q}</strong>"</p></div>`;
    }
  });
});
