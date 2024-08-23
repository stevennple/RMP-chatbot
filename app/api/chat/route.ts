import {
    Message as VercelChatMessage,
    LangChainAdapter,
    createStreamDataTransformer
} from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import path from 'path';
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { RunnableSequence } from '@langchain/core/runnables'
import { formatDocumentsAsString } from 'langchain/util/document'; //required for the context to pass into langchain
import { CharacterTextSplitter } from 'langchain/text_splitter'; // Used with JSON Object
import { streamText } from 'ai';
import { getPinecone } from '@/app/lib/pinecone-client';
import { getVectorStore } from '@/app/lib/vector-store';

/**
 * parse specific fields from a JSON file to be used by the AI model to answer questions
 */
/* const loader = new JSONLoader(
    path.resolve(process.cwd(), "data/states.json"), 
    ["/state", "/code", "/nickname", "/website", "/admission_date", "/admission_number", "/capital_city", "/capital_url", "/population", "/population_rank", "/constitution_url", "/twitter_url"],
); */

/**
 * treat this API route as dynamic, ensuring that it doesn't get cached statically.
 */
export const dynamic = 'force-dynamic'

/**
 * Basic memory formatter that stringifies and passes
 * message history directly into the model.
 */
const formatMessage = (message: VercelChatMessage) => {
    return `${message.role}: ${message.content}`;
};

const TEMPLATE = `Answer the user's questions based only on the following context:
==============================
Context: {context}
==============================
Current conversation: {chat_history}

user: {question}
assistant:`;


export async function POST(req: Request) {
    try {
        const pineconeClient = await getPinecone();
        const vectorStore = await getVectorStore(pineconeClient);

        /**
         * Extracts chat messages from the request body, formats the history, and isolates the latest user message as input data for the AI model
         */
        const { messages } = await req.json();
        if (!Array.isArray(messages) || !messages.every(m => typeof m.content === 'string' && typeof m.role === 'string')) {
            throw new Error('Invalid messages format');
        }

        const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
        console.log("USER's PREVIOUS MESSAGE: ", formattedPreviousMessages);

        const currentMessageContent = messages[messages.length - 1].content;

        console.log("USER's MESSAGE: ", currentMessageContent);

        if (typeof currentMessageContent !== 'string') {
            throw new Error("Invalid currentMessageContent format");
        }

        // Load context documents directly from the JSON loader
        /* const docs = await loader.load();
        const context = formatDocumentsAsString(docs); */

        // Manually load JSON object (this is also commented out as we're testing the loader)
        /* const textSplitter = new CharacterTextSplitter();
        const docs = await textSplitter.createDocuments([JSON.stringify({
            "state": "Virginia",
            "slug": "virginia",
            "code": "VA",
            "nickname": "Old Dominion",
            "website": "https://www.virginia.gov",
            "admission_date": "1788-06-25",
            "admission_number": 10,
            "capital_city": "Richmond",
            "capital_url": "https://www.rva.gov",
            "population": 8631393,
            "population_rank": 12,
            "constitution_url": "https://law.lis.virginia.gov/constitution",
            "twitter_url": "https://twitter.com/GovernorVA",
        })]);
        const context = formatDocumentsAsString(docs); */
        
        // Retrieve relevant documents from Pinecone using the current message content
        const relevantDocs = await vectorStore.asRetriever().invoke(currentMessageContent);
        console.log("Succesfully retrieved documents from Pinecone!");
        const context = relevantDocs.map(doc => doc.pageContent).join("\n");


        const prompt = PromptTemplate.fromTemplate(TEMPLATE);
        const model = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
            model: 'gpt-4o-mini',
            temperature: 0.9,
            streaming: true,
            verbose: true,
        });

        /**
       * Chat models stream message chunks rather than bytes, so this
       * output parser handles serialization and encoding.
       */
        const parser = new HttpResponseOutputParser();
        /**
         * transforming raw input into a properly formatted and streamed output.
         */
        const chain = RunnableSequence.from([
            {
                question: (input) => input.question,
                chat_history: (input) => input.chat_history,
                context: () => context,  // Use the context from the loaded documents
            },
            prompt,
            model,
            parser,
        ]);
        // Convert the response into real-time streaming of the AI's response to the user
        const stream = await chain.stream({
            chat_history: formattedPreviousMessages.join('\n'),
            question: currentMessageContent,
        });

        // Convert the stream into a readable stream for real-time chunked responses
        // https://sdk.vercel.ai/docs/ai-sdk-core/telemetry#streamtext-function
        const responseStream = new ReadableStream({
            async pull(controller) {
                const decoder = new TextDecoder();
                
                for await (const chunk of stream) {
                    const decodedChunk = decoder.decode(chunk, { stream: true });
                    
                    // Enqueue each decoded chunk to be sent to the client
                    controller.enqueue(decodedChunk);
                }

                // Close the stream once all chunks are processed
                controller.close();
            },
        });

        // Return the readable stream as a response
        return new Response(responseStream, {
            headers: { 'Content-Type': 'text/plain' },
        });

        /* const decoder = new TextDecoder();
        let accumulatedText = "";
        
        for await (const chunk of stream) {
            const decodedChunk = decoder.decode(chunk);
            
            // Accumulate the decoded chunks into a single string
            accumulatedText += decodedChunk + "\n";  // Ensure proper chunk separation
            
            console.log("Decoded chunk:", decodedChunk);
        }
        
        // At this point, accumulatedText contains the entire response text
        console.log("Final accumulated text:", accumulatedText);
        
        return new Response(accumulatedText); */

        // Respond with the stream piped through the transformer
        /* return LangChainAdapter.toDataStreamResponse(
            stream.pipeThrough(createStreamDataTransformer()),
        );*/
    } catch (e: any) {
        return Response.json({ error: e.message }, { status: e.status ?? 500 });
    }
}
