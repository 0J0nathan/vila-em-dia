document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Data Atual
    function atualizarData() {
        const d = new Date();
        const dia = String(d.getDate()).padStart(2, '0');
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const ano = d.getFullYear();
        const dataEl = document.getElementById('data-widget');
        if (dataEl) dataEl.textContent = `${dia}/${mes}/${ano}`;
    }
    atualizarData();
    setInterval(atualizarData, 60000);

    // 2. Relógio e Clima
    setInterval(() => { 
        let d = new Date(); 
        const relogioEl = document.getElementById('relogio-widget');
        if (relogioEl) {
            relogioEl.innerText = 
                d.getHours().toString().padStart(2,'0') + ":" + d.getMinutes().toString().padStart(2,'0'); 
        }
    }, 1000);

    fetch('https://api.open-meteo.com/v1/forecast?latitude=-23.9518&longitude=-46.3391&current_weather=true')
        .then(res => res.json())
        .then(data => { 
            const climaEl = document.getElementById('clima-widget');
            if (climaEl) climaEl.innerText = `🌡️ ${Math.round(data.current_weather.temperature)}°C`; 
        })
        .catch(() => console.log("Erro clima."));

    // 3. Lógica do Próximo Jogo
    const jogos = [
        { data: '2026-11-18T19:30:00', timeA: 'Coritiba', timeB: 'Santos', local: 'Couto Pereira (Curitiba)', rodada: '35ª' },
        { data: '2026-11-23T21:00:00', timeA: 'Santos', timeB: 'Grêmio', local: 'MorumBIS (São Paulo)', rodada: '36ª' },
        { data: '2026-11-29T16:00:00', timeA: 'Vitória', timeB: 'Santos', local: 'Barradão (Salvador)', rodada: '37ª' },
        { data: '2026-12-02T21:30:00', timeA: 'Santos', timeB: 'Botafogo', local: 'Vila Belmiro (Santos)', rodada: '38ª' }
    ];

    function atualizarProximoJogo() {
        const agora = new Date().getTime();
        let proximoJogo = null;
        let menorDistancia = Infinity;

        jogos.forEach(jogo => {
            const dataJogo = new Date(jogo.data).getTime();
            const dist = dataJogo - agora;
            if (dist > 0 && dist < menorDistancia) {
                menorDistancia = dist;
                proximoJogo = jogo;
            }
        });

        const container = document.getElementById('conteudo-jogo');
        if (!container) return;

        if (proximoJogo) {
            const dataFormatada = new Date(proximoJogo.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const horaFormatada = new Date(proximoJogo.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            container.innerHTML = `
                <p style="font-size: 1.2rem; font-weight: 700; color: var(--text-light); margin-bottom: 10px;">
                    ${proximoJogo.timeA} x ${proximoJogo.timeB}
                </p>
                <p>📅 <strong>${dataFormatada}</strong> às <strong>${horaFormatada}</strong></p>
                <p>📍 ${proximoJogo.local}</p>
                <p>🏆 Rodada ${proximoJogo.rodada}</p>
            `;
        } else {
            container.innerHTML = '<p>Nenhum jogo futuro agendado no momento.</p>';
        }
    }

    atualizarProximoJogo();
    setInterval(atualizarProximoJogo, 60000);

    // 4. Navegação entre Abas
    const links = document.querySelectorAll('#menu-links > li > a[data-target]');
    const sections = document.querySelectorAll('.content-section');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('#menu-links a').forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            link.classList.add('active');
            const targetId = link.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            window.scrollTo({ top: 600, behavior: 'smooth' });
            if (targetId === 'comercio-aba') setTimeout(initMapComercio, 100);
        });
    });

    // 5. Mapa de Comércio
    const comerciosData = [
        { id: 1, nome: 'Restaurante Sabor da Vila', tipo: 'Restaurante', lat: -23.9525, lng: -46.3390, cor: '#FF3E7F' },
        { id: 2, nome: 'Chaveiro do Seu Antônio', tipo: 'Chaveiro', lat: -23.9518, lng: -46.3402, cor: '#29E7CD' },
        { id: 3, nome: 'Manicure da Ana', tipo: 'Manicure', lat: -23.9512, lng: -46.3385, cor: '#C8A84B' },
        { id: 4, nome: 'Bar do Carlinhos', tipo: 'Bar', lat: -23.9530, lng: -46.3375, cor: '#FF3E7F' },
        { id: 5, nome: 'Panificadora São Luiz', tipo: 'Padaria', lat: -23.9505, lng: -46.3410, cor: '#29E7CD' }
    ];

    let mapComercio;

    function initMapComercio() {
        if (mapComercio) return;

        mapComercio = L.map('map-comercio', { scrollWheelZoom: false }).setView([-23.9518, -46.3391], 16);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapComercio);

        const listaContainer = document.getElementById('lista-comercios-container');
        if (!listaContainer) return;
        listaContainer.innerHTML = '';

        comerciosData.forEach((comercio) => {
            const item = document.createElement('div');
            item.className = 'lista-item';
            item.innerHTML = `<h4>${comercio.nome}</h4><p>${comercio.tipo}</p>`;
            item.dataset.id = comercio.id;

            item.addEventListener('click', () => {
                document.querySelectorAll('.lista-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                if (mapComercio && mapComercio.eachLayer) {
                    mapComercio.eachLayer((layer) => {
                        if (layer instanceof L.CircleMarker) {
                            mapComercio.removeLayer(layer);
                        }
                    });
                }

                const marker = L.circleMarker([comercio.lat, comercio.lng], {
                    radius: 12,
                    fillColor: comercio.cor,
                    color: '#000',
                    weight: 3,
                    fillOpacity: 1
                }).addTo(mapComercio)
                  .bindPopup(`<b>${comercio.nome}</b><br>${comercio.tipo}`)
                  .openPopup();

                mapComercio.flyTo([comercio.lat, comercio.lng], 18, {
                    duration: 1.5
                });
            });

            listaContainer.appendChild(item);
        });
    }

    if(document.getElementById('comercio-aba').classList.contains('active')) {
        setTimeout(initMapComercio, 100);
    }
});