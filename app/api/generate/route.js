import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  // 1. Initialize the stable client using your environment key
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // 2. Get the model instance directly
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const {
      className,
      subject,
      topic,
      week,
      customInstructions,
      syllabusImages,
      templateImages
    } = await request.json();

    if ((!syllabusImages || syllabusImages.length === 0) && !topic) {
      return NextResponse.json({ error: "Please input a topic or snap your syllabus pages." }, { status: 400 });
    }

    let contentsArray = [];

    // Attach Syllabus pages if present
    if (syllabusImages && syllabusImages.length > 0) {
      syllabusImages.forEach((img) => {
        contentsArray.push({
          inlineData: {
            data: img.base64,
            mimeType: img.mimeType
          }
        });
      });
    }

    // Attach Template pages if present
    if (templateImages && templateImages.length > 0) {
      templateImages.forEach((img) => {
        contentsArray.push({
          inlineData: {
            data: img.base64,
            mimeType: img.mimeType
          }
        });
      });
    }

    // 3. Formulate the core prompt text
    const corePrompt = `
      You are an expert curriculum developer and educator. Generate a highly detailed, comprehensive school lesson note based on the provided materials.
      Class: ${className}
      Subject: ${subject}
      Topic: ${topic || 'Extract from the attached syllabus scheme page'}
      Week: ${week}
      Special Instructions: ${customInstructions || 'None'}
      
      Output ONLY valid, beautifully structured HTML wrapped inside a clean layout. Use <h1>, <h2>, <h3>, <p>, <ul>, <li>, and <table> tags where appropriate. Do not include markdown code block backticks (\`\`\`html) in your response.
    `;

    contentsArray.push(corePrompt);

    // 4. CRUCIAL FIX: Call generateContent directly on the model variable!
    const response = await model.generateContent(contentsArray);
    const resultText = response.response.text();

    return NextResponse.json({ html: resultText });

  } catch (error) {
    console.error("Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}