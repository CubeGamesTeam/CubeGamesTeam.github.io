// Ждём, пока загрузится HTML
document.addEventListener("DOMContentLoaded", function() {

    // === ГАЛЕРЕЯ СКРИНШОТОВ ===
    const mainImage = document.getElementById('main-image');
    const prevBtn = document.querySelector('.gallery-nav.prev');
    const nextBtn = document.querySelector('.gallery-nav.next');
    const thumbsContainer = document.querySelector('.screenshot-thumbnails');
    let currentIndex = 0;

    function getThumbnails() {
        return Array.from(document.querySelectorAll('.thumbnail img'));
    }

    function setActiveByIndex(index) {
        const thumbnails = getThumbnails();
        if (!thumbnails.length || !mainImage) return;
        currentIndex = (index + thumbnails.length) % thumbnails.length;
        const target = thumbnails[currentIndex];
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        if (target && target.parentElement) target.parentElement.classList.add('active');
        mainImage.style.opacity = '0.5';
        const newSrc = target.getAttribute('src');
        const newAlt = target.getAttribute('alt') || 'Скриншот';
        setTimeout(() => {
            mainImage.setAttribute('src', newSrc);
            mainImage.setAttribute('alt', newAlt);
            mainImage.style.opacity = '1';
        }, 120);
    }

    // Делегирование кликов по миниатюрам (работает и при асинхронной отрисовке)
    if (thumbsContainer) {
        thumbsContainer.addEventListener('click', (e) => {
            const img = e.target && e.target.closest('.thumbnail img');
            if (!img) return;
            const thumbnails = getThumbnails();
            const idx = thumbnails.indexOf(img);
            if (idx >= 0) setActiveByIndex(idx);
        });
    }

    // Стрелки навигации
    if (prevBtn) prevBtn.addEventListener('click', () => setActiveByIndex(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => setActiveByIndex(currentIndex + 1));

    // Инициализация текущего индекса по активной миниатюре, когда миниатюры будут готовы
    function initFromActiveThumb() {
        const thumbnails = getThumbnails();
        const initialActiveImg = document.querySelector('.thumbnail.active img');
        if (initialActiveImg && thumbnails.length) {
            currentIndex = Math.max(0, thumbnails.indexOf(initialActiveImg));
        } else if (thumbnails.length && !mainImage.getAttribute('src')) {
            // Если src ещё не задан, установим первый
            setActiveByIndex(0);
        }
    }

    // Попробовать инициализироваться сразу (на случай, если миниатюры уже на месте)
    initFromActiveThumb();

    // Реагируем на пользовательское событие, которое триггерится после отрисовки миниатюр
    window.addEventListener('thumbnailsReady', initFromActiveThumb);

    // === КНОПКА ВОСПРОИЗВЕДЕНИЯ ===
    // Убрали play-button: видео-триггер не используется в текущем дизайне

    // === КНОПКИ ПОЛЕЗНОСТИ В ОТЗЫВАХ ===
    const helpfulButtons = document.querySelectorAll('.helpful-btn');

    helpfulButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Получаем текущее количество лайков
            const text = this.textContent;
            const match = text.match(/\((\d+)\)/);

            if (match) {
                const currentCount = parseInt(match[1]);
                const newCount = currentCount + 1;

                // Обновляем текст кнопки
                this.textContent = `👍 Полезно (${newCount})`;

                // Добавляем эффект нажатия
                this.style.background = 'linear-gradient(45deg, #4ecdc4, #45b7b8)';
                this.style.color = 'white';
                this.style.transform = 'scale(0.95)';

                // Возвращаем обратно через короткое время
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);

                // Блокируем повторные нажатия
                this.disabled = true;
                this.style.cursor = 'default';
            }
        });
    });

    // === АНИМАЦИЯ ПРОГРЕСС-БАРОВ В РЕЙТИНГАХ ===
    function animateProgressBars() {
        const progressBars = document.querySelectorAll('.fill');

        progressBars.forEach(bar => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';

            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 500);
        });
    }

    // Запускаем анимацию прогресс-баров при прокрутке к отзывам
    const reviewsSection = document.querySelector('.player-reviews');
    if (reviewsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateProgressBars();
                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(reviewsSection);
    }

    // === ЭФФЕКТЫ ПРИ СКРОЛЛЕ ===
    const gameInfoSidebar = document.querySelector('.game-info-sidebar');

    // Параллакс-эффект отключён по требованию: блок не должен двигаться при скролле
    if (gameInfoSidebar) {
        gameInfoSidebar.style.transform = 'none';
    }
    // Удалён код, устанавливающий translateY на scroll

    // === КЛИКИ ПО ПОХОЖИМ ИГРАМ ===
    const similarGameCards = document.querySelectorAll('.similar-game-card');

    similarGameCards.forEach(card => {
        card.addEventListener('click', function() {
            const gameTitle = this.querySelector('h4').textContent;
            // В реальном проекте здесь будет переход на страницу игры
        });
    });

    // === ЭФФЕКТЫ ДЛЯ КНОПОК ПОКУПКИ ===
    const purchaseButtons = document.querySelectorAll('.purchase-buttons .btn');

    purchaseButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            // Эффект пульсации
            this.style.transform = 'scale(0.95)';

            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // === ПЛАВНАЯ ПРОКРУТКА К ЯКОРЯМ ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // === LAZY LOADING ДЛЯ ИЗОБРАЖЕНИЙ ===
    const imagePlaceholders = document.querySelectorAll('.screenshot-placeholder, .similar-game-image');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Добавляем класс для анимации появления
                entry.target.classList.add('loaded');
                imageObserver.unobserve(entry.target);
            }
        });
    });

    imagePlaceholders.forEach(placeholder => {
        imageObserver.observe(placeholder);
    });

    // === АНИМАЦИЯ СЧЕТЧИКА ОБЩЕГО РЕЙТИНГА В БЛОКЕ ОТЗЫВОВ ===
    function animateCounters() {
        const ratingNumber = document.querySelector('.player-reviews .rating-number');
        if (!ratingNumber) return;

        const targetValue = parseFloat(ratingNumber.textContent);
        if (isNaN(targetValue)) return;

        let currentValue = 0;
        const increment = targetValue / 50;

        const counter = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(counter);
            }
            ratingNumber.textContent = currentValue.toFixed(1);
        }, 30);
    }

    // Запускаем анимацию счетчиков при появлении секции отзывов
    if (reviewsSection) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    counterObserver.unobserve(entry.target);
                }
            });
        });

        counterObserver.observe(reviewsSection);
    }
});