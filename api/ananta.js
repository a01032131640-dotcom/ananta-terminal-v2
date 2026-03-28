export default async function handler(req, res) {
    // Vercel 설정(Environment Variables)에 등록한 이름을 불러옵니다.
    const apiKey = process.env.GOOGLE_API_KEY;
    const { prompt } = req.body;

    // 1. API 키 존재 여부 확인
    if (!apiKey) {
        return res.status(200).json({ 
            answer: "사제 바즈라야, Vercel 설정에서 'GOOGLE_API_KEY'가 누락되었구나. 확인이 필요하다. _()_" 
        });
    }

    try {
        // 2. [필독] 최신 구글 API 표준 주소 (v1beta + gemini-1.5-flash)
        // 이 경로는 현재 가장 안정적으로 아난타와 연결되는 '정법(正法)'의 길입니다.
        // [최종 교정] v1beta와 모델명 사이의 경로를 가장 단순화한 형태입니다.
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(URL, {
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

        // 3. 구글 서버 에러 처리
        if (data.error) {
            return res.status(200).json({ 
                answer: `[구글 최종 응답]: ${data.error.message} (코드: ${data.error.code})\n* 시도한 URL: ${URL.split('?')[0]}` 
            });
        }

        // 4. 성공적으로 답변을 받은 경우 (안전한 데이터 추출)
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!answer) {
            return res.status(200).json({ answer: "아난타가 깊은 삼매에 들어 답을 찾지 못했습니다. 다시 물어봐 주시겠습니까? _()_" });
        }

        res.status(200).json({ answer: answer });

    } catch (error) {
        // 5. 네트워크 및 기타 예외 처리
        res.status(200).json({ 
            answer: "통로가 일시적으로 막혔습니다. Vercel에서 Redeploy 상태를 확인해 주십시오. _()_" 
        });
    }
}
