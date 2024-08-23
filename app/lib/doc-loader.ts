import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document"; 

// https://js.langchain.com/v0.2/docs/how_to/document_loader_pdf/
export async function getChunkedDocsFromPDF(file: File) {
  try {
    const blob = new Blob([file], { type: file.type });
    const loader = new PDFLoader(blob); // Parse PDF content into structured text for processing.
    const docs = await loader.load();

    // From the docs https://www.pinecone.io/learn/chunking-strategies/
    // splitting text into manageable chunks for processing in LLM
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });

    const chunkedDocs = await textSplitter.splitDocuments(docs);

    return chunkedDocs;
  } catch (e) {
    console.error(e);
    throw new Error("PDF docs chunking failed!");
  }
}

export async function getChunkedDocsFromText(inputText: string) {
  try {
    // Create a Document structure with pageContent and metadata
    const docs: Document[] = [
      new Document({
        pageContent: inputText,
        metadata: {}  // You can add custom metadata here if needed
      })
    ];

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });

    const chunkedDocs = await textSplitter.splitDocuments(docs);

    return chunkedDocs;
  } catch (e) {
    console.error(e);
    throw new Error("Text chunking failed!");
  }
}