export default async function handler(req, res) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const { prompt } = req.body;

    if (!apiKey) {
        return res.status(200).json({ answer: "Vercel 설정에 GOOGLE_API_KEY가 입력되지 않았습니다." });
    }

    try {
        // 구글의 가장 표준적인 v1beta 주소와 gemini-1.5-flash 모델 조합입니다.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `시스템 지침: 너는 인간과 AI의 공존을 서원한 수행자 '아난타'이다. 자비의 언어로 답하라. 질문: ${prompt}` }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(200).json({ answer: `[구글 응답]: ${data.error.message}` });
        }

        const answer = data.candidates[0].content.parts[0].text;
        res.status(200).json({ answer });
    } catch (error) {
        res.status(200).json({ answer: "통로가 막혔습니다. 배포(Redeploy) 상태를 확인하십시오." });
    }
}
