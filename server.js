const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'remstroikapital.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

const serviceSeed = {
  flat: 6500,
  facade: 2900,
  roof: 3400,
  office: 5200
};

const categorySeed = {
  kitchens: {
    'Мебель для кухни': 22000,
    'Кухонные гарнитуры': 48000,
    'Бытовая техника для кухни': 32000,
    'Столешницы и панели': 12500,
    'Мойки и смесители': 7600,
    'Освещение на кухне': 5400
  },
  storage: {
    'Стеллажные системы': 13500,
    'Ёмкости для хранения': 3200,
    'Двери-купе': 16400,
    'Аксессуары для хранения': 2700,
    'Коробки и упаковка': 1800,
    'Комплектующие': 2600
  },
  decor: {
    'Обои': 2900,
    'Фотообои': 5100,
    'Зеркала': 6200,
    'Постеры': 1200,
    'Карнизы': 3400,
    'Декоративные панели': 8500
  },
  furniture: {
    'Шкафы': 26800,
    'Гардеробные системы': 31000,
    'Мягкая мебель': 38500,
    'Кровати': 21400,
    'Столы': 8700,
    'Стулья': 4300
  }
};

const defaultReviews = [
  { author:'Ирина К.', rating:5, text:'Сделали ремонт кухни аккуратно и в срок. Команда вежливая, смета понятная.' },
  { author:'Дмитрий А.', rating:5, text:'Заказывали фасадные работы. Всё подробно объяснили и держали связь на каждом этапе.' },
  { author:'Марина В.', rating:4, text:'Понравился калькулятор и удобная структура сайта. Отдельный плюс за аккуратную сдачу объекта.' }
];

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function initDb() {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service TEXT NOT NULL,
    message TEXT,
    form_name TEXT NOT NULL,
    form_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Новая',
    reply TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    author TEXT NOT NULL,
    rating INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS service_prices (
    service_key TEXT PRIMARY KEY,
    price INTEGER NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS category_prices (
    category_key TEXT NOT NULL,
    item_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    PRIMARY KEY(category_key, item_name)
  )`);

  const admin = await get(`SELECT id FROM users WHERE email = ?`, ['admin@remstroi.local']);
  if (!admin) {
    await run(
      `INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      ['Admin', 'admin@remstroi.local', 'Admin', hashPassword('adnim'), 'admin']
    );
  }

  for (const [serviceKey, price] of Object.entries(serviceSeed)) {
    await run(
      `INSERT OR IGNORE INTO service_prices (service_key, price) VALUES (?, ?)`,
      [serviceKey, price]
    );
  }

  for (const [categoryKey, items] of Object.entries(categorySeed)) {
    for (const [itemName, price] of Object.entries(items)) {
      await run(
        `INSERT OR IGNORE INTO category_prices (category_key, item_name, price) VALUES (?, ?, ?)`,
        [categoryKey, itemName, price]
      );
    }
  }

  const reviewsCount = await get(`SELECT COUNT(*) as count FROM reviews`);
  if (!reviewsCount || !reviewsCount.count) {
    for (const review of defaultReviews) {
      await run(
        `INSERT INTO reviews (author, rating, text) VALUES (?, ?, ?)`,
        [review.author, review.rating, review.text]
      );
    }
  }
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error:'Не все поля заполнены.' });
    }

    const existing = await get(`SELECT id FROM users WHERE email = ? OR phone = ?`, [email, phone]);
    if (existing) {
      return res.status(409).json({ error:'Пользователь с таким email или телефоном уже существует.' });
    }

    const result = await run(
      `INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'user')`,
      [name, email, phone, hashPassword(password)]
    );

    const user = await get(`SELECT id, name, email, phone, role FROM users WHERE id = ?`, [result.lastID]);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error:'Ошибка регистрации.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ error:'Введите логин и пароль.' });
    }

    const user = await get(
      `SELECT id, name, email, phone, role, password_hash FROM users WHERE email = ? OR phone = ?`,
      [login, login]
    );

    if (!user || user.password_hash !== hashPassword(password)) {
      return res.status(401).json({ error:'Неверный email/телефон или пароль.' });
    }

    delete user.password_hash;
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error:'Ошибка входа.' });
  }
});

app.get('/api/reviews', async (_req, res) => {
  try {
    const rows = await all(`SELECT id, author, rating, text, created_at FROM reviews ORDER BY id DESC`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error:'Не удалось загрузить отзывы.' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { userId, rating, text } = req.body;
    if (!userId || !rating || !text) {
      return res.status(400).json({ error:'Недостаточно данных для отзыва.' });
    }
    const user = await get(`SELECT name FROM users WHERE id = ?`, [userId]);
    if (!user) {
      return res.status(404).json({ error:'Пользователь не найден.' });
    }
    const result = await run(
      `INSERT INTO reviews (user_id, author, rating, text) VALUES (?, ?, ?, ?)`,
      [userId, user.name, rating, text]
    );
    const review = await get(`SELECT id, author, rating, text, created_at FROM reviews WHERE id = ?`, [result.lastID]);
    res.json(review);
  } catch (error) {
    res.status(500).json({ error:'Не удалось сохранить отзыв.' });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    await run(`DELETE FROM reviews WHERE id = ?`, [req.params.id]);
    res.json({ success:true });
  } catch (error) {
    res.status(500).json({ error:'Не удалось удалить отзыв.' });
  }
});

app.get('/api/requests', async (_req, res) => {
  try {
    const rows = await all(`
      SELECT r.id, r.user_id, r.service, r.message, r.form_name, r.form_phone, r.status, r.reply, r.created_at,
             u.name AS user_name, u.phone AS user_phone, u.email AS user_email
      FROM requests r
      JOIN users u ON u.id = r.user_id
      ORDER BY r.id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error:'Не удалось загрузить заявки.' });
  }
});

app.post('/api/requests', async (req, res) => {
  try {
    const { userId, service, message, formName, formPhone } = req.body;
    if (!userId || !service || !formName || !formPhone) {
      return res.status(400).json({ error:'Недостаточно данных для заявки.' });
    }
    const user = await get(`SELECT id FROM users WHERE id = ?`, [userId]);
    if (!user) {
      return res.status(404).json({ error:'Пользователь не найден.' });
    }
    const result = await run(
      `INSERT INTO requests (user_id, service, message, form_name, form_phone) VALUES (?, ?, ?, ?, ?)`,
      [userId, service, message || '', formName, formPhone]
    );
    const requestRow = await get(`SELECT * FROM requests WHERE id = ?`, [result.lastID]);
    res.json(requestRow);
  } catch (error) {
    res.status(500).json({ error:'Не удалось сохранить заявку.' });
  }
});

app.put('/api/requests/:id', async (req, res) => {
  try {
    const { status, reply } = req.body;
    await run(`UPDATE requests SET status = ?, reply = ? WHERE id = ?`, [status || 'Новая', reply || '', req.params.id]);
    res.json({ success:true });
  } catch (error) {
    res.status(500).json({ error:'Не удалось обновить заявку.' });
  }
});

app.delete('/api/requests/:id', async (req, res) => {
  try {
    await run(`DELETE FROM requests WHERE id = ?`, [req.params.id]);
    res.json({ success:true });
  } catch (error) {
    res.status(500).json({ error:'Не удалось удалить заявку.' });
  }
});

app.get('/api/prices', async (_req, res) => {
  try {
    const servicesRows = await all(`SELECT service_key, price FROM service_prices`);
    const categoriesRows = await all(`SELECT category_key, item_name, price FROM category_prices`);

    const services = {};
    const categories = {};

    for (const row of servicesRows) {
      services[row.service_key] = row.price;
    }

    for (const row of categoriesRows) {
      if (!categories[row.category_key]) categories[row.category_key] = {};
      categories[row.category_key][row.item_name] = row.price;
    }

    res.json({ services, categories });
  } catch (error) {
    res.status(500).json({ error:'Не удалось загрузить цены.' });
  }
});

app.put('/api/prices/services/:serviceKey', async (req, res) => {
  try {
    const { price } = req.body;
    await run(`UPDATE service_prices SET price = ? WHERE service_key = ?`, [price, req.params.serviceKey]);
    res.json({ success:true });
  } catch (error) {
    res.status(500).json({ error:'Не удалось обновить цену услуги.' });
  }
});

app.put('/api/prices/categories/:categoryKey', async (req, res) => {
  try {
    const { itemName, price } = req.body;
    await run(`UPDATE category_prices SET price = ? WHERE category_key = ? AND item_name = ?`, [price, req.params.categoryKey, itemName]);
    res.json({ success:true });
  } catch (error) {
    res.status(500).json({ error:'Не удалось обновить цену товара.' });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
      console.log('Admin login: admin@remstroi.local / adnim');
    });
  })
  .catch(error => {
    console.error('Database initialization error:', error);
    process.exit(1);
  });
