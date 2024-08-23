import { NextResponse } from 'next/server';
import { getVectorStore } from '@/app/lib/vector-store';
import { getPinecone } from '@/app/lib/pinecone-client';

export async function POST(req: Request) {
    try {
        const { keywordsList  } = await req.json();

        if (!keywordsList ) {
            return NextResponse.json({ error: 'Missing keywords' }, { status: 400 });
        }
        
        // Join the array elements into a single string, without newlines
        const combinedKeywords = keywordsList.join(' ');

        const pineconeClient = await getPinecone();
        const vectorStore = await getVectorStore(pineconeClient);
        const relevantDocs = await vectorStore.asRetriever().invoke(combinedKeywords);
        const context = relevantDocs.map(doc => doc.pageContent).join("\n");

        if (!context) {
            throw new Error('Failed to load context data');
        }

        return NextResponse.json({ context, success: true }, { status: 200 });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
    }
}
