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

Требуются .NET 10 SDK, Node.js/npm и доступная база SQL Server.

1. Установите npm-зависимости клиента: `cd reactchat.client` и `npm install`.
2. Настройте строку подключения `ConnectionStrings:DefaultConnection` в конфигурации сервера или задайте переменную окружения `ConnectionStrings__DefaultConnection`.
3. Из корня репозитория запустите сервер: `dotnet run --project ReactChat.Server`.

В режиме разработки сервер запускает Vite через SPA Proxy. Миграции базы данных применяются при старте приложения.
