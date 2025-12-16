// animations.js - Оптимизированные анимации

class SmoothAnimations {
    constructor() {
        this.observer = null;
        this.lastScrollY = 0;
        this.ticking = false;
        this.init();
    }
    
    init() {
        // Отложенная загрузка GSAP для производительности
        this.loadGSAP();
        
        // Инициализация анимаций при скролле
        this.initScrollAnimations();
        
        // Анимации при загрузке
        this.runInitialAnimations();
        
        // Оптимизированный параллакс
        this.initParallax();
    }
    
    loadGSAP() {
        // Загружаем GSAP только если нужно
        if (typeof gsap === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js';
            script.onload = () => {
                this.initGSAPAnimations();
            };
            document.head.appendChild(script);
        } else {
            this.initGSAPAnimations();
        }
    }
    
    initGSAPAnimations() {
        // Только базовые анимации для производительности
        gsap.config({
            force3D: true, // Используем GPU ускорение
        });
        
        // Плавный скролл для якорей
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href !== '#' && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        gsap.to(window, {
                            duration: 0.8,
                            scrollTo: {
                                y: target,
                                offsetY: 100
                            },
                            ease: "power2.out"
                        });
                    }
                }
            });
        });
    }
    
    initScrollAnimations() {
        // Используем Intersection Observer для оптимизации
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Добавляем небольшую задержку для ступенчатого появления
                    if (entry.target.classList.contains('service-card')) {
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, entry.target.dataset.delay || 0);
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Наблюдаем за элементами
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            this.observer.observe(el);
        });
    }
    
    runInitialAnimations() {
        // Простые CSS-анимации вместо тяжелых GSAP
        setTimeout(() => {
            const heroElements = document.querySelectorAll('.hero-content > *');
            heroElements.forEach((el, index) => {
                el.style.animationDelay = `${index * 0.3}s`;
                el.classList.add('animate-fadeInUp');
            });
        }, 300);
    }
    
    initParallax() {
        // Упрощенный параллакс для производительности
        const parallaxElements = document.querySelectorAll('.parallax-bg');
        
        if ('IntersectionObserver' in window) {
            const parallaxObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.startParallax(entry.target);
                    } else {
                        this.stopParallax(entry.target);
                    }
                });
            });
            
            parallaxElements.forEach(el => parallaxObserver.observe(el));
        }
    }
    
    startParallax(element) {
        const speed = parseFloat(element.dataset.speed) || 0.5;
        
        const onScroll = () => {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const yPos = -(scrolled * speed);
                    
                    // Используем transform3d для GPU-ускорения
                    element.style.transform = `translate3d(0, ${yPos}px, 0)`;
                    this.ticking = false;
                });
                this.ticking = true;
            }
        };
        
        element._onScroll = onScroll;
        window.addEventListener('scroll', onScroll, { passive: true });
    }
    
    stopParallax(element) {
        if (element._onScroll) {
            window.removeEventListener('scroll', element._onScroll);
        }
    }
    
    // Метод для анимации чисел (счетчики)
    animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Запускаем анимации после полной загрузки
    if (document.readyState === 'complete') {
        new SmoothAnimations();
    } else {
        window.addEventListener('load', () => {
            new SmoothAnimations();
        });
    }
});