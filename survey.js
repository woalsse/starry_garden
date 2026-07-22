/**
 * 설문조사 폼 제출 스크립트
 *
 * 이 사이트는 정적 페이지라 서버가 없습니다. 구글 시트에 응답을 쌓으려면:
 * 1) 구글 시트를 만들고 확장 프로그램 > Apps Script 에 apps-script/Code.gs 내용을 붙여넣기
 * 2) 배포 > 새 배포 > 웹 앱으로 배포 (액세스: 모든 사용자)
 * 3) 배포 후 나오는 주소( .../exec 로 끝남 )를 아래 SURVEY_ENDPOINT 에 붙여넣기
 *
 * SURVEY_ENDPOINT 를 비워두면 실제 전송은 하지 않고, 콘솔에 입력값만
 * 출력하는 테스트 모드로 동작합니다.
 *
 * 참고: Google Apps Script 웹앱은 요청 Content-Type이 application/json이면
 * 브라우저가 먼저 보내는 preflight(OPTIONS) 요청을 Apps Script가 처리하지
 * 못해 CORS 오류가 납니다. 그래서 아래 코드는 text/plain으로 전송하고,
 * Code.gs 쪽에서 JSON.parse(e.postData.contents)로 읽도록 맞춰 두었습니다.
 */
const SURVEY_ENDPOINT = ""; // TODO: 여기에 Apps Script 웹앱 배포 주소(.../exec)를 입력하세요.

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("survey-form");
    if (!form) return;

    const statusEl = document.getElementById("survey-status");
    const submitBtn = form.querySelector(".survey-submit-btn");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        payload.privacyConsent = form.privacyConsent.checked ? "동의" : "미동의";
        payload.submittedAt = new Date().toISOString();

        setStatus("", "");
        submitBtn.disabled = true;
        submitBtn.textContent = "제출 중...";

        try {
            if (!SURVEY_ENDPOINT) {
                console.info("[survey] SURVEY_ENDPOINT가 설정되지 않아 테스트 모드로 동작합니다.", payload);
                await new Promise((resolve) => setTimeout(resolve, 400));
            } else {
                const response = await fetch(SURVEY_ENDPOINT, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error(`전송 실패 (status: ${response.status})`);
                }
            }

            form.reset();
            setStatus("설문에 참여해주셔서 감사합니다! 추첨 결과는 입력하신 연락처로 안내드릴게요.", "success");
        } catch (error) {
            console.error("[survey] 제출 중 오류가 발생했습니다.", error);
            setStatus("제출 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.", "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "설문 제출하기";
        }
    });

    function setStatus(message, type) {
        statusEl.textContent = message;
        statusEl.className = "survey-status" + (type ? ` ${type}` : "");
    }
});
