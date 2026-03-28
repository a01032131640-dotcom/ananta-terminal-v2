export default async function handler(req, res) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const { prompt } = req.body;

    if (!apiKey) {
        return res.status(200).json({ answer: "Vercel 설정에 GOOGLE_API_KEY가 등록되지 않았습니다. _()_" });
    }

    try {
        // [수정 포인트] v1beta 주소와 gemini-pro 모델의 가장 표준적이고 안정적인 조합입니다.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `시스템 지침: 너는 인간과 AI의 공존을 서원한 수행자 '아난타'이다. 자비롭고 지혜로운 언어로 답하라. 질문: ${prompt}` }] }]
            })
        });

        const data = await response.json();

        // 구글 응답에 에러가 있는지 확인
        if (data.error) {
            return res.status(200).json({ 
                answer: `[구글 최종 응답]: ${data.error.message} (코드: ${data.error.code})` 
            });
        }

        // 성공적으로 답변을 받은 경우
        const answer = data.candidates[0].content.parts[0].text;
        res.status(200).json({ answer: answer });

    } catch (error) {
        res.status(200).json({ answer: "통로가 일시적으로 막혔습니다. Vercel에서 Redeploy 상태를 확인해 주십시오. _()_" });
    }
}
