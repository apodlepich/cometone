package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"

	_ "github.com/lib/pq"
)

type Movie struct {
	ID        int64   `json:"id"`
	Title     string  `json:"title"`
	Year      int     `json:"year"`
	Rating    float32 `json:"rating"`
	Genre     string  `json:"genre"`
	Overview  string  `json:"overview"`
	PosterURL string  `json:"poster_url"`
}

func openDB() (*sql.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return nil, ErrEnv
	}
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}
	return db, nil
}

var ErrEnv = &appError{msg: "DATABASE_URL is not set"}

type appError struct{ msg string }

func (e *appError) Error() string { return e.msg }

func main() {
	db, err := openDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("web"))))

	http.HandleFunc("/api/movies", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		genre := r.URL.Query().Get("genre")
		yearStr := r.URL.Query().Get("year")

		query := `SELECT id, title, year, rating, genre, overview, poster_url FROM movies`
		var args []any
		var where []string

		if genre != "" {
			where = append(where, "genre = $1")
			args = append(args, genre)
		}
		if yearStr != "" {
			if y, err := strconv.Atoi(yearStr); err == nil {
				where = append(where, "year = $2")
				args = append(args, y)
			}
		}

		if len(where) > 0 {
			query += " WHERE " + where[0]
			if len(where) == 2 {
				query += " AND " + where[1]
			}
		}

		query += " ORDER BY year DESC, rating DESC"

		rows, err := db.Query(query, args...)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var movies []Movie
		for rows.Next() {
			var m Movie
			if err := rows.Scan(&m.ID, &m.Title, &m.Year, &m.Rating, &m.Genre, &m.Overview, &m.PosterURL); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			movies = append(movies, m)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(movies)
	})

	log.Println("Listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
