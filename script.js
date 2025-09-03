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
  container.innerHTML = ""; // Limpiar la lista actual

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

    if (!b.progreso) b.progreso = 0;

    // Crear la puntuación con estrellas llenas y vacías
    const filledStars = Math.floor(b.puntuacion);  // Número de estrellas llenas
    const totalStars = 10;  // Total de estrellas posibles

    let stars = '';
    for (let i = 0; i < totalStars; i++) {
      if (i < filledStars) {
        stars += '<span class="filled">★</span>';  // Estrella llena
      } else {
        stars += '<span class="empty">☆</span>';  // Estrella vacía
      }
    }

    div.innerHTML = `
      <div class="title">${b.titulo}</div>
      <div class="meta">
      <div>Autor: ${b.autor || "Desconocido"}</div>
        <div>Puntuación: <span class="puntuacion">${stars}</span></div>
        <div>Estado: ${b.estado || "Sin estado"}</div>
        <div>Progreso: ${b.progreso}%</div>
        <div class="progreso-container">
          <div class="progreso-barra">
            <div class="progreso-barra-relleno" style="width:${b.progreso}%; background:${b.progreso < 30 ? 'tomato' : b.progreso < 90 ? 'gold' : '#4caf50'};"></div>
          </div>
        </div>
      </div>
      <div class="comentario">${b.comentario || "No hay comentarios."}</div>
    `;
    container.appendChild(div);
  });
}

loadBooks();
