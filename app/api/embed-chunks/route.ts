import { NextResponse } from 'next/server';
import { getPinecone } from '../../lib/pinecone-client';
import { embedAndStoreDocs } from '../../lib/vector-store';
import { Document } from 'langchain/document';

export async function POST(request: Request) {
  try {
    const { chunks } = await request.json();

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({ error: 'No chunks to embed' }, { status: 400 });
    }

    const pineconeClient = await getPinecone();
    await embedAndStoreDocs(pineconeClient, chunks); // Embed and store the chunks

    return NextResponse.json({ message: 'Chunks embedded successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error embedding chunks:', error);
    return NextResponse.json({ error: 'Failed to embed chunks' }, { status: 500 });
  }
}