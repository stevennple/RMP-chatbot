import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

/* function summarizeText(text: string, maxTokens: number): string {
    // Basic implementation to summarize text, you can improve this with libraries like 'summarizer'
    const sentences = text.split('. ');
    
    // Estimate the average token length per sentence
    const avgTokenLength = text.length / sentences.length;
    
    // Calculate the number of sentences we can keep within the token limit
    const sentenceLimit = Math.floor(maxTokens / avgTokenLength);
    
    // Extract the top sentences
    return sentences.slice(0, sentenceLimit).join('. ') + '.';
} */


export async function POST(req: Request) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
        });

        const formData = await req.formData();
        console.log('From /generateKeywords, Received formData:', formData);

        // const file = formData.get('pdf');
        const rawText = formData.get('text');
        if (!rawText || typeof rawText !== 'string') {
            throw new Error("No text provided");
        }

        //const summarizedText = summarizeText(rawText, 128000); // Limit to 128,000 tokens

        // Generate summary or keywords using OpenAI
        const keywords = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that generates keywords. Only provide the keywords and nothing else',
                },
                {
                    role: 'user',
                    content: `Extract keywords from this content: ${rawText}`,
                },
            ],
            temperature: 0.1,
            max_tokens: 500,
        });

        const summaryOrKeywords = keywords.choices[0].message?.content?.trim() || '';
        console.log('Generated summary/keywords:', summaryOrKeywords);

        return NextResponse.json({ keywords: summaryOrKeywords }, { status: 200 });

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e.message }), { status: e.status ?? 500 });
    }
}
