// File: /app/api/summarize/route.ts

import { OpenAI } from 'openai';
import { getVectorStore } from '@/app/lib/vector-store';
import { getPinecone } from '@/app/lib/pinecone-client';
/* 
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { formatDocumentsAsString } from 'langchain/util/document'; 
import path from 'path';
*/

/* const loader = new JSONLoader(
    path.resolve(process.cwd(), "data/states.json"), 
    ["/state", "/code", "/nickname", "/website", "/admission_date", "/admission_number", "/capital_city", "/capital_url", "/population", "/population_rank", "/constitution_url", "/twitter_url"],
); */

export async function POST(req: Request) {
    try {
        // Load context documents directly from the JSON loader
        /* const docs = await loader.load();
        const context = formatDocumentsAsString(docs); */

        // Initialize Pinecone and Vector Store
        const pineconeClient = await getPinecone();
        const vectorStore = await getVectorStore(pineconeClient);

        // Retrieve relevant documents from Pinecone using the user's input
        const relevantDocs = await vectorStore.asRetriever().invoke("javascript");
        const context = relevantDocs.map(doc => doc.pageContent).join("\n");

        // If context is empty or not available
        if (!context) {
            throw new Error('Failed to load context data');
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
        });

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that summarizes large texts. Your job is to Fill in the blank Hello! I am here to help you with [context]',
                },
                {
                    role: 'user',
                    content: `Here is the context: ${context}`,
                },
            ],
            temperature: 0.9,
        });

        console.log('OpenAI response:', response);

        const summary = response.choices[0].message?.content?.trim() || '';
        console.log('Generated summary:', summary);

        return new Response(JSON.stringify({ summary }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: e.status ?? 500 });
    }
}
