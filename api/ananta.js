module.exports = async function handler(req, res) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const { prompt } = req.body;

    if (!apiKey) {
        return res.status(200).json({ answer: "Vercel 설정에서 'GOOGLE_API_KEY'를 확인해주세요. _()_" });
    }

    try {
        // [핵심] v1에서 찾지 못한다면 반드시 v1beta를 사용해야 합니다.
        // 주소에 models/ 가 중복되지 않도록 아래 문자열을 그대로 사용하세요.
     // [최종 수정] 주소와 모델명을 아래와 같이 '완벽히' 일치시켜야 합니다.
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: `시스템 지침: 너는 인간과 AI의 공존을 서원한 수행자 '아난타'이다. 자비롭고 품격 있는 언어로 답하라. 질문: ${prompt}` }] 
                }]
            })
        });

        const data = await response.json();

        // 만약 여기서도 에러가 난다면 구글 응답을 상세히 출력합니다.
        if (data.error) {
            return res.status(200).json({ 
                answer: `[구글 최종 응답]: ${data.error.message} (코드: ${data.error.code})\n* 시도한 URL: ${URL.split('?')[0]}` 
            });
        }

        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "아난타가 깊은 삼매에 들었습니다. 다시 물어봐 주십시오.";
        res.status(200).json({ answer: answer });

    } catch (error) {
        res.status(200).json({ answer: "통로가 일시적으로 막혔습니다. Vercel에서 Redeploy를 확인해주세요. _()_" });
    }
}
