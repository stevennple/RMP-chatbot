import { NextResponse } from 'next/server';
import { getPinecone } from '../../lib/pinecone-client';
import { getChunkedDocsFromPDF, getChunkedDocsFromText } from '../../lib/doc-loader';
import { embedAndStoreDocs } from '../../lib/vector-store';
import { Document } from 'langchain/document';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    console.log('From embed-pdf, Content Type:', contentType);

    const pineconeClient = await getPinecone();

    let chunks: Document<Record<string, any>>[] = [];
    console.log('Pinecone client initialized successfully');

    // Handle PDF Upload
    /* if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const fileEntry = formData.get('pdf');
      const textEntry = formData.get('text');

      if (!fileEntry || !(fileEntry instanceof File)) {
        return NextResponse.json({ error: 'No file uploaded or invalid file type' }, { status: 400 });
      }

      const file = fileEntry as File;
      chunks = await getChunkedDocsFromPDF(file);

    }  */

    // Handle PDF and Text Upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      console.log('Form data received:', formData);

      const fileEntry = formData.get('pdf'); 
      const textEntry = formData.get('content');

      if(fileEntry instanceof File) {
        try {  
          // Process PDF file
          const file = fileEntry as File;
          console.log('Processing file...');
          chunks = await getChunkedDocsFromPDF(file);
          console.log(`PDF processed into ${chunks.length} chunks`);
        } catch (error) {
          console.error('Error processing file upload:', error);
          return NextResponse.json({ error: 'Failed to process file upload' }, { status: 400 });
        }
      } 
      else if (textEntry) {
        const textContent  = textEntry.toString();
        try { 
          // Process text input
          console.log('Processing text...');
          chunks = await getChunkedDocsFromText(textContent);
          console.log(`Text processed into ${chunks.length} chunks`);
        } catch (error) {
          console.error('Error processing text input:', error);
          return NextResponse.json({ error: 'Failed to process text input' }, { status: 400 });
        }
      }
      else {
        return NextResponse.json({ error: 'No valid file or text uploaded' }, { status: 400 });
      }
    }

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({ error: 'No content to embed' }, { status: 400 });
    }

    // Combine the chunked document content into a single string
    const extractedContent = chunks.map(doc => doc.pageContent).join(' ');

    // Embed and store the chunks
    /* try {
      await embedAndStoreDocs(pineconeClient, chunks);
    } catch (error) {
      console.error('Error embedding content:', error);
      return NextResponse.json({ error: 'Failed to embed content' }, { status: 500 });
    } */
    return NextResponse.json({ message: 'Content embedded successfully', extractedContent, chunks }, { status: 200 });

  } catch (error) {
    console.error('Error embedding content:', error);
    return NextResponse.json({ error: 'Failed to embed content' }, { status: 500 });
  }
}
