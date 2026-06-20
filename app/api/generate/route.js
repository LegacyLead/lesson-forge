import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { prompt, format, elements } = await req.json();

    // Constructing the developer instruction context
    const systemPrompt = `You are an expert curriculum design assistant. Generate high-quality lesson plans, question banks, and structural academic schemes based precisely on the user's request.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        // llama-3.3-70b-versatile is incredible for structured educational tasks
        model: "llama-3.3-70b-versatile", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Format Requirement: ${format || 'Standard text'}\nContext Elements: ${JSON.stringify(elements || {})}\n\nTask: ${prompt}` }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error?.message || "Groq Request Failed" }, { status: response.status });
    }

    const data = await response.json();
    const resultText = data.choices[0]?.message?.content || "";

    return NextResponse.json({ success: true, text: resultText });

  } catch (error) {
    console.error("Backend Error:", error);
    return NextResponse.json({ error: "Internal Server Error Occurred" }, { status: 500 });
  }
}