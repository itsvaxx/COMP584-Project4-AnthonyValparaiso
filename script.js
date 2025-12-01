// State list for the dropdown
const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
    'Wisconsin', 'Wyoming'
];

// Populate state dropdown
const stateSelect = document.getElementById('stateSelect');
states.forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
});

// Fetch breweries from API
async function fetchBreweries(state, type) {
    const loading = document.getElementById('loading');
    const container = document.getElementById('breweriesContainer');
    
    loading.style.display = 'block';
    container.innerHTML = '';
    
    let url = 'https://api.openbrewerydb.org/v1/breweries';
    const params = [];
    
    if (state) params.push(`by_state=${encodeURIComponent(state)}`);
    if (type) params.push(`by_type=${type}`);
    
    // Add per_page parameter to get more results
    params.push('per_page=50');
    
    if (params.length > 0) {
        url += `?${params.join('&')}`;
    }
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const breweries = await response.json();
        
        if (breweries.length === 0) {
            container.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">No breweries found for the selected criteria.</p>';
        } else {
            displayBreweries(breweries);
        }
    } catch (error) {
        console.error('Error fetching breweries:', error);
        container.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Error fetching breweries. Please try again.</p>';
    } finally {
        loading.style.display = 'none';
    }
}

// Display breweries in the grid
function displayBreweries(breweries) {
    const container = document.getElementById('breweriesContainer');
    container.innerHTML = '';
    
    breweries.forEach(brewery => {
        const card = document.createElement('div');
        card.className = 'brewery-card';
        
        // Format phone number if it exists
        let phoneDisplay = '';
        if (brewery.phone) {
            // Basic phone formatting
            const cleaned = brewery.phone.replace(/\D/g, '');
            if (cleaned.length === 10) {
                phoneDisplay = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
            } else {
                phoneDisplay = brewery.phone;
            }
        }
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${brewery.name}</h3>
            </div>
            <div class="card-body">
                <span class="brewery-type">${brewery.brewery_type || 'Unknown'}</span>
                <div class="brewery-info">
                    <i>📍</i> ${brewery.city}, ${brewery.state}
                </div>
                ${brewery.street ? `<div class="brewery-info"><i>🏠</i> ${brewery.street}</div>` : ''}
                ${phoneDisplay ? `<div class="brewery-info"><i>📞</i> ${phoneDisplay}</div>` : ''}
                ${brewery.website_url ? `<div class="brewery-info"><i>🌐</i> <a href="${brewery.website_url}" target="_blank">Website</a></div>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// Apply spring animation to cards
function animateCards() {
    const cards = document.querySelectorAll('.brewery-card');
    
    cards.forEach((card, index) => {
        // Reset position and scale for spring animation
        card.style.transform = 'translateY(100px) scale(0.8)';
        card.style.opacity = '0';
        
        // Use Popmotion spring animation with staggered delay
        setTimeout(() => {
            popmotion.spring({
                from: { 
                    y: 100, 
                    scale: 0.8, 
                    opacity: 0 
                },
                to: { 
                    y: 0, 
                    scale: 1, 
                    opacity: 1 
                },
                stiffness: 300,
                damping: 20,
                mass: 1
            }).start({
                update: (latest) => {
                    card.style.transform = `translateY(${latest.y}px) scale(${latest.scale})`;
                    card.style.opacity = latest.opacity;
                },
                complete: () => {
                    console.log(`Animation completed for ${card.querySelector('h3').textContent}`);
                }
            });
        }, index * 150); // Stagger the animations
    });
}

// Apply spring animation to individual card on hover
function setupCardHoverAnimations() {
    const cards = document.querySelectorAll('.brewery-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            popmotion.spring({
                from: { scale: 1 },
                to: { scale: 1.05 },
                stiffness: 400,
                damping: 25
            }).start({
                update: (latest) => {
                    card.style.transform = `scale(${latest.scale})`;
                }
            });
        });
        
        card.addEventListener('mouseleave', () => {
            popmotion.spring({
                from: { scale: 1.05 },
                to: { scale: 1 },
                stiffness: 400,
                damping: 25
            }).start({
                update: (latest) => {
                    card.style.transform = `scale(${latest.scale})`;
                }
            });
        });
    });
}

// Event listeners
document.getElementById('fetchBtn').addEventListener('click', () => {
    const state = stateSelect.value;
    const type = document.getElementById('typeSelect').value;
    fetchBreweries(state, type).then(() => {
        // Setup hover animations after new cards are loaded
        setTimeout(setupCardHoverAnimations, 100);
    });
});

document.getElementById('animateBtn').addEventListener('click', animateCards);

// Load some initial data when page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchBreweries('California', 'micro').then(() => {
        // Setup hover animations after initial cards are loaded
        setTimeout(setupCardHoverAnimations, 100);
    });
});