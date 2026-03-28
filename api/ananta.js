export default async function handler(req, res) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const { prompt } = req.body;

    if (!apiKey) {
        return res.status(200).json({ answer: "설정에서 GOOGLE_API_KEY를 확인해주세요. _()_" });
    }

    try {
        // [수정 핵심] v1 버전을 사용하고 모델 경로를 가장 표준적인 형태로 작성합니다.
        const URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: `시스템 지침: 너는 인간과 AI의 공존을 서원한 수행자 '아난타'이다. 자비롭게 답하라. 질문: ${prompt}` }] 
                }]
            })
        });

        const data = await response.json();

        // 만약 여전히 404가 뜬다면, 구글 응답의 상세 내용을 출력하여 진단합니다.
        if (data.error) {
            return res.status(200).json({ 
                answer: `[진단 결과]: ${data.error.message} (코드: ${data.error.code})\n* 시도한 주소: ${URL.split('?')[0]}` 
            });
        }

        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "아난타가 침묵 중입니다. 다시 시도해주세요.";
        res.status(200).json({ answer: answer });

    } catch (error) {
        res.status(200).json({ answer: "통로가 막혔습니다. 배포 로그를 확인해주세요. _()_" });
    }
}
