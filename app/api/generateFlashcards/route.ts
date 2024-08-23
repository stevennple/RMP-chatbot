import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Flashcard interface
interface Flashcard {
    front: string;
    back: string;
}

export async function POST(req: Request) {
    const encoder = new TextEncoder();

    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
        });

        const { context } = await req.json();

        if (!context) {
            throw new Error('Failed to load context data');
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Your task is to generate concise and effective flashcards based on the given topic or content. Follow these guidelines:
                  
                  Create clear and concise questions for the front of the flashcard.
                  Provide accurate and informative answers for the back of the flashcard.
                  Ensure that each flashcard focuses on a single concept or piece of information.
                  Use simple language to make the flashcards accessible to a wide range of learners.
                  Include a variety of question types, such as definitions, examples, comparisons, and applications.
                  Avoid overly complex or ambiguous phrasing in both questions and answers.
                  When appropriate, use mnemonics or memory aids to help reinforce the information.
                  Tailor the difficulty level of the flashcards to the user's specified preferences.
                  If given a body of text, extract the most important and relevant information for the flashcards.
                  Aim to create a balanced set of flashcards that covers the topic comprehensively.
                  
                  Return in the following JSON format and make sure to label the question with number:
                  {
                      "question [number]": [{
                          "front": str,
                          "back": str
                      }]
                  }`,
                },
                {
                    role: 'user',
                    content: `Here is the context: ${context}. Generate 10 flashcards based on this content.`,
                },
            ],
            temperature: 0.5,
        });

        const flashcardsJson = response.choices[0].message?.content?.trim();
        if (!flashcardsJson) {
            return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
        }

        console.log('Generated flashcards JSON:', flashcardsJson);
        
        let flashcardsObject: Record<string, Flashcard[]>;
        try {
            flashcardsObject = JSON.parse(flashcardsJson);
        } catch (error) {
            return NextResponse.json({ error: 'Failed to parse flashcards JSON' }, { status: 500 });
        }

        return NextResponse.json({ flashcards: flashcardsObject, success: true }, { status: 200 });

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e.message }), { status: e.status ?? 500 });
    }
}
