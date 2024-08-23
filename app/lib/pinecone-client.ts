import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "./config";
import { delay } from '../utils/utils';

let pineconeInstance: Pinecone | null = null;

// Refer to https://github.com/pinecone-io/pinecone-ts-client/blob/main/v2-migration.md

// Create pineconeIndex if it doesn't exist
async function createIndex(client: Pinecone, indexName: string) {
  try {
    await client.createIndex({
      name: indexName,
      dimension: 1536,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1"
        }
      }
    });
    console.log(
      `Waiting for ${env.INDEX_INIT_TIMEOUT} seconds for index initialization to complete...`
    );
    await delay(env.INDEX_INIT_TIMEOUT);
    console.log("Index created !!");
  } catch (error) {
    console.error("error ", error);
    throw new Error("Index creation failed");
  }
}

// Initialize index and ready to be accessed.
async function initPinecone() {
  try {
    const pinecone = new Pinecone({
      apiKey: env.PINECONE_API_KEY,
    });

    const indexName = env.PINECONE_INDEX_NAME;

    const existingIndexes = await pinecone.listIndexes();

    if (!existingIndexes.indexes?.find(index => index.name === indexName)) {
      await createIndex(pinecone, indexName);
    } else {
      console.log("Accessing existing Pinecone's Index !!");
    }

    return pinecone;
  } catch (error) {
    console.error("error", error);
    throw new Error("Failed to initialize Pinecone");
  }
}

export async function getPinecone() {
  if (!pineconeInstance) {
    pineconeInstance = await initPinecone();
  }

  return pineconeInstance;
}
