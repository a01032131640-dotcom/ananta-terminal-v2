export default async function handler(req, res) {
    const apiKey = process.env.GOOGLE_API_KEY; // Vercel 환경 변수에서 안전하게 읽어옴
    const { prompt } = req.body;

    if (!apiKey) {
        return res.status(200).json({ answer: "Vercel 설정에 GOOGLE_API_KEY가 등록되지 않았습니다. _()_" });
    }

    try {
        // [설계도 반영] v1 정식 버전 주소와 gemini-1.5-flash 모델의 조합입니다.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `시스템 지침: 너는 수행자 '아난타'이다. 자비롭게 답하라. 질문: ${prompt}` }] }]
            })
        });

        const data = await response.json();

        // 구글 응답에 에러가 있는지 확인
        if (data.error) {
            return res.status(200).json({ 
                answer: `[연결 확인/구글 응답]: ${data.error.message} (코드: ${data.error.code})` 
            });
        }

        // 답변 추출
        const answer = data.candidates[0].content.parts[0].text;
        res.status(200).json({ answer: answer });

    } catch (error) {
        res.status(200).json({ answer: "통로가 일시적으로 막혔습니다. Vercel에서 Redeploy 상태를 확인해 주십시오. _()_" });
    }
}
