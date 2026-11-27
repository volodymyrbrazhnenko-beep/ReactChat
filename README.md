Тестовое задание:
SPA-приложение: Комментарии

# Author

Бражненко Владимир

# Demo

http://reactchat.runasp.net

# GitHub

https://github.com/volodymyrbrazhnenko-beep/ReactChat

# ReactChat

Веб-приложение для чатов: просмотр и создание переписок, отправка сообщений и файлов, настройка иконки пользователя.

## Технологии

- Клиент: React, Vite
- Сервер: ASP.NET Core 10, REST API
- Данные: SQL Server, Entity Framework Core

Клиент обращается к серверу через HTTP API; SignalR не используется.

## Запуск

### Docker

Требуется Docker с поддержкой Docker Compose.

1. Скопируйте `.env.example` в `.env` и задайте `DB_SERVER_PASSWORD` (сильный пароль, соответствующий требованиям SQL Server). `DB_SERVER_LOGIN` должен быть `sa` для встроенного SQL Server в Compose.
2. Из корня репозитория запустите `docker compose up --build`.
3. Откройте приложение по адресу `http://localhost:8080`.

Compose запускает SQL Server и приложение, ожидает готовности базы данных и сохраняет данные в volume `sqlserver-data`. При старте приложения применяются миграции. По умолчанию Compose формирует `ConnectionStrings:DefaultConnection` из `DB_SERVER_LOGIN` и `DB_SERVER_PASSWORD`; при необходимости можно задать собственную строку подключения через эту переменную в `.env`.

### Локальный запуск

Требуются .NET 10 SDK, Node.js/npm и доступная база SQL Server.

1. Установите npm-зависимости клиента: `cd reactchat.client` и `npm install`.
2. Настройте `ConnectionStrings:DefaultConnection` в конфигурации сервера.
3. Из корня репозитория запустите сервер: `dotnet run --project ReactChat.Server`.

В режиме разработки сервер запускает Vite через SPA Proxy. Миграции базы данных применяются при старте приложения.
