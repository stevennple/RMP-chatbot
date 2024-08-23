/* import { getChunkedDocsFromPDF } from "@/app/lib/pdf-loader";
import { embedAndStoreDocs } from "@/app/lib/vector-store";
import { getPinecone } from "@/app/lib/pinecone-client";

// This operation might fail because indexes likely need
// more time to init, so give some 5 mins after index creation and try again.
// Test: npm run prepare:data
(async () => {
  try {
    const pineconeClient = await getPinecone(); // Create pinecone index and init
    console.log("Preparing chunks from PDF file");

    const docs = await getChunkedDocsFromPDF();
    console.log(`Loading ${docs.length} chunks into pinecone...`); // Chunk the PDF Doc

    await embedAndStoreDocs(pineconeClient, docs); // Embed the chunks into pinecone and push the embeddigns to pinecone index
    console.log("Data embedded and stored in pine-cone index");

  } catch (error) {
    console.error("Init client script failed ", error);
  }
})();
 */