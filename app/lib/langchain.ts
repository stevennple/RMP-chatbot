import { ChatOpenAI } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StreamData, LangChainAdapter } from "ai";
import { getVectorStore } from "./vector-store";
import { getPinecone } from "./pinecone-client";

type callChainArgs = {
  question: string;
  chatHistory: string;
};

export async function callChain({ question, chatHistory }: callChainArgs) {
  try {
    const sanitizedQuestion = question.trim().replaceAll("\n", " "); // Ensure input is in a consistent format for processing

    /**
     * vector store and Pinecone client are used for retrieving relevant context to the input.
     */
    const pineconeClient = await getPinecone();
    const vectorStore = await getVectorStore(pineconeClient);

    const streamingModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      streaming: true,
      verbose: true,
      temperature: 0,
    });

    const nonStreamingModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      verbose: true,
      temperature: 0,
    });

    const STANDALONE_QUESTION_TEMPLATE = PromptTemplate.fromTemplate(`
      Given the following conversation and a follow-up question, rephrase the follow-up question to be a standalone question.
      Chat History:
      {chatHistory}
      Follow Up Input: {question}
      Standalone question:
    `);

    const SYSTEM_MESSAGE_TEMPLATE = PromptTemplate.fromTemplate(`
      You are an enthusiastic AI assistant. Use the following pieces of context to answer the question at the end.
      If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
      If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.
    
      {context}
    
      Question: {question}
      Helpful answer in markdown:
    `);
    
    /**
     * Set up RunnableSequence to processes:
     * question 
     * chat history
     * retrieve relevant context from pinecone
     * and applies the system message
     */
    const chain = RunnableSequence.from([
      {
        question: (input: { question: string; chatHistory: string }) => input.question,
        chatHistory: (input: { question: string; chatHistory: string }) => input.chatHistory,
        context: async (input: { question: string; chatHistory: string }) => {
          const relevantDocs = await vectorStore.asRetriever().invoke(input.question);
          return relevantDocs.map(doc => doc.pageContent).join("\n");
        },
      },
      SYSTEM_MESSAGE_TEMPLATE,
    ]);

    // Execute the RunnableSequence to get the final prompt that can be passed to the model
    const finalPrompt = await chain.invoke({
      question: sanitizedQuestion,
      chatHistory: chatHistory,
    });

    const formattedPrompt = finalPrompt.toChatMessages ? finalPrompt.toChatMessages() : finalPrompt;

    const data = new StreamData();
    
    // Declare stream outside of try block
    let stream;

    // Run the model's stream method with the correct input
    try {
      stream = await streamingModel.stream(finalPrompt);
      // Process the stream here
    } finally {
      data.close();  // Ensure data is sent to the client
    }
    
    // Append additional data if needed
    data.append({
      sources: ['additional data here...'],
    });

    // Convert LangChain stream to Vercel AI DataStreamResponse
    return LangChainAdapter.toDataStreamResponse(stream, { data });

  } catch (e) {
    console.error(e);
    throw new Error("Call chain method failed to execute successfully!!");
  }
}
