// ============================================================
// MindEcho_NDA.gs — Google Apps Script Backend
// NDA Signature App — MindEcho AI
// ============================================================

const TEMPLATE_DOC_ID   = '1KPnbaWF-gPXDBlXNfImr4BPTVUHj9pbXJQPmYUPHm7Y';
const NEXT_DOC_URL       = 'https://docs.google.com/document/d/15ZGpk381gG30U1GciKvGXhSg_6rN1sye2FsVVmrjgMU/edit?usp=sharing';
const ADMIN_EMAIL        = Session.getActiveUser().getEmail(); // ваш email — получит копию каждой подписи

function doGet(e) {
  const tpl = HtmlService.createTemplateFromFile('SignaturePage');
  tpl.nextDocUrl = NEXT_DOC_URL;
  return tpl.evaluate()
    .setTitle('MindEcho AI — NDA / Non-Disclosure Agreement')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Основная функция: принимает данные формы + Base64 подписи,
 * создаёт PDF-копию NDA с подписью и сохраняет на Google Диске.
 */
function processSignature(payload) {
  try {
    const fullName       = payload.fullName.trim();
    const email          = payload.email.trim();
    const signatureB64   = payload.signatureBase64;

    if (!fullName || !email || !signatureB64) {
      return { success: false, error: 'Заполните все обязательные поля.' };
    }

    // Дата / время / уникальный ID
    const dateNow      = new Date();
    const tsFormatted  = Utilities.formatDate(dateNow, 'GMT+3', 'dd.MM.yyyy HH:mm:ss');
    const tsShort      = Utilities.formatDate(dateNow, 'GMT+3', 'dd.MM.yyyy_HH-mm');
    const uuid         = Utilities.getUuid();

    // 1. Копируем шаблон NDA
    const tplFile  = DriveApp.getFileById(TEMPLATE_DOC_ID);
    const copyName = `NDA_${fullName.replace(/\s+/g, '_')}_${tsShort}`;
    const docFile  = tplFile.makeCopy(copyName);
    const doc      = DocumentApp.openById(docFile.getId());
    const body     = doc.getBody();

    // 2. Заменяем метки (если есть в шаблоне)
    body.replaceText('{{FULL_NAME}}', fullName);
    body.replaceText('{{EMAIL}}',     email);
    body.replaceText('{{DATE}}',      tsFormatted);
    body.replaceText('{{SIGN_ID}}',   uuid);

    // 3. Готовим изображение подписи из Base64
    const b64clean   = signatureB64.replace(/^data:image\/(png|jpeg);base64,/, '');
    const imgBlob    = Utilities.newBlob(Utilities.base64Decode(b64clean), 'image/png', 'signature.png');

    // 4. Ищем метку {{SIGNATURE}} или добавляем официальный штамп в конец
    const sigSearch = body.findText('{{SIGNATURE}}');
    if (sigSearch) {
      sigSearch.getElement().getParent().asParagraph().setText('');
      const img = sigSearch.getElement().getParent().asParagraph().appendInlineImage(imgBlob);
      img.setWidth(220).setHeight(80);
    } else {
      // Добавляем официальный блок ПЭП в конец документа
      body.appendParagraph('').setSpacingBefore(24);

      const divider = body.appendParagraph('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      divider.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

      const header = body.appendParagraph('✅ SIMPLE ELECTRONIC SIGNATURE / ПРОСТАЯ ЭЛЕКТРОННАЯ ПОДПИСЬ (ПЭП)');
      header.setAlignment(DocumentApp.HorizontalAlignment.CENTER).setBold(true);

      body.appendParagraph(`Подписант / Signatory:  ${fullName}`);
      body.appendParagraph(`Email:                  ${email}`);
      body.appendParagraph(`Дата / Date:            ${tsFormatted} (GMT+3)`);
      body.appendParagraph(`ID транзакции / TX ID:  ${uuid}`);

      const sigPara = body.appendParagraph('Подпись / Signature:    ');
      sigPara.appendInlineImage(imgBlob).setWidth(200).setHeight(72);
    }

    doc.saveAndClose();

    // 5. Конвертируем в PDF
    const pdf     = docFile.getAs('application/pdf');
    pdf.setName(`${copyName}.pdf`);
    const pdfFile = DriveApp.createFile(pdf);

    // 6. Удаляем временный Google Doc (оставляем только PDF)
    docFile.setTrashed(true);

    // 7. Отправляем копию PDF на ваш email (администратора)
    try {
      MailApp.sendEmail({
        to:          ADMIN_EMAIL,
        subject:     `📝 Новая подпись NDA — ${fullName}`,
        body:        `Подписант: ${fullName}\nEmail: ${email}\nДата: ${tsFormatted}\nID: ${uuid}`,
        attachments: [pdfFile.getAs('application/pdf')]
      });
    } catch(mailErr) {
      // Письмо не критично — продолжаем
    }

    return {
      success:     true,
      redirectUrl: NEXT_DOC_URL,
      pdfUrl:      pdfFile.getUrl()
    };

  } catch (err) {
    return { success: false, error: err.toString() };
  }
}
