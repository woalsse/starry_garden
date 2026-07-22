// 별난정원 설문조사 -> 구글 시트 저장용 Apps Script
// 사용법: 구글 시트 확장 프로그램 > Apps Script 에 이 코드를 붙여넣고
// "배포 > 새 배포 > 웹 앱"으로 배포하세요. (액세스 권한: 모든 사용자)

const SHEET_NAME = "설문응답"; // 응답이 쌓일 시트 탭 이름. 원하는 이름으로 바꿔도 됩니다.

function doPost(e) {
  const sheet = getOrCreateSheet_();
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.design || "",
    data.designReason || "",
    data.ecoInfluence || "",
    data.priorUsage || "",
    data.willingness || "",
    data.desiredPrice || "",
    data.opinion || "",
    data.name || "",
    data.contact || "",
    data.privacyConsent || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "제출시각", "선호 디자인", "디자인 선택 이유", "친환경 요소 영향", "기존 사용 여부",
      "구매 의향", "희망 가격", "의견", "이름", "연락처", "개인정보 동의",
    ]);
  }

  return sheet;
}
