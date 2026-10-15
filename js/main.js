document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. СОСТОЯНИЕ КОРЗИНЫ (E-COMMERCE STATE)
  // ==========================================
  let cart = [];

  const cartBtn = document.getElementById('cartBtn');
  const cartBadge = document.getElementById('cartCountBadge');
  const cartModal = document.getElementById('cartModal');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartItemsContainer = document.getElementById('cartItems');
  const emptyCartNotice = document.getElementById('emptyCart');
  const cartSummary = document.getElementById('cartSummary');
  const cartTotalEl = document.getElementById('cartTotal');
  const clearCartBtn = document.getElementById('clearCartBtn');

  // Шаги оформления заказа в корзине
  const cartViewStep = document.getElementById('cartViewStep');
  const cartCheckoutStep = document.getElementById('cartCheckoutStep');
  const cartSuccessStep = document.getElementById('cartSuccessStep');
  const goToCheckoutBtn = document.getElementById('goToCheckoutBtn');
  const backToCartBtn = document.getElementById('backToCartBtn');
  const orderForm = document.getElementById('orderForm');
  const checkoutTotalDisplay = document.getElementById('checkoutTotalDisplay');
  const orderSuccessOkBtn = document.getElementById('orderSuccessOkBtn');
  const orderSuccessMessage = document.getElementById('orderSuccessMessage');

  // ==========================================
  // 2. МОДАЛКА БРОНИРОВАНИЯ СТОЛИКОВ
  // ==========================================
  const bookingModal = document.getElementById('bookingModal');
  const openBookingBtns = document.querySelectorAll('.open-booking-btn');
  const closeBookingBtn = document.getElementById('closeModalBtn');
  const bookingForm = document.getElementById('reservationForm');
  const formContainer = document.getElementById('modalFormContainer');
  const successNotice = document.getElementById('modalSuccess');
  const successOkBtn = document.getElementById('successOkBtn');
  const dateInput = document.getElementById('bookingDateTime');

  // ==========================================
  // 3. TOAST-УВЕДОМЛЕНИЯ
  // ==========================================
  const showToast = (title, subtitle) => {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toastContainer';
      toastContainer.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'flex items-center gap-3 bg-[#1f1a17] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/10 text-sm font-medium transform translate-y-6 opacity-0 transition-all duration-300 pointer-events-auto max-w-sm';

    // Создаём структуру с безопасным textContent
    toast.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-coffee-accent/20 text-coffee-accent flex items-center justify-center shrink-0">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <div class="leading-tight">
        <p class="font-bold text-white toast-title"></p>
        <p class="text-xs text-[#9ca3af] toast-subtitle"></p>
      </div>
    `;

    // Безопасно вставляем текст, исключая XSS
    toast.querySelector('.toast-title').textContent = title;
    toast.querySelector('.toast-subtitle').textContent = subtitle;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-6', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-6', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  };

  // ==========================================
  // 4. ЛОГИКА КОРЗИНЫ И ШАГОВ ОФОРМЛЕНИЯ
  // ==========================================
  const getCartTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const updateCartUI = () => {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (totalCount > 0) {
      cartBadge.textContent = totalCount;
      cartBadge.style.display = 'flex';
    } else {
      cartBadge.style.display = 'none';
    }

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '';
      emptyCartNotice.classList.remove('hidden');
      cartSummary.classList.add('hidden');
    } else {
      emptyCartNotice.classList.add('hidden');
      cartSummary.classList.remove('hidden');

      const total = getCartTotalPrice();

      cartItemsContainer.innerHTML = cart.map(item => `
        <div class="flex items-center justify-between gap-4 p-3 bg-coffee-cream/50 rounded-2xl border border-[#e8e1d7]/60">
          <div class="flex items-center gap-3 min-w-0">
            <img src="${item.img}" alt="${item.title}" class="w-12 h-12 object-cover rounded-xl shrink-0">
            <div class="truncate">
              <h4 class="font-bold text-sm text-coffee-dark truncate">${item.title}</h4>
              <p class="text-xs text-coffee-accent font-semibold">£${item.price.toFixed(2)}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" data-action="decrease" data-title="${item.title}" class="w-7 h-7 rounded-full bg-white border border-[#e8e1d7] flex items-center justify-center font-bold text-coffee-dark hover:bg-coffee-dark hover:text-white transition-colors cursor-pointer text-sm">−</button>
            <span class="text-sm font-bold text-[#1f1a17] w-5 text-center">${item.quantity}</span>
            <button type="button" data-action="increase" data-title="${item.title}" class="w-7 h-7 rounded-full bg-white border border-[#e8e1d7] flex items-center justify-center font-bold text-coffee-dark hover:bg-coffee-dark hover:text-white transition-colors cursor-pointer text-sm">+</button>
          </div>
        </div>
      `).join('');

      cartTotalEl.textContent = `£${total.toFixed(2)}`;
      checkoutTotalDisplay.textContent = `£${total.toFixed(2)}`;
    }
  };

  const addToCart = (title, price, img) => {
    const existing = cart.find(item => item.title === title);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ title, price, img, quantity: 1 });
    }
    updateCartUI();
    showToast(title, `Added to order (£${price.toFixed(2)})`);
  };

  // Слушатель клика на кнопки Quick Order (устойчив к переводчикам через dataset.price)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.quick-order-btn');
    if (!btn) return;

    e.preventDefault();
    const card = btn.closest('[data-category]');
    const title = card?.querySelector('h3')?.textContent.trim() || 'Menu Item';
    const priceEl = card?.querySelector('.text-coffee-accent');

    let price = 0;
    if (priceEl?.dataset.price) {
      price = parseFloat(priceEl.dataset.price);
    } else {
      const cleanPrice = (priceEl?.textContent || '0').replace(',', '.').replace(/[^0-9.]/g, '');
      price = parseFloat(cleanPrice) || 0;
    }

    const img = card?.querySelector('img')?.src || '';

    addToCart(title, price, img);
  });

  // Увеличение/уменьшение в корзине (+ / −)
  cartItemsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const title = btn.dataset.title;
    const action = btn.dataset.action;
    const item = cart.find(i => i.title === title);
    if (!item) return;

    if (action === 'increase') {
      item.quantity += 1;
    } else if (action === 'decrease') {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        cart = cart.filter(i => i.title !== title);
      }
    }
    updateCartUI();
  });

  // Сброс шагов корзины в начальное положение
  const resetCartSteps = () => {
    cartViewStep.classList.remove('hidden');
    cartCheckoutStep.classList.add('hidden');
    cartSuccessStep.classList.add('hidden');
    orderForm.reset();
  };

  // Открытие/закрытие модалки корзины
  cartBtn.addEventListener('click', () => {
    resetCartSteps();
    updateCartUI();
    cartModal.style.display = 'flex';
  });

  const closeCart = () => {
    cartModal.style.display = 'none';
    resetCartSteps();
  };

  closeCartBtn.addEventListener('click', closeCart);

  clearCartBtn.addEventListener('click', () => {
    cart = [];
    updateCartUI();
  });

  // Переход от списка корзины к вводу контактов
  goToCheckoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    cartViewStep.classList.add('hidden');
    cartCheckoutStep.classList.remove('hidden');
  });

  // Кнопка возврата «Back to Order»
  backToCartBtn.addEventListener('click', () => {
    cartCheckoutStep.classList.add('hidden');
    cartViewStep.classList.remove('hidden');
  });

  // Отправка формы с данными клиента
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(orderForm);
    const customerName = formData.get('customerName');
    const customerPhone = formData.get('customerPhone');
    const orderType = formData.get('orderType');
    const total = getCartTotalPrice().toFixed(2);

    // Персонализированное сообщение об успехе
    orderSuccessMessage.textContent = `Thank you, ${customerName}! Your ${orderType} order for £${total} has been received (Demo Mode).`;
    cartCheckoutStep.classList.add('hidden');
    cartSuccessStep.classList.remove('hidden');

    // Очищаем саму корзину
    cart = [];
    updateCartUI();
  });

  orderSuccessOkBtn.addEventListener('click', closeCart);

  // ==========================================
  // 5. ЛОГИКА БРОНИРОВАНИЯ СТОЛИКОВ
  // ==========================================
  const setMinDateTime = () => {
    const now = new Date();
    const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    dateInput.min = localISO;
  };

  const validateWorkingHours = () => {
    if (!dateInput.value) return;

    const selectedDate = new Date(dateInput.value);
    const day = selectedDate.getDay();
    const timeInMinutes = selectedDate.getHours() * 60 + selectedDate.getMinutes();

    let openMinutes = 0;
    let closeMinutes = 0;
    let scheduleNotice = '';

    if (day === 0) {
      openMinutes = 9 * 60;
      closeMinutes = 17 * 60;
      scheduleNotice = 'Sunday (09:00 – 17:00)';
    } else if (day === 6) {
      openMinutes = 8 * 60 + 30;
      closeMinutes = 19 * 60;
      scheduleNotice = 'Saturday (08:30 – 19:00)';
    } else {
      openMinutes = 7 * 60 + 30;
      closeMinutes = 18 * 60;
      scheduleNotice = 'Mon – Fri (07:30 – 18:00)';
    }

    if (timeInMinutes < openMinutes || timeInMinutes > closeMinutes) {
      dateInput.setCustomValidity(`We're closed at this time. Our hours for this day: ${scheduleNotice}.`);
    } else {
      dateInput.setCustomValidity('');
    }
  };

  const openBooking = () => {
    formContainer.style.display = 'block';
    successNotice.style.display = 'none';
    bookingModal.style.display = 'flex';
    setMinDateTime();
  };

  const closeBooking = () => {
    bookingModal.style.display = 'none';
    bookingForm.reset();
    dateInput.setCustomValidity('');
  };

  openBookingBtns.forEach(btn => btn.addEventListener('click', openBooking));
  closeBookingBtn.addEventListener('click', closeBooking);
  successOkBtn.addEventListener('click', closeBooking);

  dateInput.addEventListener('input', validateWorkingHours);
  dateInput.addEventListener('change', validateWorkingHours);

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    validateWorkingHours();

    if (!bookingForm.checkValidity()) {
      bookingForm.reportValidity();
      return;
    }

    formContainer.style.display = 'none';
    successNotice.style.display = 'block';
    bookingForm.reset();
  });

  // Закрытие при клике по фону
  window.addEventListener('click', (e) => {
    if (e.target === bookingModal) closeBooking();
    if (e.target === cartModal) closeCart();
  });

  // ==========================================
  // 6. ТАБЫ ФИЛЬТРАЦИИ МЕНЮ
  // ==========================================
  const filterBtns = document.querySelectorAll('.menu-filter-btn');
  const menuCards = document.querySelectorAll('[data-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedFilter = btn.dataset.filter;

      filterBtns.forEach(b => {
        b.classList.remove('bg-coffee-dark', 'text-white', 'shadow-sm');
        b.classList.add('bg-coffee-cream', 'border', 'border-[#e8e1d7]', 'text-[#6b635b]');
      });

      btn.classList.add('bg-coffee-dark', 'text-white', 'shadow-sm');
      btn.classList.remove('bg-coffee-cream', 'border', 'border-[#e8e1d7]', 'text-[#6b635b]');

      menuCards.forEach(card => {
        const category = card.dataset.category;
        if (selectedFilter === 'all' || category === selectedFilter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
});