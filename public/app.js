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
    function lerJSON(id) {
        const el = document.getElementById(id);
        try { return el ? JSON.parse(el.textContent) : []; } catch (e) { return []; }
    }
    const jogos = lerJSON('dados-jogos').map(g => ({
        data: g.data_hora, timeA: g.mandante, timeB: g.visitante, local: g.local, rodada: g.rodada
    }));

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
    const ROTULOS = { comer: 'Comer e beber', estacionamento: 'Estacionamento', transporte: 'Transporte', turismo: 'Turismo' };
    const CORES = { comer: '#FF3E7F', estacionamento: '#29E7CD', transporte: '#C8A84B', turismo: '#FFFFFF' };
    const comerciosData = lerJSON('dados-locais').map(p => ({
        id: p.id, nome: p.nome, endereco: p.endereco || '', lat: p.latitude, lng: p.longitude,
        tipo: ROTULOS[p.categoria] || p.categoria, cor: CORES[p.categoria] || '#C8A84B'
    }));

    let mapComercio;

    function popupDe(c) {
        const box = document.createElement('div');
        const nome = document.createElement('b');
        nome.textContent = c.nome;
        box.append(nome, document.createElement('br'), document.createTextNode(c.endereco || c.tipo));
        return box;
    }

    function initMapComercio() {
        if (mapComercio) return;

        mapComercio = L.map('map-comercio', { scrollWheelZoom: false }).setView([-23.9518, -46.3391], 16);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapComercio);

        const listaContainer = document.getElementById('lista-comercios-container');
        if (!listaContainer) return;
        listaContainer.innerHTML = '';

        if (!comerciosData.length) {
            listaContainer.textContent = 'Nenhum local cadastrado.';
            return;
        }

        comerciosData.forEach((c) => {
            const marker = L.circleMarker([c.lat, c.lng], {
                radius: 10, fillColor: c.cor, color: '#000', weight: 2, fillOpacity: 1
            }).addTo(mapComercio).bindPopup(popupDe(c));

            const item = document.createElement('div');
            item.className = 'lista-item';
            item.tabIndex = 0;
            const h4 = document.createElement('h4'); h4.textContent = c.nome;
            const p = document.createElement('p'); p.textContent = c.tipo + (c.endereco ? ' · ' + c.endereco : '');
            item.append(h4, p);

            const abrir = () => {
                document.querySelectorAll('.lista-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                mapComercio.flyTo([c.lat, c.lng], 18, { duration: 1.2 });
                marker.openPopup();
            };
            item.addEventListener('click', abrir);
            item.addEventListener('keydown', (e) => { if (e.key === 'Enter') abrir(); });
            listaContainer.appendChild(item);
        });
    }

    if(document.getElementById('comercio-aba').classList.contains('active')) {
        setTimeout(initMapComercio, 100);
    }
});