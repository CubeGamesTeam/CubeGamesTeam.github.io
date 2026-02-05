// Ждём, пока загрузится HTML
document.addEventListener("DOMContentLoaded", function() {
    // Получаем все кнопки фильтров и карточки игр
    const filterButtons = document.querySelectorAll('.filter-btn');
    const gameCards = document.querySelectorAll('.game-card-detailed');

    // Добавляем обработчик событий для каждой кнопки фильтра
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем класс active у всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Добавляем класс active к нажатой кнопке
            this.classList.add('active');

            // Получаем выбранный фильтр
            const filterValue = this.getAttribute('data-filter');

            // Фильтруем карточки игр
            gameCards.forEach(card => {
                if (filterValue === 'all') {
                    // Показываем все игры
                    showCard(card);
                } else {
                    // Проверяем, содержит ли карточка нужную категорию
                    const categories = card.getAttribute('data-category');

                    if (categories && categories.includes(filterValue)) {
                        // Показываем подходящую карточку
                        showCard(card);
                    } else {
                        // Скрываем неподходящую карточку
                        hideCard(card);
                    }
                }
            });
        });
    });

    // Функция для показа карточки с анимацией
    function showCard(card) {
        card.style.display = 'grid';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        // Плавное появление
        setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 50);
    }

    // Функция для скрытия карточки с анимацией
    function hideCard(card) {
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateY(-10px)';

        // Полностью скрываем после анимации
        setTimeout(() => {
            card.style.display = 'none';
        }, 300);
    }

    // Добавляем эффекты при наведении на карточки игр
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });
    });

    // Плавная прокрутка к секции игр при клике на фильтр
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const gamesSection = document.querySelector('.all-games');
            if (gamesSection) {
                gamesSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});