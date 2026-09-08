// ============================================
// animations.js – GSAP + ScrollTrigger
// ============================================

(function() {
    'use strict';

    // Aguarda o DOM estar pronto (disparado pelo app.js)
    document.addEventListener('domReadyForGSAP', function() {
        // Verifica se o GSAP e ScrollTrigger estão disponíveis
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('GSAP ou ScrollTrigger não carregados.');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        // 1. Animação do título: fade out e encolhe ao rolar
        gsap.utils.toArray('.giant-titles h1').forEach(title => {
            gsap.to(title, {
                opacity: 0,
                scale: 0.8,
                scrollTrigger: {
                    trigger: '.hero-fullscreen',
                    start: 'bottom bottom',
                    end: 'bottom top',
                    scrub: 1.5,
                    // markers: true // (descomente para debug)
                }
            });
        });

        // 2. Barra de controle: entra com fade e deslize
        gsap.from('.control-bar', {
            opacity: 0,
            y: 50,
            duration: 1,
            scrollTrigger: {
                trigger: '.control-bar',
                start: 'top bottom',
                end: 'top center',
                scrub: 1
            }
        });

        // 3. Filtros e Mapa: fade in ao rolar
        gsap.from('.category-nav', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            scrollTrigger: {
                trigger: '.category-nav',
                start: 'top bottom-=50',
                toggleActions: 'play none none none'
            }
        });

        gsap.from('.fullscreen-map', {
            opacity: 0,
            y: 40,
            duration: 1,
            scrollTrigger: {
                trigger: '.fullscreen-map',
                start: 'top bottom-=30',
                toggleActions: 'play none none none'
            }
        });

        // 4. Bento Grid: itens em cascata (stagger)
        gsap.from('.bento-item', {
            opacity: 0,
            y: 60,
            duration: 0.8,
            stagger: 0.15,
            scrollTrigger: {
                trigger: '.bento-grid',
                start: 'top bottom-=50',
                toggleActions: 'play none none none'
            }
        });

        // 5. Chatbot: animação sutil de entrada (quando aparece)
        gsap.from('#chatbot-container', {
            opacity: 0,
            scale: 0.9,
            duration: 0.6,
            delay: 1,
            ease: 'back.out(1.7)'
        });
    });

})();