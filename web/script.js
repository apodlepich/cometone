const state = {
  movies: [],
  filtered: [],
  currentView: "catalog",
};

async function loadMovies(params = {}) {
  const container = document.getElementById("movies");
  container.innerHTML = "Загрузка...";

  const qs = new URLSearchParams(params).toString();
  const url = qs ? `/api/movies?${qs}` : "/api/movies";

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Ошибка загрузки");
    const movies = await res.json();

    state.movies = Array.isArray(movies) ? movies : [];
    state.filtered = state.movies;

    renderMovies();
  } catch (e) {
    container.textContent = "Ошибка: " + e.message;
  }
}

function renderMovies() {
  const container = document.getElementById("movies");
  if (!state.filtered.length) {
    container.textContent = "Нет фильмов по заданным фильтрам";
    return;
  }

  container.innerHTML = "";

  state.filtered.forEach((m) => {
    const card = document.createElement("article");
    card.className = "movie-card";

    card.addEventListener("click", () => openModal(m));

    const title = document.createElement("div");
    title.className = "movie-title";
    title.textContent = m.title;

    const meta = document.createElement("div");
    meta.className = "movie-meta";
    meta.textContent = `${m.year || "?"} · рейтинг ${m.rating ?? "-"}`;

    const genre = document.createElement("div");
    genre.className = "movie-genre";
    genre.textContent = m.genre || "Жанр не указан";

    const rating = document.createElement("div");
    rating.className = "movie-rating";
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = m.rating != null ? `★ ${m.rating}` : "Без оценки";
    rating.appendChild(chip);

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(genre);
    card.appendChild(rating);

    container.appendChild(card);
  });
}

function applyFilters() {
  const search = (document.getElementById("search") as HTMLInputElement).value.toLowerCase();
  const genre = (document.getElementById("genre") as HTMLSelectElement).value;
  const year = (document.getElementById("year") as HTMLInputElement).value;

  state.filtered = state.movies.filter((m: any) => {
    const matchesTitle = !search || m.title.toLowerCase().includes(search);
    const matchesGenre = !genre || m.genre === genre;
    const matchesYear = !year || m.year === Number(year);
    return matchesTitle && matchesGenre && matchesYear;
  });

  renderMovies();
}

function switchView(view) {
  state.currentView = view;
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("view--active"));
  document.getElementById(`view-${view}`).classList.add("view--active");

  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("nav-btn--active"));
  document
    .querySelector(`.nav-btn[data-view="${view}"]`)
    .classList.add("nav-btn--active");
}

function openModal(movie) {
  const modal = document.getElementById("modal");
  const body = document.getElementById("modal-body");

  modal.classList.add("modal--visible");
  modal.setAttribute("aria-hidden", "false");

  body.innerHTML = "";

  const title = document.createElement("h2");
  title.className = "modal-title";
  title.textContent = movie.title;

  const meta = document.createElement("div");
  meta.className = "modal-meta";
  meta.textContent = `${movie.year || "?"} · ${movie.genre || "Жанр не указан"}`;

  const overview = document.createElement("div");
  overview.className = "modal-body";

  const p = document.createElement("p");
  p.textContent = movie.overview || "Описание пока не добавлено.";

  overview.appendChild(p);

  body.appendChild(title);
  body.appendChild(meta);
  body.appendChild(overview);
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.classList.remove("modal--visible");
  modal.setAttribute("aria-hidden", "true");
}

document.addEventListener("DOMContentLoaded", () => {
  loadMovies();

  document.getElementById("filter-btn").addEventListener("click", () => applyFilters());

  document.getElementById("search").addEventListener("input", () => applyFilters());

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      switchView(view);
    });
  });

  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.querySelector(".modal-backdrop").addEventListener("click", closeModal);
});
