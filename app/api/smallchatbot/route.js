// app/api/chatbot/route.js
import { NextResponse } from "next/server";
import { knowledgeBase } from "./knowledgeBase"; // Import the knowledge base

export async function POST(request) {
  try {
    const { message } = await request.json();
    let response = "I'm sorry, I didn't understand that.";

    const normalizedMessage = message.toLowerCase();

    for (const entry of knowledgeBase) {
      const match = entry.keywords.some((keyword) =>
        normalizedMessage.includes(keyword.toLowerCase())
      );
      if (match) {
        response = entry.response;
        break;
      }
    }

    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json({
      response: "An error occurred. Please try again.",
    });
  }
}
