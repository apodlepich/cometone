async function loadMovies() {
  const container = document.getElementById("movies");
  container.innerHTML = "Загрузка...";

  try {
    const res = await fetch("/api/movies");
    if (!res.ok) throw new Error("Ошибка загрузки");
    const movies = await res.json();

    if (!Array.isArray(movies) || movies.length === 0) {
      container.textContent = "Нет фильмов в базе";
      return;
    }

    container.innerHTML = "";

    movies.forEach((m) => {
      const card = document.createElement("div");
      card.className = "movie-card";

      const title = document.createElement("div");
      title.className = "movie-title";
      title.textContent = `${m.title}`;

      const meta = document.createElement("div");
      meta.className = "movie-meta";
      meta.textContent = `${m.year || "?"} · рейтинг ${m.rating ?? "-"}`;

      card.appendChild(title);
      card.appendChild(meta);
      container.appendChild(card);
    });
  } catch (e) {
    container.textContent = "Ошибка: " + e.message;
  }
}

document.addEventListener("DOMContentLoaded", loadMovies);
