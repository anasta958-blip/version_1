// cart.js - Управление корзиной (обновленная версия)

const CART_STORAGE_KEY = 'airtech_cart';

// ============ ОСНОВНЫЕ ФУНКЦИИ ============

// Инициализация корзины
window.initCart = function() {
    if (!localStorage.getItem(CART_STORAGE_KEY)) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
    }
    updateCartIcon();
    
    // Если мы на странице корзины, обновляем отображение
    if (window.location.pathname.includes('cart.html')) {
        updateCartPage();
    }
    
    // Настраиваем обработчики для кнопок добавления в корзину
    setupAddToCartButtons();
}

// Получить корзину из LocalStorage
window.getCart = function() {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
}

// Сохранить корзину в LocalStorage
window.saveCart = function(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

// Добавить товар в корзину
window.addToCart = function(product) {
    const cart = getCart();
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex > -1) {
        // Увеличиваем количество, если товар уже есть
        cart[existingItemIndex].quantity += 1;
    } else {
        // Добавляем новый товар
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart(cart);
    updateCartIcon();
    showNotification('Товар добавлен в корзину', 'success');
    
    // Если мы на странице корзины, обновляем её
    if (window.location.pathname.includes('cart.html')) {
        updateCartPage();
    }
    
    return cart;
}

// Удалить товар из корзины
window.removeFromCart = function(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    updateCartIcon();
    
    if (window.location.pathname.includes('cart.html')) {
        updateCartPage();
    }
    
    return cart;
}

// Изменить количество товара
window.updateQuantity = function(productId, newQuantity) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex > -1) {
        if (newQuantity < 1) {
            // Удаляем товар, если количество меньше 1
            cart.splice(itemIndex, 1);
        } else {
            cart[itemIndex].quantity = newQuantity;
        }
    }
    
    saveCart(cart);
    updateCartIcon();
    
    if (window.location.pathname.includes('cart.html')) {
        updateCartPage();
    }
    
    return cart;
}

// Очистить корзину
window.clearCart = function() {
    saveCart([]);
    updateCartIcon();
    
    if (window.location.pathname.includes('cart.html')) {
        updateCartPage();
    }
}

// Получить общее количество товаров
window.getTotalItems = function() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Получить общую стоимость
window.getTotalPrice = function() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// ============ ОТОБРАЖЕНИЕ ============

// Обновить иконку корзины в навигации
window.updateCartIcon = function() {
    const cartCount = document.getElementById('cart-count');
    const mobileCartCount = document.getElementById('mobile-cart-count');
    const totalItems = getTotalItems();
    
    [cartCount, mobileCartCount].forEach(element => {
        if (element) {
            if (totalItems > 0) {
                element.textContent = totalItems > 99 ? '99+' : totalItems;
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    });
}

// Обновить страницу корзины
window.updateCartPage = function() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartElement = document.getElementById('empty-cart');
    const totalItemsElement = document.getElementById('total-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalPriceElement = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-button');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        // Показываем сообщение "Корзина пуста"
        cartItemsContainer.innerHTML = '';
        if (emptyCartElement) emptyCartElement.classList.remove('hidden');
        if (totalItemsElement) totalItemsElement.textContent = '0 товаров';
        if (subtotalElement) subtotalElement.textContent = '0 ₽';
        if (totalPriceElement) totalPriceElement.textContent = '0 ₽';
        if (checkoutButton) checkoutButton.disabled = true;
        return;
    }
    
    // Скрываем сообщение "Корзина пуста"
    if (emptyCartElement) emptyCartElement.classList.add('hidden');
    
    // Обновляем количество товаров
    const totalItems = getTotalItems();
    if (totalItemsElement) {
        const word = getRussianWord(totalItems, ['товар', 'товара', 'товаров']);
        totalItemsElement.textContent = `${totalItems} ${word}`;
    }
    
    // Отображаем товары
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item bg-gray-50 rounded-xl p-4">
            <div class="flex items-center">
                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg mr-4">
                
                <div class="flex-1">
                    <h4 class="font-bold text-gray-900">${item.name}</h4>
                    <p class="text-gray-600 text-sm">${formatPrice(item.price)} ₽ за шт.</p>
                    
                    <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center">
                            <button onclick="decreaseQuantity('${item.id}')" class="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100">
                                <i class="fas fa-minus text-sm"></i>
                            </button>
                            <span class="mx-3 font-semibold">${item.quantity}</span>
                            <button onclick="increaseQuantity('${item.id}')" class="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100">
                                <i class="fas fa-plus text-sm"></i>
                            </button>
                        </div>
                        
                        <div class="text-right">
                            <p class="font-bold text-gray-900">${formatPrice(item.price * item.quantity)} ₽</p>
                            <button onclick="removeItem('${item.id}')" class="text-red-600 hover:text-red-800 text-sm mt-1">
                                <i class="fas fa-trash mr-1"></i>Удалить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Обновляем стоимость
    const subtotal = getTotalPrice();
    if (subtotalElement) subtotalElement.textContent = `${formatPrice(subtotal)} ₽`;
    
    // Обновляем общую стоимость
    updateTotalPrice();
    
    // Активируем кнопку оформления заказа
    if (checkoutButton) {
        checkoutButton.disabled = false;
    }
}

// ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

// Настроить обработчики для кнопок добавления в корзину
function setupAddToCartButtons() {
    // Находим все кнопки с классом add-to-cart-btn
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        // Удаляем старые обработчики
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Добавляем новый обработчик
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const product = {
                id: this.dataset.id,
                name: this.dataset.name,
                price: parseFloat(this.dataset.price),
                image: this.dataset.image
            };
            
            addToCart(product);
            
            // Анимация кнопки
            const originalHTML = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check mr-2"></i>Добавлено';
            this.classList.remove('bg-gradient-to-r', 'from-blue-600', 'to-purple-600');
            this.classList.add('bg-green-500');
            
            setTimeout(() => {
                this.innerHTML = originalHTML;
                this.classList.remove('bg-green-500');
                this.classList.add('bg-gradient-to-r', 'from-blue-600', 'to-purple-600');
            }, 2000);
        });
    });
}

// Обновить общую стоимость с учетом дополнительных услуг
function updateTotalPrice() {
    const subtotal = getTotalPrice();
    const servicesTotal = calculateServicesTotal();
    const deliveryCost = calculateDeliveryCost();
    const total = subtotal + servicesTotal + deliveryCost;
    
    const servicesTotalElement = document.getElementById('services-total');
    const deliveryCostElement = document.getElementById('delivery-cost');
    const totalPriceElement = document.getElementById('total-price');
    
    if (servicesTotalElement) servicesTotalElement.textContent = `${formatPrice(servicesTotal)} ₽`;
    if (deliveryCostElement) deliveryCostElement.textContent = `${formatPrice(deliveryCost)} ₽`;
    if (totalPriceElement) totalPriceElement.textContent = `${formatPrice(total)} ₽`;
}

// Рассчитать стоимость дополнительных услуг
function calculateServicesTotal() {
    let total = 0;
    
    const installationCheckbox = document.getElementById('installation');
    const warrantyCheckbox = document.getElementById('warranty');
    const deliveryCheckbox = document.getElementById('delivery');
    
    if (installationCheckbox && installationCheckbox.checked) total += 5000;
    if (warrantyCheckbox && warrantyCheckbox.checked) total += 3000;
    if (deliveryCheckbox && deliveryCheckbox.checked) total += 2500;
    
    return total;
}

// Рассчитать стоимость доставки
function calculateDeliveryCost() {
    const subtotal = getTotalPrice();
    // Бесплатная доставка при заказе от 50 000 ₽
    return subtotal > 50000 ? 0 : 2500;
}

// Функции для вызова из HTML
window.decreaseQuantity = function(productId) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    if (item) {
        updateQuantity(productId, item.quantity - 1);
    }
}

window.increaseQuantity = function(productId) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    if (item) {
        updateQuantity(productId, item.quantity + 1);
    }
}

window.removeItem = function(productId) {
    removeFromCart(productId);
}

// Вспомогательные функции
function formatPrice(price) {
    return price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function getRussianWord(number, words) {
    const cases = [2, 0, 1, 1, 1, 2];
    return words[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[Math.min(number % 10, 5)]];
}

function showNotification(message, type = 'success') {
    // Создаем уведомление, если его еще нет
    let notification = document.querySelector('.cart-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'cart-notification fixed top-6 right-6 px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        document.body.appendChild(notification);
    }
    
    notification.className = `cart-notification fixed top-6 right-6 px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        notification.style.transform = 'translateX(1000%)';
    }, 1500);
}

// ============ ИНИЦИАЛИЗАЦИЯ ============

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initCart();
});