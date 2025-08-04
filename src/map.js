import { landmarks } from './landmarks-data.js';

// Configurações
const imagePaths = {
    markers: 'imgs/markers/',
    landmarks: 'imgs/landmarks/'
};

let mapInstance = null;

// Função principal
function initializeApp() {
    initMap();
    createSidebarItems();
    setupSearch();
}

// Mapa
function initMap() {
    const container = document.getElementById('map');

    if (mapInstance) {
        mapInstance.remove();
        container.innerHTML = '';
    }

    mapInstance = L.map('map').setView([-23.5715, -46.6333], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
    }).addTo(mapInstance);

    mapInstance.on('popupopen', (e) => {
        const popupContainer = e.popup.getElement();
        const langBtn = popupContainer.querySelector('.btn-lang');

        if (langBtn) {
            const landmarkId = langBtn.dataset.id;
            const landmark = landmarks.find(l => l.id === landmarkId);
            if (landmark) {
                // Determinar idioma atual baseado no texto do botão
                const currentLang = langBtn.textContent.trim() === 'PT' ? 'en' : 'pt';
                attachPopupEventListeners(e.popup, landmark, currentLang);
            }
        }
    });

    addMarkersToMap();
    return mapInstance;
}

function addMarkersToMap() {
    landmarks.forEach(landmark => {
        const marker = L.marker(landmark.coords, {
            icon: createCustomIcon(landmark.icon)
        }).addTo(mapInstance);

        marker.bindPopup(createPopupContent(landmark));
        marker.on('click', function () {
            mapInstance.setView(this.getLatLng(), 15);
        });
    });
}

// Sidebar
function createSidebarItems() {
    const resultsContainer = document.querySelector('.search-results');
    resultsContainer.innerHTML = '';

    landmarks.sort((a, b) => a.name.localeCompare(b.name))
        .forEach(landmark => {
            const item = document.createElement('div');
            item.className = 'result-item';
            item.innerHTML = `
                <div class="result-marker">
                    <img src="${imagePaths.markers}${landmark.icon}.png" 
                         alt="${landmark.name}" class="sidebar-icon">
                </div>
                <div class="result-content">
                    <div class="result-name">${landmark.name}</div>
                    <div class="result-address">${landmark.address}</div>
                </div>
            `;

            item.addEventListener('click', () => {
                mapInstance.setView(landmark.coords, 16);
                findMarkerByCoords(landmark.coords)?.openPopup();
            });
            resultsContainer.appendChild(item);
        });
}

// Utilitários
function findMarkerByCoords(coords) {
    let foundMarker = null;
    mapInstance.eachLayer(layer => {
        if (layer instanceof L.Marker &&
            layer.getLatLng().lat === coords[0] &&
            layer.getLatLng().lng === coords[1]) {
            foundMarker = layer;
        }
    });
    return foundMarker;
}

function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.result-item').forEach(item => {
            const name = item.querySelector('.result-name').textContent.toLowerCase();
            const address = item.querySelector('.result-address').textContent.toLowerCase();
            item.style.display = (name.includes(term) || address.includes(term)) ? 'flex' : 'none';
        });
    });
}

function handleLanguageSwitch(popup, landmark, currentLang) {
    const newLang = currentLang === 'en' ? 'pt' : 'en';
    const newContent = createPopupContent(landmark, newLang);

    // Encontra o marker correspondente
    const marker = findMarkerByCoords(landmark.coords);

    if (marker) {
        // Remove o popup atual e seus event listeners
        popup.remove();
        
        // Vincula o novo popup com o conteúdo atualizado
        marker.unbindPopup();
        marker.bindPopup(newContent);
        
        // Abre o novo popup
        marker.openPopup();
        
        // Aguarda o DOM ser renderizado e reanexa eventos com o idioma correto
        setTimeout(() => {
            const newPopup = marker.getPopup();
            if (newPopup) {
                attachPopupEventListeners(newPopup, landmark, newLang);
            }
        }, 50); // Aumentei um pouco o timeout para garantir renderização
    }
}

function attachPopupEventListeners(popup, landmark, lang) {
    const popupContainer = popup.getElement();
    if (!popupContainer) return;
    
    const langBtn = popupContainer.querySelector('.btn-lang');
    const contrastBtn = popupContainer.querySelector('.btn-contrast');

    // Remove event listeners existentes para evitar duplicatas
    if (langBtn) {
        langBtn.replaceWith(langBtn.cloneNode(true));
        const newLangBtn = popupContainer.querySelector('.btn-lang');
        
        newLangBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLanguageSwitch(popup, landmark, lang);
        });
    }

    if (contrastBtn) {
        contrastBtn.replaceWith(contrastBtn.cloneNode(true));
        const newContrastBtn = popupContainer.querySelector('.btn-contrast');
        
        newContrastBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const contentDiv = popupContainer.querySelector('.popup-content');
            if (contentDiv) {
                contentDiv.classList.toggle('high-contrast');
                console.log('Contraste alternado para idioma:', lang); // Debug
            }
        });
    }
}

// Templates
function createCustomIcon(iconName) {
    return L.icon({
        iconUrl: `${imagePaths.markers}${iconName}.png`,
        iconSize: [80, 80],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
        className: `marker-${iconName}`
    });
}

function createPopupContent(landmark, lang = 'pt') {
    const imagePath = `${imagePaths.landmarks}${landmark.image}`;
    const data = (lang === 'en' && landmark.translations?.en) ? landmark.translations.en : landmark;

    return `
        <div class="popup-content">
            <div class="popup-header">
                <h2>${data.name}</h2>
                <h3>${data.fullName}</h3>
                <p class="address">${data.address}</p>
            </div>
            <img src="${imagePath}" alt="${data.name}" class="popup-image">
            <div class="popup-description">
                <p>${data.description}</p>
            </div>
            <div class="popup-details">
                <h4>${lang === 'en' ? 'Information' : 'Informações'}</h4>
                <ul>
                    ${data.details.currentExhibition ? 
                        `<li><strong>${lang === 'en' ? 'Current exhibition' : 'Exposição atual'}:</strong> ${data.details.currentExhibition}</li>` : ''}
                    <li><strong>${lang === 'en' ? 'Address' : 'Endereço'}:</strong> ${data.address}</li>
                    <li><strong>${lang === 'en' ? 'Founded' : 'Inauguração'}:</strong> ${data.details.founded}</li>
                    <li><strong>${lang === 'en' ? 'Architect' : 'Arquiteto(a)'}:</strong> ${data.details.architect}</li>
                    <li><strong>${lang === 'en' ? 'Visitors' : 'Visitantes'}:</strong> ${data.details.visitors}</li>
                    <li><strong>${lang === 'en' ? 'Director' : 'Diretor(a)'}:</strong> ${data.details.director}</li>
                    <li><strong>${lang === 'en' ? 'Curator' : 'Curador(a)'}:</strong> ${data.details.curator}</li>
                    <li><strong>${lang === 'en' ? 'Phone' : 'Telefone'}:</strong> ${data.details.phone}</li>
                    <li><strong>${lang === 'en' ? 'Hours' : 'Horário'}:</strong> ${data.details.hours}</li>
                    <li><strong>${lang === 'en' ? 'Type' : 'Tipo'}:</strong> ${data.details.type}</li>
                </ul>
            </div>
            <div class="popup-actions">
                <a href="https://www.google.com/maps/dir/?api=1&destination=${landmark.coords[0]},${landmark.coords[1]}" 
                   target="_blank" class="action-btn">
                    <i class="fa fa-route"></i> ${lang === 'en' ? 'Directions' : 'Rotas'}
                </a>
                <button class="action-btn btn-lang" data-id="${landmark.id}">
                    <i class="fa fa-language"></i> ${lang === 'en' ? 'PT' : 'EN'}
                </button>
                <button class="action-btn btn-contrast">
                    <i class="fa fa-adjust"></i>
                </button>
            </div>
        </div>
    `;
}

// Inicialização única
document.addEventListener('DOMContentLoaded', initializeApp);