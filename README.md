# cometone

Cometone — красивый учебный сайт-каталог фильмов.

## Backend

Go + PostgreSQL. Сервер читает строку подключения из `DATABASE_URL` и
отдаёт JSON по `/api/movies`.

```sql
CREATE TABLE movies (
    id         SERIAL PRIMARY KEY,
    title      TEXT        NOT NULL,
    year       INT,
    rating     NUMERIC(2,1),
    genre      TEXT,
    overview   TEXT,
    poster_url TEXT
);
```

## Frontend

Статический HTML/CSS/JS в папке `web/`.

- Сайдбар с названием проекта и навигацией
- Фильтры по названию, жанру и году
- Сетка карточек с акцентами
- Модальное окно с описанием фильма

Запуск:

```bash
cd backend
export DATABASE_URL="postgres://user:pass@localhost:5432/movies?sslmode=disable"
go run ./...
```

Открой `http://localhost:8080` в браузере.
