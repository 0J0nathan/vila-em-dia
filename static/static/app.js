document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);

    // 1. Relógio e Clima
    const relogioEl = $('relogio-widget');
    if (relogioEl) {
        setInterval(() => {
            const d = new Date();
            relogioEl.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }, 1000);
    }
    const climaEl = $('clima-widget');
    if (climaEl) {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=-23.9518&longitude=-46.3391&current_weather=true')
            .then(res => res.json())
            .then(data => { climaEl.textContent = `🌤️ ${Math.round(data.current_weather.temperature)}°C`; })
            .catch(() => { climaEl.textContent = '--°C'; });
    }

    // 2. Cronômetro
    const countdownEl = $('countdown');
    if (countdownEl) {
        const dataDoJogo = new Date('2026-09-10T18:30:00').getTime();
        let ultimoTexto = '';
        setInterval(() => {
            const dist = dataDoJogo - Date.now();
            let texto;
            if (dist > 0) {
                const d = Math.floor(dist / 86400000);
                const h = Math.floor((dist % 86400000) / 3600000);
                const m = Math.floor((dist % 3600000) / 60000);
                texto = `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
            } else {
                texto = 'AO VIVO!';
            }
            if (texto !== ultimoTexto) { countdownEl.textContent = texto; ultimoTexto = texto; }
        }, 1000);
    }

    // 3. Deep Links
    const latVila = -23.9512, lngVila = -46.3388; // Estádio Urbano Caldeira
    const btnWaze = $('btnWaze');
    if (btnWaze) btnWaze.href = `https://www.waze.com/ul?ll=${latVila},${lngVila}&navigate=yes&zoom=17`;
    const btnWhats = $('btnWhats');
    if (btnWhats) btnWhats.href = `https://wa.me/?text=${encodeURIComponent('Alerta de Mobilidade: Jogo na Vila Belmiro hoje!')}`;

    // 3.5 CORRIGIDO: menu hambúrguer no mobile
    const navToggle = $('main-nav') && document.querySelector('.nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            const aberto = $('main-nav').classList.toggle('aberto');
            navToggle.setAttribute('aria-expanded', String(aberto));
        });
    }

    // 4. Mapa e Lista Dinâmica
    const mapEl = $('map');
    if (mapEl && typeof L !== 'undefined') {
        let mapa = null;
        let camadaAtual = null;

        // CORRIGIDO: lê os dados REAIS que o Flask injetou via <script id="dados-locais">
        // em vez do objeto fixo/inventado que existia antes.
        // Formato esperado (vindo de obter_locais() no app.py):
        //   [{ nome, categoria, latitude, longitude, endereco?, nota? }, ...]
        let locaisDoBanco = [];
        const tagDados = $('dados-locais');
        if (tagDados) {
            try { locaisDoBanco = JSON.parse(tagDados.textContent) || []; }
            catch (e) { console.error('Não consegui ler os dados do banco:', e); }
        }

        // Fallback: só é usado se o banco.db ainda estiver vazio (ex.: primeira execução).
        // Estes SÃO endereços reais coletados no entorno da Vila Belmiro — troque assim que
        // popular a tabela `comercios` (veja seed_banco.py).
        const dadosFallback = [
            { nome: 'Ponto de ônibus — Av. Sen. Pinheiro Machado, 425', categoria: 'transporte', latitude: -23.949927, longitude: -46.340430 },
            { nome: 'Vila Bar', categoria: 'comer', latitude: -23.951065, longitude: -46.340082, endereco: 'R. Princesa Isabel, 114' },
            { nome: 'Padaria Vila Belmiro', categoria: 'comer', latitude: -23.952428, longitude: -46.339132, endereco: 'R. Guararapes, 49' },
            { nome: 'Prol Park — Unidade Vila Belmiro', categoria: 'estacionamento', latitude: -23.949101, longitude: -46.333735, endereco: 'R. Joaquim Távora, 233' },
        ];

        const baseDados = locaisDoBanco.length ? locaisDoBanco : dadosFallback;

        // Agrupa dinamicamente por categoria (não depende mais de chaves fixas no código)
        const dadosMapa = {};
        baseDados.forEach(p => {
            const cat = p.categoria || 'outros';
            if (!dadosMapa[cat]) dadosMapa[cat] = [];
            dadosMapa[cat].push({
                lat: p.latitude, lng: p.longitude, pop: p.nome,
                end: p.endereco || '', cat: cat,
                link: `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`
            });
        });

        // CORRIGIDO: placeholder local em SVG, não depende de serviço externo
        const fotoPlaceholder = "data:image/svg+xml;utf8," + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="100"><rect width="150" height="100" fill="%23eee"/><text x="50%" y="50%" font-size="10" fill="%23999" text-anchor="middle" dy=".3em">sem foto</text></svg>'
        );

        function iniciarMapa() {
            if (mapa) return;
            mapa = L.map('map', { scrollWheelZoom: false }).setView([latVila, lngVila], 17);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapa);
            L.circleMarker([latVila, lngVila], { radius: 12, fillColor: '#ffffff', color: '#C8A84B', weight: 3, fillOpacity: 1 })
             .addTo(mapa).bindPopup('<b>Vila Belmiro</b>').openPopup();
            camadaAtual = L.layerGroup().addTo(mapa);
        }

        function normaliza(s){ return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }

        function coletarVisiveis(categoria, termo) {
            const categorias = (categoria === 'todos') ? Object.keys(dadosMapa) : [categoria];
            let pontos = [];
            categorias.forEach(cat => { if (dadosMapa[cat]) pontos = pontos.concat(dadosMapa[cat]); });
            if (termo) pontos = pontos.filter(p => normaliza(p.pop).includes(normaliza(termo)));
            return pontos;
        }

        function gerarListaHTML(pontos) {
            const listaDiv = $('lista-conteudo');
            listaDiv.innerHTML = '';
            pontos.forEach((ponto) => {
                const item = document.createElement('div');
                item.className = 'local-item';
                item.tabIndex = 0;
                item.setAttribute('role', 'button');
                item.innerHTML = `
                    <h4>${ponto.pop}</h4>
                    <p style="color:#888; font-size:0.8rem;">${ponto.end}</p>
                    <p style="color:var(--santos-gold-dark); font-size:0.7rem;">${ponto.cat}</p>
                `;
                const ir = () => mapa.setView([ponto.lat, ponto.lng], 18);
                item.addEventListener('click', ir);
                item.addEventListener('keydown', (e) => { if (e.key === 'Enter') ir(); });
                listaDiv.appendChild(item);
            });
            const contador = $('result-count');
            if (contador) contador.textContent = pontos.length
                ? `Mostrando ${pontos.length} ponto${pontos.length > 1 ? 's' : ''}`
                : 'Nenhum ponto encontrado para essa busca';
        }

        function plotarPontos(categoria, termo) {
            iniciarMapa();
            camadaAtual.clearLayers();
            const pontos = coletarVisiveis(categoria, termo || '');
            gerarListaHTML(pontos);

            pontos.forEach(ponto => {
                const popupHTML = `
                    <div style="text-align:center; font-family:Arial, sans-serif;">
                        <img src="${fotoPlaceholder}" style="width:100%; height:100px; object-fit:cover; border-radius:8px; margin-bottom:8px;" alt="${ponto.pop}">
                        <strong style="display:block; color:#000; margin-bottom:5px;">${ponto.pop}</strong>
                        <span style="font-size:0.8rem; color:#555;">${ponto.end}</span>
                        <br><br>
                        <a href="${ponto.link}" target="_blank" rel="noopener" style="background:#C8A84B; color:#000; padding:8px 15px; border-radius:5px; text-decoration:none; font-weight:bold; display:inline-block;">
                            🚗 Como Chegar
                        </a>
                    </div>
                `;
                L.circleMarker([ponto.lat, ponto.lng], { radius: 8, fillColor: "#C8A84B", color: "#000", weight: 2, fillOpacity: 0.9 })
                 .addTo(camadaAtual)
                 .bindPopup(popupHTML);
            });
        }

        let categoriaAtiva = 'todos';
        plotarPontos(categoriaAtiva, '');

        const catButtons = document.querySelectorAll('.cat-btn');
        catButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                catButtons.forEach(b => { b.classList.remove('active-cat'); b.setAttribute('aria-pressed', 'false'); });
                btn.classList.add('active-cat');
                btn.setAttribute('aria-pressed', 'true');
                categoriaAtiva = btn.dataset.target;
                plotarPontos(categoriaAtiva, $('busca') ? $('busca').value : '');
            });
        });

        // CORRIGIDO: busca de volta, com debounce (evita recalcular a cada tecla)
        const buscaInput = $('busca');
        if (buscaInput) {
            let debounceId;
            buscaInput.addEventListener('input', (e) => {
                clearTimeout(debounceId);
                const valor = e.target.value;
                debounceId = setTimeout(() => plotarPontos(categoriaAtiva, valor), 180);
            });
        }

        window.addEventListener('load', () => { if (mapa) mapa.invalidateSize(); });
    }
});
