// Variables globales para ordenación
let currentSort = { field: "progreso", asc: true };
let allBooks = [];
let filteredBooks = []; // Aquí almacenaremos los libros filtrados

async function loadBooks() {
  const res = await fetch("data.json");
  allBooks = await res.json();
  filteredBooks = [...allBooks]; // Inicializamos filteredBooks con todos los libros
  renderBooks(filteredBooks); // Renderizamos los libros inicialmente

  // Crear dinámicamente las opciones del desplegable de estado
  const uniqueStates = [...new Set(allBooks.map(b => b.estado))];  // Obtener estados únicos
  const filterStateDropdown = document.getElementById("filter-state");

  uniqueStates.forEach(state => {
    const option = document.createElement("option");
    option.value = state;
    option.textContent = state || "Sin estado"; // Agregar la opción "Sin estado" si es necesario
    filterStateDropdown.appendChild(option);
  });

  // Búsqueda
  document.getElementById("search").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    filteredBooks = allBooks.filter(b => {
      return (
        (b.titulo && b.titulo.toLowerCase().includes(q)) ||
        (b.autor && b.autor.toLowerCase().includes(q)) ||
        (b.estado && b.estado.toLowerCase().includes(q))
      );
    });
    renderBooks(filteredBooks);
  });

  // Filtrado por estado
  filterStateDropdown.addEventListener("change", e => {
    const selectedState = e.target.value.toLowerCase();
    filteredBooks = allBooks.filter(b => {
      // Si no hay estado seleccionado, se muestran todos los libros
      return selectedState === "" || (b.estado && b.estado.toLowerCase() === selectedState);
    });
    renderBooks(filteredBooks);
  });

  // Ordenación
  document.getElementById("sort-field").addEventListener("change", e => {
    currentSort.field = e.target.value;
    renderBooks(filteredBooks);
  });

  document.getElementById("sort-order").addEventListener("change", e => {
    currentSort.asc = e.target.value === "asc";
    renderBooks(filteredBooks);
  });
}

function renderBooks(list) {
  const container = document.getElementById("book-list");
  container.innerHTML = `
    <div class="books-header">
      <div>Título</div>
      <div>Autor</div>
      <div>Puntuación</div>
      <div>Estado</div>
      <div>Progreso</div>
    </div>
  `; // Limpiar la lista actual

  // --- LÓGICA DE PROGRESO AUTOMÁTICO (Antes de ordenar) ---
  list.forEach(b => {
    if (b.paginas && b.paginaActual) {
      // Calcula el porcentaje y lo redondea para evitar decimales infinitos
      b.progreso = Math.round((b.paginaActual / b.paginas) * 100);
    } else if (!b.progreso) {
      b.progreso = 0;
    }
  });

  const field = currentSort.field;
  const order = currentSort.asc ? 1 : -1;

  // Ordenar la lista
  const sorted = [...list].sort((a, b) => {
    let vA = a[field] ?? "";
    let vB = b[field] ?? "";

    if (["puntuacion", "progreso"].includes(field)) {
      vA = Number(vA) || 0;
      vB = Number(vB) || 0;
    } else {
      vA = vA.toString().toLowerCase();
      vB = vB.toString().toLowerCase();
    }

    if (vA < vB) return order === 1 ? -1 : 1;
    if (vA > vB) return order === 1 ? 1 : -1;
    return 0;
  });

  // Renderizar los libros
  sorted.forEach(b => {
    const div = document.createElement("div");
    div.className = "book";

    if (b.estado === "En curso") div.classList.add("in-progress");

    // Crear la puntuación con estrellas llenas y vacías
    const filledStars = Math.floor(b.puntuacion || 0);
    const totalStars = 10;

    let stars = '';
    for (let i = 0; i < totalStars; i++) {
      if (i < filledStars) {
        stars += '<span class="filled">★</span>';
      } else {
        stars += '<span class="empty">☆</span>';
      }
    }

    let comentario = "";
    if (b.comentario) {
      comentario = `
        <span class="comentario-icon" title="${b.comentario}" tabindex="0" style="cursor:pointer;">
          💬
        </span>
      `;
    }

    let infoPaginas = "";
    if (b.paginas && b.paginaActual) {
      infoPaginas = `title="Página ${b.paginaActual} de ${b.paginas}"`;
    }

    div.innerHTML = `
        <div class="title" title="${b.titulo}">${b.titulo}</div>
        <div class="author" title="${b.autor || "Desconocido"}">${b.autor || "Desconocido"}</div>
        <div class="score" title="${b.puntuacion || 0}/10">
          <span class="puntuacion">${stars}</span>
        </div>
        <div class="status">${b.estado || "Sin estado"}
          ${comentario}</div>
        <div class="progress" ${infoPaginas} style="display: flex; align-items: center; gap: 10px; white-space: nowrap;">
          <span>Progreso: <strong style="color: #fbbf24;">${b.progreso}%</strong></span>
          <div class="progreso-container" style="width: 90px; margin-left: 0;">
            <div class="progreso-barra">
              <div class="progreso-barra-relleno" style="width:${b.progreso}%; background: #fbbf24;"></div>
            </div>
          </div>
        </div>
    `
    container.appendChild(div);
  });
}

async function showLastModified() {
  try {
    const res = await fetch("data.json", { method: "HEAD" });
    const lastModified = res.headers.get("Last-Modified");
    if (lastModified) {
      const date = new Date(lastModified);
      const formatted = date.toLocaleDateString();
      const infoDiv = document.createElement("div");
      infoDiv.id = "last-modified";
      infoDiv.textContent = `Última modificación: ${formatted}`;
      document.body.appendChild(infoDiv);
    }
  } catch (e) {
    // No mostrar nada si hay error
  }
}

showLastModified();

loadBooks();
