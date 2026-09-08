// ============================================
// app.js – Módulos: Clima, Relógio, Contagem, Mapa, Filtros, Lazy Load
// ============================================

(function() {
    'use strict';

    // ----- 1. RELÓGIO (atualiza a cada segundo) -----
    function initClock() {
        const relogio = document.getElementById('relogio-widget');
        if (!relogio) return;
        setInterval(() => {
            const d = new Date();
            const h = String(d.getHours()).padStart(2, '0');
            const m = String(d.getMinutes()).padStart(2, '0');
            relogio.textContent = `${h}:${m}`;
        }, 1000);
    }

    // ----- 2. CLIMA (com cache localStorage) -----
    async function fetchWeather() {
        const climaEl = document.getElementById('clima-widget');
        if (!climaEl) return;

        const CACHE_KEY = 'vila_weather';
        const CACHE_TIME_KEY = 'vila_weather_time';
        const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

        // Tenta ler do cache
        const cached = localStorage.getItem(CACHE_KEY);
        const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
        if (cached && cacheTime && (Date.now() - parseInt(cacheTime, 10) < CACHE_TTL)) {
            try {
                const data = JSON.parse(cached);
                climaEl.textContent = `🌡️ ${Math.round(data.current_weather.temperature)}°C`;
                return;
            } catch (e) { /* ignore */ }
        }

        // Busca da API
        try {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-23.9518&longitude=-46.3391&current_weather=true');
            if (!res.ok) throw new Error('Erro na API');
            const data = await res.json();
            const temp = Math.round(data.current_weather.temperature);
            climaEl.textContent = `🌡️ ${temp}°C`;
            // Salva no cache
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
            localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
        } catch (err) {
            console.warn('Erro ao buscar clima:', err);
            climaEl.textContent = '🌤️ --°C';
        }
    }

    // ----- 3. CONTAGEM REGRESSIVA (próximo jogo) -----
    function initCountdown() {
        const countdownEl = document.getElementById('countdown');
        if (!countdownEl) return;
        const dataDoJogo = new Date('2026-09-10T18:30:00').getTime();

        setInterval(() => {
            const agora = Date.now();
            const dist = dataDoJogo - agora;
            if (dist > 0) {
                const d = Math.floor(dist / 86400000);
                const h = Math.floor((dist % 86400000) / 3600000);
                const m = Math.floor((dist % 3600000) / 60000);
                const s = Math.floor((dist % 60000) / 1000);
                countdownEl.textContent =
                    `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
            } else {
                countdownEl.textContent = '⚽ A BOLA ESTÁ ROLANDO!';
            }
        }, 1000);
    }

    // ----- 4. DEEP LINKS (Waze e WhatsApp) -----
    function initDeepLinks() {
        const latVila = '-23.9518';
        const lngVila = '-46.3391';

        const btnWaze = document.getElementById('btnWaze');
        if (btnWaze) {
            btnWaze.href = `https://www.waze.com/ul?ll=${latVila},${lngVila}&navigate=yes&zoom=17`;
        }

        const btnWhats = document.getElementById('btnWhats');
        if (btnWhats) {
            const texto = 'Alerta de Mobilidade: Jogo na Vila Belmiro hoje! Fique atento aos bloqueios de trânsito nas ruas ao entorno do estádio (Princesa Isabel, Tiradentes e arredores).';
            btnWhats.href = `https://wa.me/?text=${encodeURIComponent(texto)}`;
        }
    }

    // ----- 5. MAPA (com Lazy Loading via IntersectionObserver) -----
    function initMap() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        // Dados dos pontos (reais)
        const dadosMapa = {
            transporte: [
                { lat: -23.9511, lng: -46.3398, pop: 'Ponto Princesa Isabel' },
                { lat: -23.9525, lng: -46.3385, pop: 'Ponto Tiradentes' }
            ],
            comer: [
                { lat: -23.9515, lng: -46.3400, pop: 'Padaria da Esquina' },
                { lat: -23.9522, lng: -46.3382, pop: 'Bar dos Torcedores' },
                { lat: -23.9508, lng: -46.3388, pop: 'Lanchonete Santista' }
            ],
            estacionamento: [
                { lat: -23.9512, lng: -46.3380, pop: 'Oficial D. Pedro I' },
                { lat: -23.9530, lng: -46.3395, pop: 'Vagas Rotativas (Tiradentes)' }
            ]
        };

        const latVila = -23.9518;
        const lngVila = -46.3391;

        // Criar mapa
        const mapa = L.map('map', { scrollWheelZoom: false }).setView([latVila, lngVila], 17);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(mapa);

        // Marcador principal (Vila Belmiro)
        L.circleMarker([latVila, lngVila], {
            radius: 12,
            fillColor: '#ffffff',
            color: '#C8A84B',
            weight: 3,
            fillOpacity: 1
        }).addTo(mapa)
          .bindPopup('<b>Vila Belmiro</b><br>O Alçapão')
          .openPopup();

        // Camada para os pontos dinâmicos
        let camadaAtual = L.layerGroup().addTo(mapa);
        const estiloPino = {
            radius: 8,
            fillColor: '#C8A84B',
            color: '#000000',
            weight: 2,
            fillOpacity: 0.9
        };

        function plotarPontos(categoria) {
            camadaAtual.clearLayers();
            const categorias = categoria === 'todos' ? ['transporte', 'comer', 'estacionamento'] : [categoria];
            categorias.forEach(cat => {
                if (dadosMapa[cat]) {
                    dadosMapa[cat].forEach(ponto => {
                        L.circleMarker([ponto.lat, ponto.lng], estiloPino)
                            .addTo(camadaAtual)
                            .bindPopup(`<b>${ponto.pop}</b>`);
                    });
                }
            });
        }

        // Inicializa com todos os pontos
        plotarPontos('todos');

        // Filtros
        const botoes = document.querySelectorAll('.cat-btn');
        botoes.forEach(btn => {
            btn.addEventListener('click', function(e) {
                botoes.forEach(b => {
                    b.classList.remove('active-cat');
                    b.setAttribute('aria-pressed', 'false');
                });
                this.classList.add('active-cat');
                this.setAttribute('aria-pressed', 'true');
                plotarPontos(this.dataset.target);
            });
        });

        // Ajustar o mapa quando a janela for redimensionada
        setTimeout(() => mapa.invalidateSize(), 200);
    }

    // Lazy Load do Mapa
    function lazyLoadMap() {
        const mapSection = document.querySelector('.fullscreen-map');
        if (!mapSection) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                // Verifica se a Leaflet já está carregada
                if (typeof L !== 'undefined') {
                    initMap();
                } else {
                    // Se não, espera o script carregar (fallback)
                    const checkLeaflet = setInterval(() => {
                        if (typeof L !== 'undefined') {
                            clearInterval(checkLeaflet);
                            initMap();
                        }
                    }, 200);
                }
                observer.disconnect();
            }
        }, { threshold: 0.1 });
        observer.observe(mapSection);
    }

    // ----- 6. INICIALIZAÇÃO GERAL -----
    document.addEventListener('DOMContentLoaded', function() {
        initClock();
        fetchWeather();
        initCountdown();
        initDeepLinks();
        lazyLoadMap(); // Mapa só carrega quando visível

        // Disparar evento para o GSAP (animations.js) saber que o DOM está pronto
        document.dispatchEvent(new Event('domReadyForGSAP'));
    });

})();