/**
 * 설문조사 폼 제출 스크립트
 *
 * 이 사이트는 정적 페이지라 서버가 없습니다. 응답을 실제로 저장하려면
 * 아래 SURVEY_ENDPOINT 에 데이터를 받아줄 주소를 넣어주세요. 가장 쉬운 방법:
 *
 * [옵션 1] Formspree (https://formspree.io) - 무료, 가입 후 폼 생성하면
 *          "https://formspree.io/f/xxxxxxxx" 형태의 주소를 줍니다.
 *          받은 주소를 SURVEY_ENDPOINT 에 그대로 넣으면 끝입니다.
 *          응답은 Formspree 대시보드/이메일로 쌓이고, 엑셀로 내려받아
 *          기프티콘 추첨에 사용하면 됩니다.
 *
 * [옵션 2] Google Apps Script 웹앱 - 구글시트에 바로 쌓고 싶다면
 *          Apps Script로 doPost(e)를 만들어 웹앱으로 배포한 주소를 넣으세요.
 *
 * SURVEY_ENDPOINT 를 비워두면 실제 전송은 하지 않고, 콘솔에 입력값만
 * 출력하는 테스트 모드로 동작합니다.
 */
const SURVEY_ENDPOINT = ""; // TODO: 여기에 Formspree 등 제출용 주소를 입력하세요.

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
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
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
