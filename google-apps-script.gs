const SHEET_NAME = "Registros";
const HEADERS = [
  "id", "createdAt", "date", "shift", "registeredBy",
  "socios", "sociosNuevos", "libre", "cartillaNueva",
  "cartillaRenovada", "notes",
];

function setup() {
  const sheet = getSheet_();
  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  return json_({ ok: true });
}

function doGet() {
  return json_({ ok: true, records: readRecords_() });
}

function doPost(event) {
  try {
    const request = JSON.parse(event.postData.contents || "{}");
    if (request.action === "save") return json_({ ok: true, records: saveRecords_(request.records || []) });
    if (request.action === "clear") return json_({ ok: true, records: saveRecords_([]) });
    return json_({ ok: false, error: "Acción no válida." });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function readRecords_() {
  const values = getSheet_().getDataRange().getValues();
  if (values.length <= 1) return [];
  return values.slice(1).filter((row) => row[0]).map((row) => {
    const record = {};
    HEADERS.forEach((header, index) => { record[header] = row[index]; });
    return record;
  });
}

function saveRecords_(records) {
  const sheet = getSheet_();
  sheet.clearContents();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  if (records.length) {
    const rows = records.map((record) => HEADERS.map((header) => record[header] ?? ""));
    sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
  }
  return records;
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}