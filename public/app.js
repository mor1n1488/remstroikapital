const API_BASE = '/api';

const categoryData = {
  kitchens:{title:'Кухни',icon:'🍽️',className:'kitchen',description:'Раздел включает товары и решения для обустройства кухни.',items:[{name:'Мебель для кухни',price:22000},{name:'Кухонные гарнитуры',price:48000},{name:'Бытовая техника для кухни',price:32000},{name:'Столешницы и панели',price:12500},{name:'Мойки и смесители',price:7600},{name:'Освещение на кухне',price:5400}]},
  storage:{title:'Хранение',icon:'📦',className:'storage',description:'Решения для систем хранения дома и мастерской.',items:[{name:'Стеллажные системы',price:13500},{name:'Ёмкости для хранения',price:3200},{name:'Двери-купе',price:16400},{name:'Аксессуары для хранения',price:2700},{name:'Коробки и упаковка',price:1800},{name:'Комплектующие',price:2600}]},
  decor:{title:'Декор',icon:'🪞',className:'decor',description:'Материалы и элементы оформления интерьера.',items:[{name:'Обои',price:2900},{name:'Фотообои',price:5100},{name:'Зеркала',price:6200},{name:'Постеры',price:1200},{name:'Карнизы',price:3400},{name:'Декоративные панели',price:8500}]},
  furniture:{title:'Мебель',icon:'🛋️',className:'furniture',description:'Категория мебели для дома и офиса.',items:[{name:'Шкафы',price:26800},{name:'Гардеробные системы',price:31000},{name:'Мягкая мебель',price:38500},{name:'Кровати',price:21400},{name:'Столы',price:8700},{name:'Стулья',price:4300}]}
};

const serviceData = {
  flat:{title:'Ремонт квартир',price:6500,unit:'м²',icon:'🧰',className:'repair',description:'Комплексный ремонт жилых помещений: от подготовки основания до финишной отделки и сдачи объекта.',steps:['Выезд на объект и первичный замер помещения.','Составление минимальной сметы и согласование этапов.','Подготовительные и демонтажные работы.','Черновая отделка, инженерная подготовка.','Чистовая отделка и финальная сдача.']},
  facade:{title:'Фасадные работы',price:2900,unit:'м²',icon:'🏢',className:'facade',description:'Фасадные решения для частных и коммерческих объектов.',steps:['Осмотр фасада и оценка состояния.','Подбор материалов и расчёт бюджета.','Подготовка поверхности и оснований.','Монтаж утеплителя и облицовки.','Проверка качества и сдача фасада.']},
  roof:{title:'Кровельные работы',price:3400,unit:'м²',icon:'🏠',className:'roof',description:'Монтаж, ремонт и обслуживание кровли.',steps:['Диагностика кровли и объёма работ.','Подбор материалов и расчёт площади.','Подготовка основания.','Монтаж кровельной системы.','Финальная проверка и сдача.']},
  office:{title:'Ремонт офисов',price:5200,unit:'м²',icon:'💼',className:'office',description:'Комплексное обновление коммерческих помещений.',steps:['Осмотр помещения и постановка задач.','Планирование этапов и расчёт стоимости.','Подготовка помещения и черновые работы.','Отделка рабочих и клиентских зон.','Передача готового помещения.']}
};

const faqData = [
  {q:'Сколько длится ремонт квартиры?',a:'Срок зависит от площади, сложности работ и выбранных материалов. После замера даём примерный календарный план.'},
  {q:'Можно ли заказать только часть работ?',a:'Да. Можно заказать отдельный этап: демонтаж, фасад, кровлю, чистовую отделку или комплектацию мебелью.'},
  {q:'Как формируется стоимость?',a:'На цену влияют площадь, тип работ, срочность и уровень материалов. Для предварительной оценки используйте калькулятор.'},
  {q:'Есть ли гарантия?',a:'Да, условия гарантии фиксируются в договоре после согласования проекта.'}
];

const defaultReviews = [
  {author:'Ирина К.',rating:5,text:'Сделали ремонт кухни аккуратно и в срок. Команда вежливая, смета понятная.'},
  {author:'Дмитрий А.',rating:5,text:'Заказывали фасадные работы. Всё подробно объяснили и держали связь на каждом этапе.'},
  {author:'Марина В.',rating:4,text:'Понравился калькулятор и удобная структура сайта. Отдельный плюс за аккуратную сдачу объекта.'}
];

const $ = id => document.getElementById(id);
const mainPage = $('mainPage');
const detailPage = $('detailPage');
const categoryPage = $('categoryPage');
const detailTitle = $('detailTitle');
const detailDescription = $('detailDescription');
const detailImage = $('detailImage');
const detailSteps = $('detailSteps');
const categoryTitle = $('categoryTitle');
const categoryDescription = $('categoryDescription');
const categoryImage = $('categoryImage');
const categoryGrid = $('categoryGrid');
const areaInput = $('areaInput');
const serviceNameInput = $('serviceNameInput');
const calcTotalEl = $('calcTotal');
const calcNote = $('calcNote');
const cartList = $('cartList');
const cartCount = $('cartCount');
const cartEmpty = $('cartEmpty');
const cartTotalEl = $('cartTotal');
const registerModal = $('registerModal');
const authSection = $('authSection');
const profileSection = $('profileSection');

let currentServiceKey = 'flat';
let cart = JSON.parse(localStorage.getItem('remstroi_cart') || '[]');
let currentUser = JSON.parse(localStorage.getItem('remstroi_session') || 'null');
let requests = [];
let reviews = [];

function formatPrice(v){ return new Intl.NumberFormat('ru-RU').format(v) + ' ₽'; }
function saveCart(){ localStorage.setItem('remstroi_cart', JSON.stringify(cart)); }
function saveSession(){ currentUser ? localStorage.setItem('remstroi_session', JSON.stringify(currentUser)) : localStorage.removeItem('remstroi_session'); }

function toast(text, type='info'){
  const t = document.createElement('div');
  t.textContent = text;
  const color = type === 'error' ? '#7f1d1d' : '#0f172a';
  t.style.cssText = `position:fixed;left:50%;bottom:88px;transform:translateX(-50%);background:${color};color:#fff;padding:12px 16px;border-radius:14px;box-shadow:0 20px 40px rgba(15,23,42,.22);z-index:3000`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка запроса');
  }
  return data;
}

function switchPage(page){
  mainPage.classList.remove('active');
  detailPage.classList.remove('active');
  categoryPage.classList.remove('active');
  page.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openMainPage(anchor){
  switchPage(mainPage);
  if(anchor){
    setTimeout(() => document.querySelector(anchor)?.scrollIntoView({ behavior:'smooth' }), 60);
  }
}

function openModal(){ registerModal.classList.add('show'); updateModalView(); }
function closeModal(){ registerModal.classList.remove('show'); }
function showRegister(){ authSection.classList.remove('hidden'); profileSection.classList.add('hidden'); $('registerForm').classList.remove('hidden'); $('loginForm').classList.add('hidden'); }
function showLogin(){ $('registerForm').classList.add('hidden'); $('loginForm').classList.remove('hidden'); authSection.classList.remove('hidden'); profileSection.classList.add('hidden'); }

function updateModalView(){
  if(currentUser){
    authSection.classList.add('hidden');
    profileSection.classList.remove('hidden');
    $('profileNameDisplay').textContent = currentUser.name;
    $('profileRoleDisplay').textContent = 'Роль: ' + (currentUser.role === 'admin' ? 'администратор' : 'пользователь');
  } else {
    authSection.classList.remove('hidden');
    profileSection.classList.add('hidden');
  }
}

function syncDisplayedPrices(){
  $('price-flat').textContent = 'от ' + formatPrice(serviceData.flat.price) + '/м²';
  $('price-facade').textContent = 'от ' + formatPrice(serviceData.facade.price) + '/м²';
  $('price-roof').textContent = 'от ' + formatPrice(serviceData.roof.price) + '/м²';
  $('price-office').textContent = 'от ' + formatPrice(serviceData.office.price) + '/м²';
}

function updateProfileUi(){
  $('profileStatus').textContent = currentUser ? `Вы вошли как ${currentUser.name} (${currentUser.role === 'admin' ? 'администратор' : 'пользователь'}).` : 'Для отправки заявки нужен зарегистрированный профиль.';
  $('adminPanelSection').classList.toggle('hidden', !(currentUser && currentUser.role === 'admin'));
  updateModalView();
  if(currentUser && currentUser.role === 'admin'){
    renderAdminRequests();
    renderAdminReviews();
    renderAdminPrices();
  }
}

function updateCalculator(){
  const s = serviceData[currentServiceKey];
  const area = Math.max(1, Number(areaInput.value) || 0);
  const total = area * s.price;
  calcTotalEl.textContent = formatPrice(total);
  calcNote.textContent = 'Расчёт выполнен по минимальной ставке ' + formatPrice(s.price) + ' за 1 ' + s.unit + '.';
}

function updateAdvancedCalculator(){
  const area = Math.max(1, Number($('advancedArea').value) || 0);
  const key = $('advancedService').value;
  const material = Number($('advancedMaterial').value || 1);
  const urgency = Number($('advancedUrgency').value || 1);
  const base = serviceData[key].price;
  const total = Math.round(area * base * material * urgency);
  $('advancedTotal').textContent = formatPrice(total);
  $('advancedNote').textContent = 'База: ' + formatPrice(base) + ' за м² · Материалы: ' + material + 'x · Срочность: ' + urgency + 'x';
}

function openServicePage(key){
  const s = serviceData[key];
  if(!s) return;
  currentServiceKey = key;
  detailTitle.textContent = s.title;
  detailDescription.textContent = s.description;
  detailImage.className = 'mock-img ' + s.className;
  detailImage.textContent = s.icon;
  serviceNameInput.value = s.title;
  detailSteps.innerHTML = s.steps.map((step, i) => `<div class="detail-step"><div class="detail-step-number">${i + 1}</div><div>${step}</div></div>`).join('');
  updateCalculator();
  switchPage(detailPage);
}

function openCategoryPage(key){
  const c = categoryData[key];
  if(!c) return;
  categoryTitle.textContent = c.title;
  categoryDescription.textContent = c.description;
  categoryImage.className = 'mock-img ' + c.className;
  categoryImage.textContent = c.icon;
  categoryGrid.innerHTML = c.items.map(item => `<button class="category-chip" type="button" data-name="${item.name}" data-price="${item.price}">${item.name} — ${formatPrice(item.price)}</button>`).join('');
  categoryGrid.querySelectorAll('.category-chip').forEach(btn => btn.addEventListener('click', () => addToCart(btn.dataset.name, btn.dataset.price)));
  switchPage(categoryPage);
}

function addToCart(name, price){
  const found = cart.find(i => i.name === name);
  if(found) found.qty = (found.qty || 1) + 1;
  else cart.push({ name, price: Number(price), qty: 1 });
  saveCart();
  renderCart();
  toast('Добавлено в корзину: ' + name);
}

function renderCart(){
  cartList.innerHTML = '';
  if(cart.length === 0){
    cartEmpty.style.display = 'block';
    cartTotalEl.textContent = '0 ₽';
    cartCount.textContent = '0';
    return;
  }
  cartEmpty.style.display = 'none';
  let total = 0;
  cart.forEach((item, index) => {
    total += Number(item.price || 0) * Number(item.qty || 1);
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `<div><strong>${item.name}</strong><div class="admin-meta">Цена: ${formatPrice(item.price)} · Кол-во: ${item.qty || 1}</div></div><div class="action-wrap"><button class="btn btn-ghost" data-action="minus" data-index="${index}">−</button><button class="btn btn-ghost" data-action="plus" data-index="${index}">+</button><button class="btn btn-danger" data-action="remove" data-index="${index}">Удалить</button></div>`;
    cartList.appendChild(li);
  });
  cartTotalEl.textContent = formatPrice(total);
  cartCount.textContent = String(cart.reduce((sum, i) => sum + (i.qty || 1), 0));
  cartList.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => {
    const index = Number(btn.dataset.index);
    if(btn.dataset.action === 'remove') cart.splice(index, 1);
    else if(btn.dataset.action === 'plus') cart[index].qty = (cart[index].qty || 1) + 1;
    else if(btn.dataset.action === 'minus') cart[index].qty = Math.max(1, (cart[index].qty || 1) - 1);
    saveCart();
    renderCart();
  }));
}

function renderFaq(){
  const list = $('faqList');
  list.innerHTML = faqData.map(item => `<div class="faq-item"><button class="faq-question" type="button"><span>${item.q}</span><span>+</span></button><div class="faq-answer">${item.a}</div></div>`).join('');
  list.querySelectorAll('.faq-question').forEach(btn => btn.addEventListener('click', () => btn.parentElement.classList.toggle('open')));
}

function renderReviews(){
  const grid = $('reviewsGrid');
  grid.innerHTML = reviews.map(item => `<article class="review-card fade-up"><div class="stars">${'★'.repeat(item.rating)}${'☆'.repeat(5-item.rating)}</div><strong>${item.author}</strong><p class="section-subtitle top-gap-xs">${item.text}</p></article>`).join('');
  initAnimations();
  if(currentUser && currentUser.role === 'admin') renderAdminReviews();
}

function renderAdminRequests(){
  const wrap = $('adminRequests');
  const empty = $('adminEmpty');
  wrap.innerHTML = '';
  if(!requests.length){ empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  requests.forEach((req, index) => {
    const block = document.createElement('div');
    block.className = 'card';
    block.innerHTML = `<div><strong>${req.service}</strong><div class="admin-meta">Пользователь: ${req.user_name} · ${req.user_phone} · ${req.user_email}</div><div class="admin-meta">Форма: ${req.form_name} · ${req.form_phone}</div><div class="admin-meta">Комментарий: ${req.message || 'не указан'}</div><div class="admin-meta">Статус: ${req.status}</div><div class="admin-meta">Ответ: ${req.reply || 'пока нет ответа'}</div></div><div class="top-gap-sm"><select data-status-index="${index}"><option value="Новая" ${req.status === 'Новая' ? 'selected' : ''}>Новая</option><option value="В работе" ${req.status === 'В работе' ? 'selected' : ''}>В работе</option><option value="Завершена" ${req.status === 'Завершена' ? 'selected' : ''}>Завершена</option></select><textarea class="top-gap-sm" data-reply-index="${index}" placeholder="Ответить на сообщение">${req.reply || ''}</textarea><div class="action-wrap top-gap-sm"><button class="btn btn-ghost" data-save-reply-index="${index}">Сохранить ответ</button><button class="btn btn-danger" data-delete-index="${index}">Удалить</button></div></div>`;
    wrap.appendChild(block);
  });

  wrap.querySelectorAll('[data-status-index]').forEach(el => el.addEventListener('change', async () => {
    try {
      const req = requests[Number(el.dataset.statusIndex)];
      await api(`/requests/${req.id}`, { method:'PUT', body: JSON.stringify({ status: el.value, reply: req.reply || '' }) });
      await loadRequests();
      toast('Статус обновлён');
    } catch (error) { toast(error.message, 'error'); }
  }));

  wrap.querySelectorAll('[data-save-reply-index]').forEach(btn => btn.addEventListener('click', async () => {
    try {
      const i = Number(btn.dataset.saveReplyIndex);
      const req = requests[i];
      const ta = wrap.querySelector(`[data-reply-index="${i}"]`);
      await api(`/requests/${req.id}`, { method:'PUT', body: JSON.stringify({ status: req.status, reply: ta.value.trim() }) });
      await loadRequests();
      toast('Ответ сохранён');
    } catch (error) { toast(error.message, 'error'); }
  }));

  wrap.querySelectorAll('[data-delete-index]').forEach(btn => btn.addEventListener('click', async () => {
    try {
      const req = requests[Number(btn.dataset.deleteIndex)];
      await api(`/requests/${req.id}`, { method:'DELETE' });
      await loadRequests();
      toast('Заявка удалена');
    } catch (error) { toast(error.message, 'error'); }
  }));
}

function renderAdminReviews(){
  const wrap = $('adminReviews');
  const empty = $('adminReviewsEmpty');
  wrap.innerHTML = '';
  if(!reviews.length){ empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  reviews.forEach((review, index) => {
    const block = document.createElement('div');
    block.className = 'card';
    block.innerHTML = `<strong>${review.author}</strong><div class="admin-meta">Оценка: ${review.rating}/5</div><div class="admin-meta">${review.text}</div><div class="top-gap-sm"><button class="btn btn-danger" data-delete-review-index="${index}">Удалить отзыв</button></div>`;
    wrap.appendChild(block);
  });
  wrap.querySelectorAll('[data-delete-review-index]').forEach(btn => btn.addEventListener('click', async () => {
    try {
      const review = reviews[Number(btn.dataset.deleteReviewIndex)];
      await api(`/reviews/${review.id}`, { method:'DELETE' });
      await loadReviews();
      toast('Отзыв удалён');
    } catch (error) { toast(error.message, 'error'); }
  }));
}

function renderAdminPrices(){
  const wrap = $('adminPrices');
  wrap.innerHTML = '';

  Object.entries(serviceData).forEach(([key, service]) => {
    const block = document.createElement('div');
    block.className = 'card';
    block.innerHTML = `<h4 class="card-title">${service.title}</h4><div class="admin-meta top-gap-xs">Цена за м²</div><div class="action-wrap top-gap-sm"><input class="price-input" type="number" value="${service.price}" data-price-service="${key}"><button class="btn btn-brand" data-save-service-price="${key}">Сохранить</button></div>`;
    wrap.appendChild(block);
  });

  Object.entries(categoryData).forEach(([cat, category]) => {
    const box = document.createElement('div');
    box.className = 'card';
    box.innerHTML = `<h4 class="card-title">${category.title}</h4><div class="grid">${category.items.map((item, idx) => `<div class="action-wrap"><span>${item.name}</span><input class="price-input" type="number" value="${item.price}" data-price-category="${cat}" data-price-item="${idx}"><button class="btn btn-brand" data-save-category-price="${cat}" data-save-item="${idx}">Сохранить</button></div>`).join('')}</div>`;
    wrap.appendChild(box);
  });

  wrap.querySelectorAll('[data-save-service-price]').forEach(btn => btn.addEventListener('click', async () => {
    try {
      const key = btn.dataset.saveServicePrice;
      const input = wrap.querySelector(`[data-price-service="${key}"]`);
      const price = Math.max(1, Number(input.value) || serviceData[key].price);
      await api(`/prices/services/${key}`, { method:'PUT', body: JSON.stringify({ price }) });
      serviceData[key].price = price;
      syncDisplayedPrices();
      updateCalculator();
      updateAdvancedCalculator();
      toast('Цена услуги обновлена');
    } catch (error) { toast(error.message, 'error'); }
  }));

  wrap.querySelectorAll('[data-save-category-price]').forEach(btn => btn.addEventListener('click', async () => {
    try {
      const cat = btn.dataset.saveCategoryPrice;
      const idx = Number(btn.dataset.saveItem);
      const input = wrap.querySelector(`[data-price-category="${cat}"][data-price-item="${idx}"]`);
      const item = categoryData[cat].items[idx];
      const price = Math.max(1, Number(input.value) || item.price);
      await api(`/prices/categories/${cat}`, { method:'PUT', body: JSON.stringify({ itemName: item.name, price }) });
      item.price = price;
      if(categoryTitle.textContent === categoryData[cat].title) openCategoryPage(cat);
      toast('Цена товара обновлена');
    } catch (error) { toast(error.message, 'error'); }
  }));
}

async function sendForm(e){
  e.preventDefault();
  const name = $('name').value.trim();
  const phone = $('phone').value.trim();
  const service = $('service').value.trim();
  const message = $('message').value.trim();

  if(!name || !phone || !service){
    toast('Пожалуйста, заполните обязательные поля.', 'error');
    return;
  }

  if(!currentUser){
    toast('Сначала зарегистрируйте профиль.', 'error');
    openModal();
    return;
  }

  try {
    await api('/requests', {
      method:'POST',
      body: JSON.stringify({
        service,
        message,
        formName:name,
        formPhone:phone,
        userId: currentUser.id
      })
    });
    await loadRequests();
    toast('Заявка отправлена и сохранена.');
    e.target.reset();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function sendCartRequest(){
  if(!cart.length){ toast('Корзина пока пустая.', 'error'); return; }
  if(!currentUser){ toast('Сначала зарегистрируйте профиль.', 'error'); openModal(); return; }

  const cartMessage = cart.map(item => `${item.name} × ${item.qty || 1} — ${formatPrice((item.price || 0) * (item.qty || 1))}`).join('; ');
  const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);

  try {
    await api('/requests', {
      method:'POST',
      body: JSON.stringify({
        service:'Заявка из корзины',
        message:`Состав корзины: ${cartMessage} | Итог: ${formatPrice(total)}`,
        formName: currentUser.name,
        formPhone: currentUser.phone,
        userId: currentUser.id
      })
    });
    await loadRequests();
    toast('Заявка из корзины отправлена администратору.');
    openMainPage('#request');
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function submitReview(e){
  e.preventDefault();
  const rating = Number($('reviewRating').value || 5);
  const text = $('reviewText').value.trim();
  if(!text){ toast('Напишите отзыв или вопрос.', 'error'); return; }
  if(!currentUser){ toast('Сначала зарегистрируйте профиль.', 'error'); openModal(); return; }

  try {
    await api('/reviews', { method:'POST', body: JSON.stringify({ userId: currentUser.id, rating, text }) });
    await loadReviews();
    e.target.reset();
    toast('Спасибо! Отзыв добавлен.');
  } catch (error) {
    toast(error.message, 'error');
  }
}

function initAnimations(){
  const nodes = document.querySelectorAll('.fade-up');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold:.12 });
  nodes.forEach(node => io.observe(node));
}

async function loadPrices(){
  const data = await api('/prices');
  Object.entries(data.services).forEach(([key, price]) => {
    if(serviceData[key]) serviceData[key].price = Number(price);
  });
  Object.entries(data.categories).forEach(([key, items]) => {
    if(categoryData[key]) {
      categoryData[key].items.forEach(item => {
        if(items[item.name] != null) item.price = Number(items[item.name]);
      });
    }
  });
}

async function loadReviews(){
  const data = await api('/reviews');
  reviews = data.length ? data : defaultReviews;
  renderReviews();
}

async function loadRequests(){
  requests = await api('/requests');
  if(currentUser && currentUser.role === 'admin') renderAdminRequests();
}

function toggleScrollTopButton(){
  if(window.scrollY > 320) $('scrollTopBtn').classList.add('show');
  else $('scrollTopBtn').classList.remove('show');
}

async function bootstrap(){
  try {
    await loadPrices();
    await loadReviews();
    await loadRequests();
    syncDisplayedPrices();
    renderFaq();
    renderCart();
    updateProfileUi();
    updateCalculator();
    updateAdvancedCalculator();
    showRegister();
    initAnimations();
  } catch (error) {
    toast('Ошибка инициализации: ' + error.message, 'error');
  }
}

document.querySelectorAll('.order-btn').forEach(button => button.addEventListener('click', () => openServicePage(button.dataset.service)));
document.querySelectorAll('.category-open-btn').forEach(button => button.addEventListener('click', () => openCategoryPage(button.dataset.category)));
$('backToMain').addEventListener('click', e => { e.preventDefault(); openMainPage('#catalog'); });
$('backToCategories').addEventListener('click', e => { e.preventDefault(); openMainPage('#productCatalog'); });
$('detailOrderBtn').addEventListener('click', () => {
  const service = serviceData[currentServiceKey];
  addToCart(service.title, service.price);
});
areaInput.addEventListener('input', updateCalculator);
$('advancedArea').addEventListener('input', updateAdvancedCalculator);
$('advancedService').addEventListener('change', updateAdvancedCalculator);
$('advancedMaterial').addEventListener('change', updateAdvancedCalculator);
$('advancedUrgency').addEventListener('change', updateAdvancedCalculator);
$('clearCartBtn').addEventListener('click', () => { cart = []; saveCart(); renderCart(); });
$('cartRequestBtn').addEventListener('click', sendCartRequest);
$('requestForm').addEventListener('submit', sendForm);
$('reviewForm').addEventListener('submit', submitReview);
$('openProfileBtn').addEventListener('click', openModal);
$('closeModalBtn').addEventListener('click', closeModal);
registerModal.addEventListener('click', e => { if(e.target === registerModal) closeModal(); });
$('showRegisterTab').addEventListener('click', showRegister);
$('showLoginTab').addEventListener('click', showLogin);

$('registerForm').addEventListener('submit', async e => {
  e.preventDefault();
  try {
    const data = await api('/auth/register', {
      method:'POST',
      body: JSON.stringify({
        name: $('registerName').value.trim(),
        email: $('registerEmail').value.trim(),
        phone: $('registerPhone').value.trim(),
        password: $('registerPassword').value.trim()
      })
    });
    currentUser = data.user;
    saveSession();
    updateProfileUi();
    toast('Профиль создан и сохранён в базе данных.');
    e.target.reset();
    closeModal();
  } catch (error) {
    toast(error.message, 'error');
  }
});

$('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  try {
    const data = await api('/auth/login', {
      method:'POST',
      body: JSON.stringify({
        login: $('loginValue').value.trim(),
        password: $('loginPassword').value.trim()
      })
    });
    currentUser = data.user;
    saveSession();
    updateProfileUi();
    toast('Вход выполнен.');
    e.target.reset();
    closeModal();
  } catch (error) {
    toast(error.message, 'error');
  }
});

$('logoutBtn').addEventListener('click', () => {
  currentUser = null;
  saveSession();
  updateProfileUi();
  showRegister();
  toast('Вы вышли из профиля.');
});

$('newRegisterBtn').addEventListener('click', () => {
  currentUser = null;
  saveSession();
  updateProfileUi();
  showRegister();
  toast('Можно создать новый профиль.');
});

$('scrollTopBtn').addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
window.addEventListener('scroll', toggleScrollTopButton);

bootstrap();
