import { landmarks } from './landmarks-data.js';

// Configuração dos caminhos das imagens
const imagePaths = {
    markers: 'imgs/markers/',
    landmarks: 'imgs/landmarks/'
};

// Inicialização do mapa
function initMap() {
    const saoPauloCoords = [-23.5505, -46.6333];
    const map = L.map('map').setView(saoPauloCoords, 12);

    // Camada base do mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
    }).addTo(map);

    // Adiciona marcadores ao mapa
    landmarks.forEach(landmark => {
        const marker = L.marker(landmark.coords, {
            icon: createCustomIcon(landmark.icon)
        }).addTo(map);
        
        marker.bindPopup(createPopupContent(landmark));
        marker.on('click', function() {
            map.setView(this.getLatLng(), 15);
        });
    });
}

// Cria ícones personalizados
function createCustomIcon(iconName) {
    return L.icon({
        iconUrl: `${imagePaths.markers}${iconName}.png`,
        iconSize: [80, 80],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
        className: `marker-${iconName}`
    });
}

function createPopupContent(landmark) {
    const imagePath = `${imagePaths.landmarks}${landmark.image}`;
    
    return `
        <div class="popup-content">
            <div class="popup-header">
                <h2>${landmark.name}</h2>
                <h3>${landmark.fullName}</h3>
                <p class="address">${landmark.address}</p>
            </div>
            
            <img src="${imagePath}" alt="${landmark.name}" class="popup-image">
            
            <div class="popup-description">
                <p>${landmark.description}</p>
            </div>
            
            <div class="popup-details">
                <h4>Informações</h4>
                <ul>
                    ${landmark.details.currentExhibition ? `<li><strong>Exposição atual:</strong> ${landmark.details.currentExhibition}</li>` : ''}
                    <li><strong>Endereço:</strong> ${landmark.address}</li>
                    <li><strong>Inauguração:</strong> ${landmark.details.founded}</li>
                    <li><strong>Arquiteto(a):</strong> ${landmark.details.architect}</li>
                    <li><strong>Visitantes:</strong> ${landmark.details.visitors}</li>
                    <li><strong>Diretor(a):</strong> ${landmark.details.director}</li>
                    <li><strong>Curador(a):</strong> ${landmark.details.curator}</li>
                    <li><strong>Telefone:</strong> ${landmark.details.phone}</li>
                    <li><strong>Horário:</strong> ${landmark.details.hours}</li>
                    <li><strong>Tipo:</strong> ${landmark.details.type}</li>
                </ul>
            </div>
            
            <div class="popup-actions">
                <a href="https://www.google.com/maps/dir/?api=1&destination=${landmark.coords[0]},${landmark.coords[1]}" 
                   target="_blank" class="action-btn">
                    <i class="fa fa-route"></i> Rotas
                </a>
            </div>
        </div>
    `;
}

// Função para criar itens da barra lateral
function createSidebarItems() {
    const resultsContainer = document.querySelector('.search-results');
    resultsContainer.innerHTML = '';
    landmarks.sort((a, b) => a.name.localeCompare(b.name));

    landmarks.forEach(landmark => {
        const iconUrl = `${imagePaths.markers}${landmark.icon}.png`;
        
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `
            <div class="result-marker">
                <img src="${iconUrl}" alt="${landmark.name}" class="sidebar-icon">
            </div>
            <div class="result-content">
                <div class="result-name">${landmark.name}</div>
                <div class="result-address">${landmark.address}</div>
            </div>
        `;

        // Adiciona evento de clique
        item.addEventListener('click', () => {
            map.setView(landmark.coords, 16);
            const marker = findMarkerByCoords(landmark.coords);
            if (marker) marker.openPopup();
        });
        
        resultsContainer.appendChild(item);
    });
}

// Função auxiliar para encontrar marcador pelas coordenadas
function findMarkerByCoords(coords) {
    let foundMarker = null;
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            const markerCoords = layer.getLatLng();
            if (markerCoords.lat === coords[0] && markerCoords.lng === coords[1]) {
                foundMarker = layer;
            }
        }
    });
    return foundMarker;
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    createSidebarItems();
    
    // Implementação da busca
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.result-item');
        
        items.forEach(item => {
            const name = item.querySelector('.result-name').textContent.toLowerCase();
            const address = item.querySelector('.result-address').textContent.toLowerCase();
            if (name.includes(term) || address.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Inicializa o mapa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initMap);