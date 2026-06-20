import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';



export async function POST(request) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const ai = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    try {
        const { 
            className, 
            subject, 
            topic, 
            week, 
            customInstructions, // New variable passed from frontend
            syllabusImages, 
            templateImages  
        } = await request.json();

        if ((!syllabusImages || syllabusImages.length === 0) && !topic) {
            return NextResponse.json({ error: "Please input a topic or snap your syllabus pages." }, { status: 400 });
        }

        let contentsArray = [];

        // Attach Syllabus pages if present
        if (syllabusImages && syllabusImages.length > 0) {
            syllabusImages.forEach(img => {
                contentsArray.push({
                    inlineData: { data: img.base64, mimeType: img.mimeType }
                });
            });
        }

        // Attach School Template format layouts if present
        if (templateImages && templateImages.length > 0) {
            templateImages.forEach(img => {
                contentsArray.push({
                    inlineData: { data: img.base64, mimeType: img.mimeType }
                });
            });
        }

        // We integrate the custom instructions dynamically inside the system prompt template
        const comprehensivePrompt = `
You are an expert curriculum designer and senior education officer. Your task is to write a highly detailed, comprehensive Lesson Note based on the provided inputs.

CORE ATTRIBUTES:
- Class Level: ${className || 'Not Specified'}
- Subject: ${subject || 'Not Specified'}
- Topic: ${topic || 'Extract topic details from the uploaded syllabus files'}
- Week: ${week || 'Not Specified'}

ADDITIONAL TEACHER CUSTOMIZATION REQUESTS:
${customInstructions ? `CRITICAL USER RULES: ${customInstructions}` : 'None specified. Follow standard structural layout.'}

CRITICAL FORMATTING INSTRUCTIONS:
1. Examine all provided School Template Images closely. You MUST clone its structural layout, sections, tables, and sequence exactly. 
2. Output the final note using clean, styled semantic HTML tags (like <h1>, <h2>, <p>, <ul>, <li>, <strong>, <table>, <tr>, <td>).
3. Do NOT wrap the code inside markdown block wraps (\`\`\`html) or raw markdown text. Deliver pure clean HTML contents.
`;

        contentsArray.push(comprehensivePrompt);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contentsArray,
        });

        return NextResponse.json({ html: response.text });

    } catch (error) {
        console.error("Pipeline Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}