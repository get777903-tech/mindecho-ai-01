/**
 * ============================================================================
 * MindEcho AI — Google Apps Script for Google Sheets Logging Webhook
 * ============================================================================
 * ИНСТРУКЦИЯ ПО НАСТРОЙКЕ:
 * 1. Откройте вашу Google Таблицу.
 * 2. Перейдите в меню: Расширения (Extensions) -> Apps Script.
 * 3. Вставьте этот код вместо стандартного.
 * 4. Нажмите "Развернуть" (Deploy) -> "Новое развертывание" (New deployment).
 * 5. Выберите тип: "Веб-приложение" (Web app).
 * 6. Права доступа (Who has access): "Все" (Anyone).
 * 7. Скопируйте полученный URL и вставьте в константу GOOGLE_SHEETS_WEBHOOK_URL в app.js!
 * ============================================================================
 */

const MAX_ROWS_PER_SHEET = 100; // Автоматическое создание новой вкладки каждые 100 записей

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = getOrCreateActiveSheet(ss);

    // Parse JSON Payload from App
    const data = JSON.parse(e.postData.contents);

    // Prepare Row Data
    const row = [
      data.timestamp || new Date().toLocaleString(),
      data.event_type || 'Unknown',
      data.plan_name || 'N/A',
      data.price || 0,
      data.language || 'ru',
      data.billing_cycle || 'Monthly',
      data.phone || '',
      data.user_agent || ''
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Проверяет количество строк в текущей вкладке.
 * Если >= 100 строк — создаёт новый лист (например, "Логи 101-200") и добавляет шапку!
 */
function getOrCreateActiveSheet(ss) {
  const sheets = ss.getSheets();
  let currentSheet = sheets[sheets.length - 1]; // Берем последнюю активную вкладку

  // Если в текущем листе уже 100+ записей (включая шапку)
  if (currentSheet.getLastRow() >= (MAX_ROWS_PER_SHEET + 1)) {
    const batchNumber = sheets.length + 1;
    const newSheetName = `Логи (Партия ${batchNumber})`;
    currentSheet = ss.insertSheet(newSheetName);
    createHeaderRow(currentSheet);
  } else if (currentSheet.getLastRow() === 0) {
    createHeaderRow(currentSheet);
  }

  return currentSheet;
}

/**
 * Создает форматированную шапку таблицы
 */
function createHeaderRow(sheet) {
  const headers = [
    'Дата и Время', 
    'Тип События', 
    'Название Тарифа / Контекст', 
    'Цена ($)', 
    'Язык', 
    'Период (Мес/Год)', 
    'Телефон / Доп. Данные', 
    'Устройство (User Agent)'
  ];

  sheet.appendRow(headers);
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#2563EB');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
}
