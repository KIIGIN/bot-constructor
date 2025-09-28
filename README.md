# Bot Constructor

Pet-проект конструктора простых Telegram ботов с визуальным редактором сценариев.

## Технологии

### Backend
- **FastAPI** - веб-фреймворк для API
- **SQLAlchemy** - ORM для работы с базой данных
- **PostgreSQL** - основная база данных
- **Redis** - кэширование и хранение состояний
- **MinIO** - объектное хранилище для файлов
- **Alembic** - миграции базы данных
- **Aiogram** - интеграция с Telegram API

### Frontend
- **React** - пользовательский интерфейс
- **React Flow** - визуальный редактор сценариев
- **Axios** - HTTP клиент

### Типы блоков сценариев
- **Сообщения** - отправка текста пользователю
- **Меню** - интерактивные кнопки
- **Ввод данных** - сбор информации от пользователя
- **Задержки** - паузы в сценарии

## Быстрый старт

### Предварительные требования
- Docker и Docker Compose

### Установка и запуск

1. Клонируйте и перейдите в репозиторий:
```bash
cd bot-constructor
```

2. Настройте переменные окружения:
```bash
cp .env.example .env
# Отредактируйте .env файл под ваши нужды
```

3. Запустите все сервисы:
```bash
docker-compose up -d
```

4. Примените миграции базы данных:
```bash
docker-compose exec backend alembic upgrade head
```

5. Откройте приложение:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Структура проекта

```
bot-constructor/
├── backend/                 # Backend приложение
│   ├── app/                # Основной код приложения
│   │   ├── auth/           # Аутентификация
│   │   ├── bots/           # Управление ботами
│   │   ├── scenarios/      # Сценарии ботов
│   │   ├── telegram/       # Telegram интеграция
│   │   ├── users/          # Пользователи
│   │   └── users_data/     # Данные пользователей
│   ├── alembic/            # Миграции БД
│   └── Dockerfile          # Docker образ backend
├── frontend/               # Frontend приложение
│   ├── src/                # Исходный код
│   │   ├── components/     # React компоненты
│   │   ├── pages/          # Страницы приложения
│   │   ├── contexts/       # React контексты
│   │   └── utils/          # Утилиты
│   ├── Dockerfile          # Docker образ frontend
│   └── nginx.conf          # Конфигурация Nginx
├── docker-compose.yml      # Оркестрация сервисов
├── .env                    # Переменные окружения
└── README.md              # Документация
```
