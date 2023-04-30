# Описание

Чат с рендерингом на сервере на сокетах с использование в качестве базы MongoDb, для фронта использовался pug. В чате есть авторизация, если пользователь нажимает выход, то выход совершается по сессии во всех клиентах.

Написан скрипт `npm run dev`, для запуска базы и приложения

**Стэк**: Node.js (18.16.0), express.js (4.16.1), socket.io (4.6.1) mongoose (7.0.3), nconf (0.12.0), winston (3.8.2), pug (3.0.2), bootstrap (5.3.0)

---

# Инструкции

Для разворачивания проекта:

1. Склонируйте его себе
2. Установите зависимости
3. Установите базу MongoDB
4. Приложение запускается на 3000 порту, подключение к базе на 27017. Если это не так вы можете изменить это в [настройках](/config/config.json)
5. Запускаете базу
6. Запускаете скрипт `npm run start`
7. Так же есть возможность запускать сразу базу и приложение с помощью скрипта `npm run dev`, для этого требуется установленный nodemon, basn и указать пути до mongod.exe и базы в файле mongoStart.sh
