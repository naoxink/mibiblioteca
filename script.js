// Variables globales para ordenación
let currentSort = { field: "titulo", asc: true };
let allBooks = [];

async function loadBooks() {
  const res = await fetch("data.json");
  allBooks = await res.json();
  renderBooks(allBooks);

  // Búsqueda
  document.getElementById("search").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    const filtered = allBooks.filter(b => {
      return (
        (b.titulo && b.titulo.toLowerCase().includes(q)) ||
        (b.autor && b.autor.toLowerCase().includes(q)) ||
        (b.estado && b.estado.toLowerCase().includes(q))
      );
    });
    renderBooks(filtered);
  });

  // Ordenación
  document.getElementById("sort-field").addEventListener("change", e => {
    currentSort.field = e.target.value;
    renderBooks(allBooks);
  });
  
  document.getElementById("sort-order").addEventListener("change", e => {
    currentSort.asc = e.target.value === "asc";
    renderBooks(allBooks);
  });
}

function renderBooks(list) {
  const container = document.getElementById("book-list");
  container.innerHTML = "";

  // Ordenar la lista
  const sorted = [...list].sort((a, b) => {
    let vA = a[currentSort.field] ?? "";
    let vB = b[currentSort.field] ?? "";
    
    if (["puntuacion", "progreso"].includes(currentSort.field)) {
      vA = Number(vA) || -1; // -1 si es inválido
      vB = Number(vB) || -1;
    } else {
      vA = vA.toString().toLowerCase();
      vB = vB.toString().toLowerCase();
    }
    
    if (vA < vB) return currentSort.asc ? -1 : 1;
    if (vA > vB) return currentSort.asc ? 1 : -1;
    return 0;
  });

  // Estadísticas
  const statsDiv = document.getElementById("stats");
  const total = sorted.length;
  const porEstado = {};
  sorted.forEach(b => {
    const estado = b.estado || "Sin estado";
    porEstado[estado] = (porEstado[estado] || 0) + 1;
  });
  
  let statsText = `Total: ${total}`;
  for (const [estado, count] of Object.entries(porEstado)) {
    statsText += ` | ${estado}: ${count}`;
  }
  statsDiv.textContent = statsText;

  // Renderizar los libros
  sorted.forEach(b => {
    const progreso = b.progreso ?? 0;
    let color;
    if (progreso === 0) {
      color = "lightgray";
    } else if (progreso < 30) {
      color = "tomato";
    } else if (progreso < 90) {
      color = "gold";
    } else {
      color = "#4caf50";
    }

    const div = document.createElement("div");
    div.className = "book";
    div.innerHTML = `
      <div class="title">${b.titulo}</div>
      <div class="meta">
        <div>Autor: ${b.autor || "Desconocido"}</div>
        <div>Estado: <span style="color:${color}">${b.estado || "Sin estado"}</span></div>
        <div>Puntuación: ${typeof b.puntuacion === "number" ? b.puntuacion + "/10" : "N/A"}</div>
        <div>Comentario: ${b.comentario || ""}</div>
        <div class="progreso-container">
          <div style="font-size: 14px;">Progreso: ${progreso}%</div>
          <div class="progreso-barra">
            <div class="progreso-barra-relleno" style="width:${progreso}%; background:${color};"></div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

loadBooks();
