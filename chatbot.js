// ============================================
// chatbot.js – Assistente virtual "Peixão da Vila"
// ============================================

(function() {
    'use strict';

    const toggleBtn = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const chatMessages = document.getElementById('chatbot-messages');
    const chatForm = document.getElementById('chatbot-form');
    const chatInput = document.getElementById('chatbot-input');

    let isOpen = false;

    // ----- CONTROLE DE ABERTURA/FECHAMENTO -----
    toggleBtn.addEventListener('click', function() {
        isOpen = !isOpen;
        chatWindow.hidden = !isOpen;
        this.setAttribute('aria-expanded', isOpen);
        if (isOpen) {
            chatInput.focus();
            // Se não houver mensagens, exibe uma saudação
            if (chatMessages.children.length === 0) {
                addMessage('bot', 'Olá, sou o Peixão da Vila! Pergunte-me sobre comércios, trânsito, história ou próximos jogos.');
            }
        }
    });

    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isOpen) {
            toggleBtn.click();
        }
    });

    // ----- FUNÇÃO PARA ADICIONAR MENSAGEM -----
    function addMessage(role, text) {
        const div = document.createElement('div');
        div.classList.add(role);
        div.textContent = text;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // ----- RESPOSTAS INTELIGENTES (MOCK) -----
    function getBotReply(userMessage) {
        const msg = userMessage.toLowerCase();

        // Regras simples (pode ser substituído por uma API real)
        if (msg.includes('pastel') || msg.includes('comer') || msg.includes('bar')) {
            return 'Recomendo o "Bar do Zé" na Rua Tiradentes – famoso pelo pastel de carne e cerveja gelada!';
        }
        if (msg.includes('estacionamento') || msg.includes('estacionar') || msg.includes('vaga')) {
            return 'Há estacionamento oficial na D. Pedro I e vagas rotativas na Tiradentes. Chegue cedo nos dias de jogo!';
        }
        if (msg.includes('trânsito') || msg.includes('movimento') || msg.includes('rua')) {
            return 'Atualmente o trânsito está intenso nas proximidades da Vila devido ao jogo de hoje. Evite a Princesa Isabel.';
        }
        if (msg.includes('história') || msg.includes('vila') || msg.includes('rei')) {
            return 'A Vila Belmiro é o estádio do Santos FC, inaugurado em 1916. Pelé brilhou aqui, por isso é chamada de "A Mística Vila do Rei".';
        }
        if (msg.includes('jogo') || msg.includes('próximo') || msg.includes('calendário')) {
            return 'Próximo jogo: 10/09 às 18:30 contra o Palmeiras. Não perca!';
        }
        if (msg.includes('clima') || msg.includes('tempo')) {
            return 'O clima está agradável, mas sempre bom verificar a previsão atualizada no topo da página.';
        }

        // Resposta padrão
        return 'Desculpe, não entendi. Posso ajudar com: comércio, estacionamento, trânsito, história, próximos jogos ou clima.';
    }

    // ----- ENVIO DA MENSAGEM -----
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage('user', text);
        chatInput.value = '';

        // Simula o processamento da IA (delay)
        const reply = getBotReply(text);
        setTimeout(() => {
            addMessage('bot', reply);
        }, 400 + Math.random() * 300);
    });

    // Permitir Enter no input (já feito pelo form)

})();