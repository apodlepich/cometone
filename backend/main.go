package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"
)

type Movie struct {
	ID     int64   `json:"id"`
	Title  string  `json:"title"`
	Year   int     `json:"year"`
	Rating float32 `json:"rating"`
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

		rows, err := db.Query(`SELECT id, title, year, rating FROM movies ORDER BY year DESC`)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var movies []Movie
		for rows.Next() {
			var m Movie
			if err := rows.Scan(&m.ID, &m.Title, &m.Year, &m.Rating); err != nil {
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
