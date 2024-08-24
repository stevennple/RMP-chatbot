"use client";

import React, {
  FormEvent,
  ChangeEvent,
  useRef,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useChat } from "ai/react";
import { ChatBubble } from "./chat-bubble";
import { Message } from "ai/react";
import PDFUploader from "./PDFUploader";
import { v4 as uuidv4 } from 'uuid';

// Chat component: handles the UI for chat, displaying messages, and the input form
interface ChatProps {
  conversationId: string | null;
  chatInput: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleMessageSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  handleMicClick: () => void;
  messages: Message[];
  isMicOn: boolean;
}

type Role = "user" | "assistant";

// Interface for old message format, to be displayed when fetching conversation history
interface oldMessage {
  role: Role;
  content: string;
  createdAt: Date; // Added timestamp property
}

// Main Chat component
const Chat: React.FC<ChatProps> = ({
  conversationId,
  chatInput,
  handleInputChange,
  handleMessageSubmit,
  handleMicClick,
  messages,
  isMicOn,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null); // Reference to the chat container for auto-scrolling
  const [summary, setSummary] = useState<string>("");
  const apiCallMade = useRef(false); // Prevent multiple API calls
  const [conversationData, setConversationData] = useState<any>(null); // State for conversation history
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useAuth();

  // Scroll to the bottom of the chat container whenever messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch summary if no API call has been made and no conversation data is available
  useEffect(() => {
    const fetchSummary = async () => {
      if (
        apiCallMade.current ||
        (conversationData && conversationData.messages.length > 0)
      )
        return;
      apiCallMade.current = true;

      try {
        const response = await fetch("/api/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSummary(data.introduction || data.summary);
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    };

    fetchSummary();
  }, [conversationData]);

  // Fetch conversation history for the given conversationId and userId
  useEffect(() => {
    const fetchConversation = async () => {
      if (conversationId && userId) {
        setIsLoading(true);
        try {
          const response = await fetch(
            `/api/getConversation?conversationId=${conversationId}&userId=${userId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            console.log("data received:", data);
            setConversationData(data);
          } else {
            console.error("Failed to fetch conversation:", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching conversation:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchConversation();
  }, [conversationId, userId]);

  return (
    <div className="rounded-2xl border h-[75vh] flex flex-col justify-between">
      {/* Display Conversation ID at the top */}
      <div className="p-4 bg-gray-200 border-b">
        <span className="font-semibold">Chat ID: </span>
        <span>
          {conversationId ? conversationId.replace(/\D/g, "") : "N/A"}
        </span>
      </div>
      <div
        className="p-6 overflow-y-auto flex-grow flex flex-col gap-4"
        ref={chatContainerRef}
      >
        {isLoading ? (
          <p>Loading conversation...</p>
        ) : (
          <>
            {conversationData && conversationData.length > 0 ? (
              <ul className="flex flex-col gap-4">
                {conversationData.map((message: oldMessage, index: number) => (
                  <li key={index}>
                    <ChatBubble
                      role={message.role}
                      content={message.content}
                      createdAt={message.createdAt}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              summary && (
                <ChatBubble
                  role="assistant"
                  content={`${summary}\n\nHow can I assist you today?`}
                  createdAt={new Date()} // Fix: Assign Date object instead of string
                />
              )
            )}
            <ul className="flex flex-col gap-4">
              {messages.map(({ id, role, content, createdAt }: Message) => (
                <li key={id}>
                  <ChatBubble
                    role={role}
                    content={content}
                    createdAt={createdAt}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="p-4 flex">
        <PDFUploader />
        <form onSubmit={handleMessageSubmit} className="flex flex-grow">
          <Input
            placeholder={"Type to chat with AI..."}
            className="mr-2 flex-grow"
            value={chatInput}
            onChange={handleInputChange}
          />
          <Button
            type="button"
            onClick={handleMicClick}
            className={`mr-2 ${isMicOn ? "mic-on" : "mic-off"}`}
          >
            🎤
          </Button>

          <Button type="submit" className="w-24">
            Ask
          </Button>
        </form>
      </div>
    </div>
  );
};

interface ChatContainerProps {
  conversationId: string | null;
}
// Main ChatContainer component: manages conversation state, messages, and user interactions
export default function ChatContainer({ conversationId }: ChatContainerProps) {
  const { getToken, userId } = useAuth();
  const [isMicOn, setIsMicOn] = useState(false);

  /**
   * MAIN hook for chat functionality, handles message submission, responses, and state .
   * 
   * fetch response from api/chat which essentially uses the entire messages array containing the user's input and responses for context. As well as retrieving relevant context from the Pinecone vector store. Then stream chunks of data back and forth between the client and the server. 
   * 
  */
  const {
    messages,
    input: chatInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages, // This is necessary to manually clear messages
  } = useChat({
    streamProtocol: "text",
    api: "/api/chat",
    onResponse: (response) => {
      console.log("Received response from chat:", response);
    },
    onFinish: async (message) => {
      console.log("Finished message:", message);

      // Update conversation history to DB with AI response
      try {
        const response = await fetch("/api/updateMessage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            conversationId,
            newMessages: message, // Only the AI's response is saved in the message history
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update conversation");
        }

        const data = await response.json();
        console.log("Conversation updated:", data);
      } catch (error) {
        console.error("Error updating conversation with AI response: ", error);
      }
    },
    onError: (error) => {
      console.error("Error during chat submission:", error);
    },
  });

  useEffect(() => {
    // Whenever conversationId changes, clear the message history
    // Note: dashboard main layout is responsible for generating a new conversationId
    if (conversationId) {
      setMessages([]); // Clear the current messages
    }
  }, [conversationId, setMessages]);

  // Handle user message submission and detect for RateMyProfessors link, scrape professor details, and generate a summary
  const handleMessageSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (chatInput.trim() === "" || !userId) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: chatInput,
      createdAt: new Date(),
    };

    // Add the user's message to the messages list
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Clear the input box after message submission
    handleInputChange({ target: { value: "" } } as ChangeEvent<HTMLInputElement>);

    try {
      // Store user's message in the database
      const response = await fetch("/api/updateMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          conversationId,
          newMessages: { role: "user", content: chatInput },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save user message");
      }

    } catch (error) {
      console.error("Error during message submission:", error);
    }

    // Regex to match the base RateMyProfessors URL pattern but capture the entire link including the ID
    const ratemyprofessorsRegex = /https:\/\/www\.ratemyprofessors\.com\/professor\/\S+/;
    const match = chatInput.match(ratemyprofessorsRegex);
    
    if (match && match[0]) {
      const professorLink = match[0]; // This includes the entire link, including the ID
      try {
        
        console.log("Scraping professor details from:", professorLink);

        const response = await fetch("/api/scrape-professor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({professorLink}),
        });

        if (!response.ok) {
          throw new Error("Failed to scrape professor details");
        }

        const professorData = await response.json();
        console.log("Professor details scraped successfully:", professorData);

        // Call the new backend API to generate a summary
        const summaryResponse = await fetch("/api/professor-summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(professorData),
        });

        if (!summaryResponse.ok) {
          throw new Error("Failed to generate professor summary");
        }

        const summaryData = await summaryResponse.json();
        console.log("Generated professor summary:", summaryData);

        // Update the messages with the professor summary
        const newMessage: Message = {
          id: uuidv4(), // Generating a unique ID for the message
          role: "assistant",
          content: summaryData.summary,
          createdAt: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        // Store the assistant's message in the conversation history
        const updateResponse = await fetch("/api/updateMessage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            conversationId,
            newMessages: newMessage, // Save the AI's response in the message history
          }),
        });

        if (!updateResponse.ok) {
          throw new Error("Failed to update conversation");
        }

      } catch (error) {
        console.error("Error generating professor details:", error);
      }
    } else { // Otherwise, Proceed with the useChat for responses.
      handleSubmit();
    }

  };

  const handleMicClick = () => {
    // Extend the window interface to include SpeechRecognition
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsMicOn(true);
        console.log("Speech recognition started");
      };

      recognition.onspeechend = () => {
        recognition.stop();
        setIsMicOn(false);
        console.log("Speech recognition ended");
      };

      recognition.onerror = (event: any) => {
        // Explicitly type event as 'any'
        setIsMicOn(false);
        console.error("Speech recognition error", event);
      };

      recognition.onresult = (event: any) => {
        // Explicitly type event as 'any'
        const speechToText = event.results[0][0].transcript;
        handleInputChange({ target: { value: speechToText } } as ChangeEvent<
          HTMLInputElement
        >);
      };

      recognition.start();
    } else {
      console.error("SpeechRecognition API not supported in this browser.");
    }
  };

  return (
    <Chat
      chatInput={chatInput}
      handleInputChange={handleInputChange}
      handleMessageSubmit={handleMessageSubmit}
      handleMicClick={handleMicClick}
      messages={messages}
      conversationId={conversationId}
      isMicOn={isMicOn}
    />
  );
}
