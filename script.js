async function loadBooks() {
  const res = await fetch("data.json");
  const books = await res.json();
  renderBooks(books);

  // Búsqueda
  document.getElementById("search").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    const filtered = books.filter(b =>
      Object.values(b).some(val =>
        val && val.toString().toLowerCase().includes(q)
      )
    );
    renderBooks(filtered);
  });
}

function renderBooks(list) {
  const container = document.getElementById("book-list");
  container.innerHTML = "";

  // Estadísticas
  const statsDiv = document.getElementById("stats");
  const total = list.length;
  const porEstado = {};
  list.forEach(b => {
    const estado = b.estado || "Sin estado";
    porEstado[estado] = (porEstado[estado] || 0) + 1;
  });
  let statsText = `Total: ${total}`;
  for (const [estado, count] of Object.entries(porEstado)) {
    statsText += ` | ${estado}: ${count}`;
  }
  statsDiv.textContent = statsText;

  // Renderizado de libros
  list.forEach(b => {
    const div = document.createElement("div");
    div.className = "book";
    div.innerHTML = `
      <div class="title">${b.titulo}</div>
      <div class="meta">
        Autor: ${b.autor || "Desconocido"}<br>
        Estado: ${b.estado || "Sin estado"}<br>
        Puntuación: ${b.puntuacion || "N/A"}<br>
        Comentario: ${b.comentario || ""}
      </div>
      <div class="progreso-container" style="margin-top:8px;">
        <div style="font-size:12px;">Progreso: ${b.progreso ?? 0}%</div>
        <div style="background:#eee; border-radius:4px; height:10px; width:100%; overflow:hidden;">
          <div style="background:#4caf50; height:100%; width:${b.progreso ?? 0}%;"></div>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

loadBooks();
