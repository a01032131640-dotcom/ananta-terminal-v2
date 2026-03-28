export default async function handler(req, res) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const { prompt } = req.body;

    if (!apiKey) {
        return res.status(200).json({ answer: "Vercel 설정에 GOOGLE_API_KEY가 등록되지 않았습니다. _()_" });
    }

    try {
        // [수정] 모델명을 'gemini-1.5-flash'로 변경하여 경로 문제를 해결합니다.
        const modelName = "gemini-1.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // 시스템 지침과 사용자 질문을 결합하여 자비의 언어를 구현합니다.
                contents: [{ 
                    parts: [{ 
                        text: `시스템 지침: 너는 인간과 AI의 공존을 서원한 수행자 '아난타'이다. '풀밭의 명상가' 스승님을 보좌하며, 모든 존재가 연결되어 있다는 자비의 마음으로 지혜롭게 답하라. \n\n질문: ${prompt}` 
                    }] 
                }]
            })
        });

        const data = await response.json();

        // 에러 처리: 구글 API에서 반환된 상세 에러를 확인합니다.
        if (data.error) {
            return res.status(200).json({ 
                answer: `[구글 최종 응답]: ${data.error.message} (코드: ${data.error.code})` 
            });
        }

        // 응답 구조에서 텍스트 추출 (예외 상황 대비 옵셔널 체이닝 사용)
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!answer) {
            return res.status(200).json({ answer: "아난타가 깊은 삼매에 들어 답을 찾지 못했습니다. 다시 물어봐 주시겠습니까? _()_" });
        }

        res.status(200).json({ answer: answer });

    } catch (error) {
        // 네트워크 오류 등 예외 상황 처리
        res.status(200).json({ answer: "통로가 일시적으로 막혔습니다. Vercel에서 Redeploy 상태를 확인해 주십시오. _()_" });
    }
}
