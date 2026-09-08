document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Relógio e Clima (Santos)
    setInterval(() => { 
        let d = new Date(); 
        document.getElementById('relogio-widget').innerText = 
            d.getHours().toString().padStart(2,'0') + ":" + d.getMinutes().toString().padStart(2,'0'); 
    }, 1000);

    fetch('https://api.open-meteo.com/v1/forecast?latitude=-23.9518&longitude=-46.3391&current_weather=true')
        .then(res => res.json())
        .then(data => { document.getElementById('clima-widget').innerText = `🌡️ ${Math.round(data.current_weather.temperature)}°C`; })
        .catch(() => console.log("Erro clima."));

    // 2. Cronômetro
    const dataDoJogo = new Date('2026-09-10T18:30:00').getTime();
    setInterval(() => {
        const dist = dataDoJogo - new Date().getTime();
        if (dist > 0) {
            const d = Math.floor(dist / 86400000);
            const h = Math.floor((dist % 86400000) / 3600000);
            const m = Math.floor((dist % 3600000) / 60000);
            const s = Math.floor((dist % 60000) / 1000);
            document.getElementById('countdown').innerText = `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
        } else {
            document.getElementById('countdown').innerText = "A BOLA ESTÁ ROLANDO!";
        }
    }, 1000);

    // 3. Deep Links (Waze exato e WhatsApp com alerta de bloqueio)
    const latVila = -23.9518;
    const lngVila = -46.3391;
    
    document.getElementById('btnWaze').setAttribute('href', `https://www.waze.com/ul?ll=${latVila},${lngVila}&navigate=yes&zoom=17`);
    
    const textoWhatsApp = "Alerta de Mobilidade: Jogo na Vila Belmiro hoje! Fique atento aos bloqueios de trânsito nas ruas ao entorno do estádio (Princesa Isabel, Tiradentes e arredores).";
    document.getElementById('btnWhats').setAttribute('href', `https://wa.me/?text=${encodeURIComponent(textoWhatsApp)}`);

    // 4. Mapa - Centrado no Estádio
    const mapa = L.map('map', { scrollWheelZoom: false }).setView([latVila, lngVila], 17);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapa);
    
    // Marcador principal da Vila Belmiro
    L.circleMarker([latVila, lngVila], { radius: 12, fillColor: "#ffffff", color: "#C8A84B", weight: 3, fillOpacity: 1 })
     .addTo(mapa).bindPopup("<b>Vila Belmiro (Urbano Caldeira)</b><br>O Alçapão do Peixe").openPopup();

    let camadaAtual = L.layerGroup().addTo(mapa);
    const estiloPino = { radius: 8, fillColor: "#C8A84B", color: "#000000", weight: 2, fillOpacity: 0.9 };
    
    // 5. Dados Reais e Mapeados do Entorno Imediato da Vila Belmiro
    const dadosMapa = {
        'transporte': [
            { lat: -23.9511, lng: -46.3385, pop: 'Ponto de Ônibus - Av. Bernardino de Campos' },
            { lat: -23.9525, lng: -46.3401, pop: 'Ponto de Ônibus - Rua Princesa Isabel' }
        ],
        'comer': [
            { lat: -23.9518, lng: -46.3391, pop: 'Villa Santos Bar - Rua Princesa Isabel' },
            { lat: -23.9523, lng: -46.3378, pop: 'La Casa - Rua Carvalho de Mendonça' },
            { lat: -23.9507, lng: -46.3382, pop: 'Nakazumy Sushi - Av. Bernardino de Campos' }
        ],
        'estacionamento': [
            { lat: -23.9515, lng: -46.3388, pop: 'Madú Estacionamento - Rua Carvalho de Mendonça' },
            { lat: -23.9520, lng: -46.3383, pop: 'ElegantS Estacionamento - Rua Carvalho de Mendonça' },
            { lat: -23.9504, lng: -46.3395, pop: 'Estacionamento Rotativo - Entorno do Estádio' }
        ]
    };

    function plotarPontos(categoria) {
        camadaAtual.clearLayers();
        
        // Se a categoria for 'todos', unimos todas as chaves do objeto dadosMapa
        let categoriasParaPlotar = categoria === 'todos' ? Object.keys(dadosMapa) : [categoria];
        
        categoriasParaPlotar.forEach(cat => {
            if (dadosMapa[cat]) {
                dadosMapa[cat].forEach(ponto => {
                    L.circleMarker([ponto.lat, ponto.lng], estiloPino)
                     .addTo(camadaAtual)
                     .bindPopup(`<b>${ponto.pop}</b>`);
                });
            }
        });
    }

    // Inicia com todos os pontos reais desenhados no entorno da Vila
    plotarPontos('todos');

    // Manipulação dos Botões de Filtro
    const catButtons = document.querySelectorAll('.cat-btn');
    catButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            catButtons.forEach(b => b.classList.remove('active-cat'));
            e.target.classList.add('active-cat');
            
            const targetCategory = e.target.getAttribute('data-target');
            plotarPontos(targetCategory);
        });
    });
});