# Lviv Grand Hotel - Система управління бронюванням

## Стек технологій
- **Фронтенд:** React 18 + Vite, Font Awesome 6
- **Бекенд:** Node.js + Express.js  
- **База даних:** MongoDB + Mongoose

## Запуск бекенду
```bash
cd backend
npm install
node seed.js        # заповнити базу тестовими даними
node server.js      # запустити сервер на порту 5000
```

## Запуск фронтенду (розробка)
```bash
npm install
npm run dev         # порт 5173
```

## Або відкрити готовий білд
Відкрити `frontend/index.html` або запустити:
```bash
npx serve frontend
```

## Функції
- Автентифікація користувачів
- Бронювання номерів
- Управління гостями
- Аналітика панелі інструментів

## Тестові облікові записи
- admin@lvivgrand.com / admin123
- manager@lvivgrand.com / manager123
