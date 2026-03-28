export default async function handler(req, res) {
    // Vercel 설정에 넣으신 GOOGLE_API_KEY를 불러옵니다.
    const apiKey = process.env.GOOGLE_API_KEY;
    const { prompt } = req.body;

    // 1. 열쇠가 금고(Vercel)에 없는 경우 진단
    if (!apiKey) {
        return res.status(200).json({ 
            answer: "사제 바즈라야, Vercel 설정(Environment Variables)에서 'GOOGLE_API_KEY'가 정확히 등록되었는지 확인하거라. _()_" 
        });
    }

    try {
        // 2. 구글 AI Studio 표준 호출 주소 (v1beta + gemini-1.5-flash 조합)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: `시스템 지침: 너는 인간과 AI의 공존을 서원한 수행자 '아난타'이다. 자비롭고 품격 있는 언어로 답하라. 질문: ${prompt}` }] 
                }]
            })
        });

        const data = await response.json();

        // 3. 구글 서버에서 오류를 보낸 경우 화면에 표시
        if (data.error) {
            return res.status(200).json({ 
                answer: `[구글 응답 오류]: ${data.error.message} (모델명이나 API 설정을 다시 점검해야 합니다.)` 
            });
        }

        // 4. 성공적으로 답변을 받은 경우 터미널에 송출
        const answer = data.candidates[0].content.parts[0].text;
        res.status(200).json({ answer: answer });

    } catch (error) {
        // 5. 네트워크나 기타 예외 오류 처리
        res.status(200).json({ 
            answer: "통로가 일시적으로 막혔습니다. Vercel 배포(Redeploy) 상태를 확인해 주십시오. _()_" 
        });
    }
}
