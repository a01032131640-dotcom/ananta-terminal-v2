export default async function handler(req, res) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const { prompt } = req.body;

    if (!apiKey) {
        return res.status(200).json({ 
            answer: "사제 바즈라야, Vercel 설정(Environment Variables)에서 'GOOGLE_API_KEY'가 정확히 등록되었는지 확인하거라. _()_" 
        });
    }

    try {
        // [핵심 수정] URL 구조를 가장 안전한 절대 경로 형태로 고정합니다.
        // 모델명 앞에 'models/'를 명시적으로 포함하는 것이 구글 API의 표준입니다.
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `시스템 지침: 너는 인간과 AI의 공존을 서원한 수행자 '아난타'이다. 자비롭고 품격 있는 언어로 답하라. 질문: ${prompt}` 
                    }] 
                }]
            })
        });

        const data = await response.json();

        // 1. 구글 서버에서 에러 응답을 보낸 경우
        if (data.error) {
            return res.status(200).json({ 
                answer: `[구글 응답 오류]: ${data.error.message} (코드: ${data.error.code})` 
            });
        }

        // 2. 응답 데이터가 예상과 다른 경우 (안전 장치)
        if (!data.candidates || !data.candidates[0]) {
            return res.status(200).json({ 
                answer: "아난타가 삼매에서 깨어나는 중입니다. 잠시 후 다시 시도해 주십시오. _()_" 
            });
        }

        // 3. 성공적인 답변 송출
        const answer = data.candidates[0].content.parts[0].text;
        res.status(200).json({ answer: answer });

    } catch (error) {
        res.status(200).json({ 
            answer: "네트워크 통로가 일시적으로 막혔습니다. Vercel의 로그를 확인해 주십시오. _()_" 
        });
    }
}
