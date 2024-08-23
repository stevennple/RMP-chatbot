import { env } from './config';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from "@langchain/pinecone"; // https://js.langchain.com/v0.2/docs/integrations/vectorstores/pinecone/
import { Pinecone } from '@pinecone-database/pinecone';

export async function embedAndStoreDocs(
  client: Pinecone,
  // @ts-ignore docs type error
  docs: Document<Record<string, any>>[]
) {
  /*create and store the embeddings in the vectorStore*/
  try {
    console.log('Initializing embeddings and Pinecone index...');

    const embeddings = new OpenAIEmbeddings(); // 
    const index = client.Index(env.PINECONE_INDEX_NAME);

    console.log(`Embedding and storing ${docs.length} documents into Pinecone index: ${env.PINECONE_INDEX_NAME}`);


    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      textKey: 'text',  
    });

    console.log('Documents successfully embedded and stored in Pinecone.');

  } catch (error) {
    console.log('error ', error);
    throw new Error('Failed to load your docs !');
  }
}

// Returns vector-store handle to be used a retrievers on langchains
// https://v02.api.js.langchain.com/classes/langchain_openai.OpenAIEmbeddings.html
export async function getVectorStore(client: Pinecone) {
  try {
    console.log('Retrieving Pinecone index and vector store...');

    const embeddings = new OpenAIEmbeddings();
    const index = client.Index(env.PINECONE_INDEX_NAME);

    console.log(`Getting vector store from Pinecone index: ${env.PINECONE_INDEX_NAME}`);

    // Getting Index from Pinecone
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      textKey: 'text', // same metadata key from embedding the PDF which can also be used during retrieving the information from pinecone. Referred to https://docs.pinecone.io/guides/data/filter-with-metadata
    });

    console.log('Successfully retrieved vector store from Pinecone.');
    return vectorStore;
  } catch (error) {
    console.log('error ', error);
    throw new Error('Something went wrong while getting vector store !');
  }
}