# cometone

Простой сайт с каталогом фильмов на Go + PostgreSQL.

## Запуск backend

```bash
cd backend
export DATABASE_URL="postgres://user:pass@localhost:5432/movies?sslmode=disable"
go run ./...
```

Сервер поднимается на `http://localhost:8080`.

## Табыцы в PostgreSQL

```sql
CREATE TABLE movies (
    id     SERIAL PRIMARY KEY,
    title  TEXT NOT NULL,
    year   INT,
    rating NUMERIC(2,1)
);
```

Добавь несколько записей вручную, чтобы увидеть их на странице.

## Frontend

Статический HTML/JS лежит в папке `web/` и отдаётся из backend по адресу `http://localhost:8080`.
