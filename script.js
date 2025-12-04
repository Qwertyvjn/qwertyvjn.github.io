document.addEventListener('DOMContentLoaded', () => {
    // ===== MODAL SYSTEM =====
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');
    
    if (!modalOverlay || !modalBody) {
        console.error('Modal elements not found');
        return;
    }
    
    // Open modal function
    window.openModal = function() {
        // Load methodology content
        fetch('ipcc-methodology.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                modalBody.innerHTML = html;
                initModalContent();
                showModal();
            })
            .catch(error => {
                console.error('Error loading methodology content:', error);
                modalBody.innerHTML = `
                    <div class="p-6 text-center">
                        <h2 class="text-2xl text-[#00b64c] mb-4">⚠️ Failed to load content</h2>
                        <p class="text-gray-300 mb-4">Please try again later.</p>
                        <button onclick="closeModal()" class="px-4 py-2 bg-[#00b64c] text-white rounded hover:bg-opacity-80">
                            Close
                        </button>
                    </div>
                `;
                showModal();
            });
    };
    
    function showModal() {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modalOverlay.classList.remove('active');
        setTimeout(() => {
            modalBody.innerHTML = '';
        }, 300);
        document.body.style.overflow = '';
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', e => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }
    
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Add event listener to methodology button in navigation
    const methodologyButton = document.getElementById('methodology-button');
    if (methodologyButton) {
        methodologyButton.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    }
    
    // Add event listener to methodology buttons in content cards
    document.querySelectorAll('.methodology-content, .btn-material').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    });
    
    // ===== SEARCH FUNCTIONALITY =====
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const body = document.body;
    
    if (searchInput && searchResults) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            
            // Clear previous results and remove search-active class if query is empty
            if (query === '') {
                searchResults.innerHTML = '';
                searchResults.classList.remove('visible');
                body.classList.remove('search-active');
                return;
            }
            
            // Define search items based on your content
            const searchItems = [
                { 
                    title: "IPCC Carbon Counting", 
                    snippet: "Track your carbon footprint based on IPCC guidelines for individuals, households, and small businesses.", 
                    type: "ipcc",
                    icon: "🌍"
                },
                { 
                    title: "Methodology", 
                    snippet: "Learn about the scientific foundation and calculation methods used in carbon counting.", 
                    type: "methodology",
                    icon: "📘"
                },
                { 
                    title: "Scope 1 Emissions", 
                    snippet: "Direct emissions from sources you control, like burning fuel in a generator or service vehicle fleet.", 
                    type: "scope",
                    icon: "🔥"
                },
                { 
                    title: "Scope 2 Emissions", 
                    snippet: "Emissions from purchased electricity or steam. The factor for Indonesia's grid, the PLN grid, is approximately ~0.71 kg CO₂/kWh.", 
                    type: "scope",
                    icon: "⚡"
                },
                { 
                    title: "Scope 3 Emissions", 
                    snippet: "All indirect emissions in the value chain, such as commuting, waste, and manufacturing of purchased goods.", 
                    type: "scope",
                    icon: "🔄"
                },
                { 
                    title: "Salinity Gradient Model (RED)", 
                    snippet: "Explore how the cost and efficiency of Reverse Electrodialysis membranes affect the viability of drawing energy from mixing fresh and salt water.", 
                    type: "red",
                    icon: "🧪"
                },
                { 
                    title: "Gravity Storage Calculator (GPE)", 
                    snippet: "A calculator demonstrating the massive mass and height required to store large-scale renewable energy using the physics of potential energy.", 
                    type: "gpe",
                    icon: "🏗️"
                },
                { 
                    title: "PPTX to PDF Converter", 
                    snippet: "Convert PowerPoint presentations to PDF format — no software needed.", 
                    type: "pptx",
                    icon: "📄"
                }
            ];
            
            // Filter items based on query
            const results = searchItems.filter(item => 
                item.title.toLowerCase().includes(query) || 
                item.snippet.toLowerCase().includes(query)
            );
            
            // Show search results container and add search-active class
            searchResults.classList.add('visible');
            body.classList.add('search-active');
            
            // Clear previous results
            searchResults.innerHTML = '';
            
            // If no results found
            if (results.length === 0) {
                searchResults.innerHTML = `
                    <div class="card">
                        <p class="text-gray-400 text-center p-4">No results found for "${query}". Try another search term.</p>
                    </div>
                `;
                return;
            }
            
            // Create result cards
            let html = `<h3 style="text-align:center; margin-bottom:1rem; color:var(--accent);">
                          ${results.length} result${results.length !== 1 ? 's' : ''} for "<strong>${this.value}</strong>"
                        </h3>`;
            
            results.forEach(item => {
                html += `
                    <div class="card">
                        <div class="flex items-start">
                            <span class="text-2xl mr-3 mt-1">${item.icon}</span>
                            <div>
                                <h3 class="font-bold text-lg mb-1">${item.title}</h3>
                                <p class="text-gray-300 mb-2">${item.snippet}</p>
                                <button class="mt-2 text-[#00b64c] hover:underline" onclick="openModal()">
                                    Learn more
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            searchResults.innerHTML = html;
        });
    }
    
    // ===== THEME TOGGLE =====
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const htmlEl = document.documentElement;
            if (htmlEl.classList.contains('light')) {
                htmlEl.classList.remove('light');
                htmlEl.classList.add('dark');
            } else {
                htmlEl.classList.remove('dark');
                htmlEl.classList.add('light');
            }
        });
    }
    
    // ===== IQAir API + CARBON FOOTPRINT COUNTER =====
    const API_KEY = 'f74e14f9-86c9-4246-8065-ec2018624690';
    const locationData = document.getElementById('location-data');
    const aqiDisplay = document.getElementById('aqi-display');
    
    function getLocation() {
        if (!navigator.geolocation) {
            locationData.textContent = '🔒 Geolocation not supported.';
            return;
        }
    
        locationData.textContent = '📍 Detecting your location...';
        navigator.geolocation.getCurrentPosition(
            success => fetchIQAirData(success.coords.latitude, success.coords.longitude),
            error => {
                console.warn('Geolocation denied or failed:', error.message);
                locationData.textContent = '🔒 Data Inaccessible';
                locationData.style.color = '#ff7e00';
                if (aqiDisplay) aqiDisplay.classList.add('hidden');
            },
            { timeout: 10000, enableHighAccuracy: false }
        );
    }
    
    async function fetchIQAirData(lat, lon) {
        try {
            const url = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${API_KEY}`;
            const res = await fetch(url);
            const data = await res.json();
    
            if (data.status !== 'success' || !data.data) {
                throw new Error(`Invalid response from IQAir. Status: ${data.status}`);
            }
    
            const city = data.data.city || 'Nearby City';
            const state = data.data.state || '';
            const aqius = data.data.current.pollution.aqius;
            const tempC = data.data.current.weather.tp;
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
    
            // Update DOM
            document.getElementById('city-name').textContent = `${city}${state ? `, ${state}` : ''}`;
            document.getElementById('aqi-value').textContent = aqius;
            document.getElementById('aqi-category').textContent = category.name;
            document.getElementById('aqi-category').style.color = category.color;
            document.getElementById('co2-value').textContent = co2Estimate;
            document.getElementById('temp-value').textContent = tempC;
    
            // Show data, hide loading
            if (locationData) locationData.classList.add('hidden');
            if (aqiDisplay) aqiDisplay.classList.remove('hidden');
        } catch (err) {
            console.error('IQAir API error:', err);
            if (locationData) locationData.textContent = `⚠️ Data unavailable. Check console.`;
            if (aqiDisplay) aqiDisplay.classList.add('hidden');
        }
    }
    
    // Carbon Counter
    let secondsSpent = 0;
    const timeSpentEl = document.getElementById('time-spent');
    const carbonValueEl = document.getElementById('carbon-value');
    const equivalentEl = document.getElementById('equivalent');
    
    setInterval(() => {
        secondsSpent++;
        if (timeSpentEl) timeSpentEl.textContent = secondsSpent;
        
        // CO2 calculation: (secondsSpent * 0.0003 g/s)
        const co2Grams = (secondsSpent * 0.0003).toFixed(1);
        if (carbonValueEl) carbonValueEl.textContent = co2Grams;
        
        // Rice equivalent: 1g rice ≈ 1.8g CO₂e
        const riceGrams = (parseFloat(co2Grams) / 1.8).toFixed(3);
        if (equivalentEl) equivalentEl.textContent = `${riceGrams} g of rice`;
    }, 1000);
    
    // Initialize location detection
    if (locationData) {
        getLocation();
    }
    
    // Initialize modal content if the page is loaded as the methodology page
    function initModalContent() {
        // Initialize glossary tooltips
        document.querySelectorAll('.term').forEach(term => {
            const tooltipText = term.getAttribute('data-tooltip');
            if (tooltipText) {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip-box';
                tooltip.textContent = tooltipText;
                term.appendChild(tooltip);
            }
        });
        
        // Initialize diagram interactions
        const diagramContainer = document.getElementById('scope-diagram');
        const detailedScopes = document.getElementById('detailed-scopes');
        const scopeHotspots = document.querySelectorAll('.scope-hotspot');
        const scopeBoxes = document.querySelectorAll('.scope-box');
        
        if (detailedScopes && scopeHotspots.length > 0) {
            // Show Scope 3 details by default
            detailedScopes.classList.remove('hidden');
            document.getElementById('scope-detail-3').classList.remove('hidden');
            
            scopeHotspots.forEach(hotspot => {
                hotspot.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const scope = this.getAttribute('data-scope');
                    
                    // Hide all scope details
                    scopeBoxes.forEach(box => box.classList.add('hidden'));
                    
                    // Show selected scope detail
                    document.getElementById(`scope-detail-${scope}`).classList.remove('hidden');
                });
            });
            
            // Default to Scope 3 when clicking on the diagram container
            if (diagramContainer) {
                diagramContainer.addEventListener('click', function(e) {
                    if (e.target === diagramContainer || e.target.classList.contains('diagram-overlay')) {
                        // Hide all scope details
                        scopeBoxes.forEach(box => box.classList.add('hidden'));
                        
                        // Show Scope 3 by default
                        document.getElementById('scope-detail-3').classList.remove('hidden');
                    }
                });
            }
        }
    }
});
