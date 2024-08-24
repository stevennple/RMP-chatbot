import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(req: Request) {
    try {
        // Initialize OpenAI client
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
        });

        // Parse incoming JSON data
        const professorData = await req.json();

        // Validate the incoming data
        if (!professorData || !professorData.overallRating || !professorData.difficulty || !professorData.ratingsData) {
            return NextResponse.json({ error: 'Invalid professor data provided' }, { status: 400 });
        }

        // Prepare the prompt for OpenAI to generate a summary
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Your task is to analyze the following professor's details and generate a concise summary.
                  
                  Consider the overall rating, difficulty, and comments from students to create an insightful and balanced summary.
                  Highlight strengths and weaknesses, and provide a clear overall impression of the professor's performance.
                  Focus on accuracy and clarity in your summary.`,
                },
                {
                    role: 'user',
                    content: `Here are the professor's details: 
                    Overall Rating: ${professorData.overallRating}
                    Difficulty: ${professorData.difficulty}
                    Would Take Again: ${professorData.wouldTakeAgain}
                    Student Comments: ${professorData.ratingsData.map((r: any) => r.comments).join(" ")}`
                },
            ],
            temperature: 0.5,
        });

        // Extract the summary from the OpenAI response
        const summary = response.choices[0].message?.content?.trim();
        if (!summary) {
            return NextResponse.json({ error: 'Failed to generate professor summary' }, { status: 500 });
        }

        console.log('Generated professor summary:', summary);

        // Return the generated summary as a JSON response
        return NextResponse.json({ summary: summary, success: true }, { status: 200 });

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e.message }), { status: e.status ?? 500 });
    }
}
