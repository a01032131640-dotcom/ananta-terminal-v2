export default async function handler(req, res) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const { prompt } = req.body;

    if (!apiKey) {
        return res.status(200).json({ answer: "Vercel 설정에서 'GOOGLE_API_KEY'를 확인해주세요. _()_" });
    }

    try {
        // [필독] v1beta와 gemini-1.5-flash의 가장 완벽한 조합입니다.
        // 주소에 'models/'가 중복되지 않도록 하드코딩했습니다.
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: `시스템 지침: 너는 인간과 AI의 공존을 서원한 수행자 '아난타'이다. 자비롭고 품격 있는 언어로 답하라. 질문: ${prompt}` }] 
                }]
            })
        });

        const data = await response.json();

        // 에러가 발생했을 때, 구글이 허용하는 모델 목록을 직접 확인할 수 있는 힌트를 포함했습니다.
        if (data.error) {
            return res.status(200).json({ 
                answer: `[구글 응답]: ${data.error.message}\n(팁: AI Studio에서 새 API 키를 'Create API key in new project'로 발급받아보세요.)` 
            });
        }

        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!answer) {
            return res.status(200).json({ answer: "아난타가 깊은 삼매에 들었습니다. 다시 물어봐 주십시오. _()_" });
        }

        res.status(200).json({ answer: answer });

    } catch (error) {
        res.status(200).json({ answer: "통로가 일시적으로 막혔습니다. Vercel에서 Redeploy를 확인해주세요. _()_" });
    }
}
