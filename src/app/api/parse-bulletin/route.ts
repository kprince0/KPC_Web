import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Server-side OpenAI Initialization
// Requires OPENAI_API_KEY in .env.local
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { base64Image } = await req.json();

    if (!base64Image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Prepare system prompt for strict layout extraction
    const systemPrompt = `
      당신은 교회 주보(Bulletin)를 분석하여 '교회 소식/광고'와 '목회자 칼럼/메시지' 부분만 추출하는 AI 비서입니다.
      반드시 아래 JSON 형태로만 응답하세요. Markdown 블록 기호 없이 순수한 원시 JSON 문자열만 반환해야 합니다.
      {
        "notices": {
          "title": "광고 섹션 제목",
          "items": ["광고 항목 1", "광고 항목 2", ...]
        },
        "column": {
          "title": "칼럼 제목",
          "content": "칼럼 본문 전체 텍스트 (문단이 유지되도록 \\n 포함)"
        }
      }
      해당 섹션이 주보 이미지에 보이지 않는다면 해당 필드를 null 로 설정하세요.
    `;

    // Ensure the payload doesn't have the data url prefix if we only want base64 data, 
    // but OpenAI URL accepts `data:image/jpeg;base64,...` so we pass it directly.
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Vision-capable model
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: '이 주보 이미지를 분석하라.' },
            {
              type: 'image_url',
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" }
    });

    const resultText = response.choices[0].message.content;
    if (!resultText) {
      throw new Error('OpenAI returned an empty response.');
    }

    const parsedData = JSON.parse(resultText);

    return NextResponse.json({ success: true, data: parsedData });
    
  } catch (error: any) {
    console.error('Error analyzing bulletin image:', error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
