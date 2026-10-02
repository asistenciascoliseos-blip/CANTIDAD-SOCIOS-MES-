const STORAGE_KEY = "registro-atencion";
const LEGACY_STORAGE_KEY = "registro-atencion-2026";
const categories = [
  ["socios", "Socios"],
  ["sociosNuevos", "Socios nuevos"],
  ["libre", "Libre"],
  ["cartillaNueva", "Cartilla nueva"],
  ["cartillaRenovada", "Cartilla renovada"],
];
const gyms = ["Ferrero", "Chacarilla", "Montjoy", "San Ignacio"];

const form = document.querySelector("#recordForm");
const recordsBody = document.querySelector("#recordsBody");
const emptyState = document.querySelector("#emptyState");
const filterMonth = document.querySelector("#filterMonth");
const dateInput = document.querySelector("#date");
const toast = document.querySelector("#toast");
let records = loadRecords();
let editingId = null;

dateInput.value = new Date().toISOString().slice(0, 10);

function loadRecords() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const legacyStored = localStorage.getItem(LEGACY_STORAGE_KEY);
    const saved = JSON.parse(stored || legacyStored || "[]");
    if (!stored && legacyStored) localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    if (!Array.isArray(saved)) return [];
    const unique = new Map();
    saved.forEach((record) => {
      const normalized = normalizeRecord(record);
      if (normalized.date && normalized.shift) unique.set(recordKey(normalized), normalized);
    });
    return [...unique.values()];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  render();
}

function normalizeRecord(record) {
  const legacyGym = gyms.find((gym) => gym.toLowerCase() === String(record.gym || record.notes || "").trim().toLowerCase());
  return {
    ...record,
    id: String(record.id),
    date: String(record.date).slice(0, 10),
    gym: legacyGym || "",
    notes: String(record.notes || ""),
    createdAt: String(record.createdAt || new Date().toISOString()),
    socios: Number(record.socios || 0),
    sociosNuevos: Number(record.sociosNuevos || 0),
    libre: Number(record.libre || 0),
    cartillaNueva: Number(record.cartillaNueva || 0),
    cartillaRenovada: Number(record.cartillaRenovada || 0),
  };
}

function recordKey(record) {
  return `${record.date}|${record.shift}|${record.gym || ""}`;
}

function totalOf(record) {
  return categories.reduce((sum, [key]) => sum + Number(record[key] || 0), 0);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function render() {
  const month = filterMonth.value;
  const visibleRecords = records
    .filter((record) => month === "all" || record.date.slice(5, 7) === month)
    .sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`));

  recordsBody.innerHTML = visibleRecords.map((record) => `
    <tr>
      <td>${formatDate(record.date)}</td>
      <td><span class="shift-pill">${escapeHtml(record.shift)}</span></td>
      <td>${escapeHtml(record.gym || "—")}</td>
      <td>${escapeHtml(record.registeredBy || "—")}</td>
      ${categories.map(([key]) => `<td>${record[key]}</td>`).join("")}
      <td><strong>${totalOf(record)}</strong></td>
      <td class="row-actions">
        <button class="edit-row" type="button" data-id="${record.id}" aria-label="Editar registro">Editar</button>
        <button class="delete-row" type="button" data-id="${record.id}" aria-label="Eliminar registro">×</button>
      </td>
    </tr>
  `).join("");

  emptyState.hidden = visibleRecords.length > 0;
  document.querySelector("#recordCount").textContent = records.length;
  document.querySelector("#totalCount").textContent = records.reduce((sum, record) => sum + totalOf(record), 0);
  const last = [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  document.querySelector("#lastRecord").textContent = last ? formatDate(last.date) : "—";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[character]));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const date = data.get("date");
  const shift = data.get("shift");
  const gym = data.get("gym");
  const existing = records.find((item) => item.date === date && item.shift === shift
    && item.gym === gym && item.id !== editingId);
  const record = {
    id: editingId || (existing && existing.id) || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
    createdAt: editingId ? records.find((item) => item.id === editingId).createdAt : (existing && existing.createdAt) || new Date().toISOString(),
    date,
    shift,
    gym,
    registeredBy: data.get("registeredBy").trim(),
    notes: data.get("notes").trim(),
  };
  categories.forEach(([key]) => { record[key] = Math.max(0, Number(data.get(key) || 0)); });
  if (editingId || existing) {
    records = records.map((item) => item.id === record.id ? record : item);
  } else {
    records.push(record);
  }
  const savedShift = record.shift;
  const savedDate = record.date;
  editingId = null;
  persist();
  form.reset();
  updateEditMode();
  showToast(`Turno ${savedShift} (${formatDate(savedDate)}) exitoso.`);
});

recordsBody.addEventListener("click", (event) => {
  const editButton = event.target.closest(".edit-row");
  if (editButton) {
    const record = records.find((item) => item.id === editButton.dataset.id);
    if (!record) return;
    editingId = record.id;
    form.elements.date.value = record.date;
    form.elements.shift.value = record.shift;
    form.elements.gym.value = record.gym || "";
    form.elements.registeredBy.value = record.registeredBy || "";
    form.elements.notes.value = record.notes || "";
    categories.forEach(([key]) => { form.elements[key].value = record[key] || ""; });
    updateEditMode();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const button = event.target.closest(".delete-row");
  if (!button) return;
  records = records.filter((record) => record.id !== button.dataset.id);
  persist();
  showToast("Registro eliminado.");
});

function updateEditMode() {
  const editing = Boolean(editingId);
  document.querySelector("#submitButton").innerHTML = editing
    ? "<span aria-hidden=\"true\">✓</span> Actualizar registro"
    : "<span aria-hidden=\"true\">＋</span> Guardar registro";
  document.querySelector("#cancelEdit").hidden = !editing;
  document.querySelector("#clearForm").hidden = editing;
}

document.querySelector("#cancelEdit").addEventListener("click", () => {
  editingId = null;
  form.reset();
  dateInput.value = new Date().toISOString().slice(0, 10);
  updateEditMode();
});

categories.forEach(([key]) => {
  form.elements[key].addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/^0+(?=\d)/, "");
  });
});

form.addEventListener("reset", () => {
  window.setTimeout(() => {
    dateInput.value = new Date().toISOString().slice(0, 10);
    editingId = null;
    updateEditMode();
  }, 0);
});

filterMonth.addEventListener("change", render);

document.querySelector("#clearAll").addEventListener("click", () => {
  records = [];
  Object.keys(localStorage)
    .filter((key) => key.startsWith("registro-atencion"))
    .forEach((key) => localStorage.removeItem(key));
  localStorage.setItem(STORAGE_KEY, "[]");
  render();
  showToast("Todos los registros fueron eliminados de este dispositivo.");
});

function download(filename, content, type) {
  if (!records.length) {
    showToast("Primero guarda al menos un registro.");
    return;
  }
  const link = document.createElement("a");
  const dataUrl = `data:${type},${encodeURIComponent(content)}`;
  link.href = dataUrl;
  link.download = filename;
  link.rel = "noopener";
  link.className = "download-fallback";
  link.textContent = `Toca aquí si no se descargó: ${filename}`;
  link.setAttribute("aria-label", `Descargar ${filename}`);
  document.body.appendChild(link);
  link.click();
  showToast(`Archivo listo: ${filename}`);
  window.setTimeout(() => link.remove(), 120000);
}

function csvValue(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

document.querySelector("#downloadCsv").addEventListener("click", () => {
  const header = ["Fecha", "Turno", "Gimnasio", "Registró", ...categories.map(([, label]) => label), "Total", "Observaciones"];
  const rows = records.map((record) => [
    record.date, record.shift, record.gym, record.registeredBy, ...categories.map(([key]) => record[key]),
    totalOf(record), record.notes,
  ]);
  const table = [header, ...rows].map((row, rowIndex) => `
    <tr>${row.map((value) => `<${rowIndex === 0 ? "th" : "td"}>${escapeHtml(value ?? "")}</${rowIndex === 0 ? "th" : "td"}>`).join("")}</tr>
  `).join("");
  const excelHtml = `<!doctype html>
    <html><head><meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #172b35; }
        table { border-collapse: collapse; min-width: 1100px; }
        th { background: #0f766e; color: #ffffff; font-weight: bold; text-align: center; }
        th, td { border: 1px solid #cbdad8; padding: 8px 10px; white-space: nowrap; }
        td { text-align: left; }
        tr:nth-child(even) td { background: #f1f8f6; }
        td:nth-child(1), td:nth-child(5), td:nth-child(6), td:nth-child(7),
        td:nth-child(8), td:nth-child(9), td:nth-child(10) { text-align: center; }
        td:nth-child(10) { font-weight: bold; color: #075e59; }
      </style>
    </head><body><table>${table}</table></body></html>`;
  download("registros-atencion.xls", excelHtml, "application/vnd.ms-excel;charset=utf-8");
});

document.querySelector("#downloadJson").addEventListener("click", () => {
  download("registros-atencion.json", JSON.stringify(records, null, 2), "application/json");
});

document.querySelector("#downloadTxt").addEventListener("click", () => {
  const text = records.map((record, index) => [
    `REGISTRO ${index + 1}`,
    `Fecha: ${record.date}`, `Turno: ${record.shift}`, `Gimnasio: ${record.gym || "—"}`,
    `Registró: ${record.registeredBy || "—"}`,
    ...categories.map(([key, label]) => `${label}: ${record[key]}`),
    `Total: ${totalOf(record)}`, `Observaciones: ${record.notes || "—"}`, "",
  ].join("\n")).join("\n");
  download("registros-atencion.txt", text || "No hay registros.", "text/plain;charset=utf-8");
});

document.querySelector("#importJson").addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported) || imported.some((record) => !record.date || !record.shift)) throw new Error();
      records = imported;
      persist();
      showToast("Copia importada correctamente.");
    } catch {
      showToast("El archivo no tiene un formato válido.");
    }
    event.target.value = "";
  };
  reader.readAsText(file);
});

render();
