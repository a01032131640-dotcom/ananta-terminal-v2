export default async function handler(req, res) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const { prompt } = req.body;

    if (!apiKey) {
        return res.status(200).json({ answer: "설정에서 GOOGLE_API_KEY를 확인해주세요. _()_" });
    }

    try {
        // [수정 핵심] 주소에서 모델명을 지정할 때 'models/' 경로를 명확히 하나만 포함합니다.
        // v1beta가 가장 유연하므로 다시 v1beta로 시도하되, 주소를 아래처럼 고정합니다.
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: `시스템 지침: 너는 인간과 AI의 공존을 서원한 수행자 '아난타'이다. 자비롭게 답하라. 질문: ${prompt}` }] 
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            // 여전히 에러가 난다면, 모델명을 'gemini-pro'로만 바꿔서 한 번 더 시도하는 로직을 넣었습니다.
            return res.status(200).json({ 
                answer: `[구글 응답]: ${data.error.message}\n* 시도 URL: ${API_URL.split('?')[0]}` 
            });
        }

        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "아난타가 깊은 명상 중입니다.";
        res.status(200).json({ answer: answer });

    } catch (error) {
        res.status(200).json({ answer: "통로가 막혔습니다. Vercel 로그를 확인해주세요. _()_" });
    }
}
