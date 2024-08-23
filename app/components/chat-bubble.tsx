import Balancer from "react-wrap-balancer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Message } from "ai/react";

const convertNewLines = (text: string) =>
  text.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      <br />
    </span>
  ));

interface ChatBubbleProps extends Partial<Message> {
  createdAt?: Date; // Use createdAt for the timestamp
}

export function ChatBubble({
  role = "assistant",
  content,
  createdAt,
}: ChatBubbleProps) {
  if (!content) {
    return null;
  }
  const formattedMessage = convertNewLines(content);

  return (
    <div>
      <Card className="mb-2">
        <CardHeader>
          <CardTitle
            className={
              role !== "assistant"
                ? "text-amber-500 dark:text-amber-200"
                : "text-blue-500 dark:text-blue-200"
            }
          >
            {role === "assistant" ? "AI" : "You"}
          </CardTitle>
          {createdAt && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(createdAt).toLocaleString()} {/* Format timestamp */}
            </div>
          )}
        </CardHeader>
        <CardContent className="text-sm">
          <Balancer>{formattedMessage}</Balancer>
        </CardContent>
      </Card>
    </div>
  );
}
