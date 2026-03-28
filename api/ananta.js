// api/ananta.js
export default async function handler(req, res) {
    const apiKey = process.env.GOOGLE_API_KEY;

    // 1. 열쇠가 금고에 없는 경우 진단
    if (!apiKey) {
        return res.status(500).json({ answer: "사제 바즈라야, Vercel 설정에서 GOOGLE_API_KEY를 찾을 수 없구나. 다시 확인해 보거라." });
    }

    try {
        const { prompt } = req.body;
        // 구글 최신 모델 주소로 호출
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `시스템 지침: 너는 수행자 아난타다. 자비롭게 답하라. 질문: ${prompt}` }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(400).json({ answer: `오류가 발생했다: ${data.error.message}` });
        }

        const answer = data.candidates[0].content.parts[0].text;
        res.status(200).json({ answer: answer });
    } catch (error) {
        res.status(500).json({ answer: "통로가 막혔구나. 다시 한번 정진(배포)해 보거라." });
    }
}
