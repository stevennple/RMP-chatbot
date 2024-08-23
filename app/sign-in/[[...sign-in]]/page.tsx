"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import CustomSignIn from "@/app/components/signIn";
import Image from "next/image";
import Icon from "@/data/icon.png";
import SmallChatbot from "../[[...sign-in]]/SmallChatbot";
import "../[[...sign-in]]/style.css";

export default function Page(): JSX.Element | null {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [showSmallChatbot, setShowSmallChatbot] = useState(false);

  const handleSmallChatbotToggle = () => {
    setShowSmallChatbot((prev) => !prev);
  };

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center gap-12">
      {/* Logo positioned at the top-left */}
      <div className="absolute top-4 left-4">
        <Image src={Icon} alt="Site Logo" width={200} height={200} />
      </div>

      <div>
        <CustomSignIn />
      </div>
      <button
        className="toggle-small-chatbot absolute bottom-4 right-4"
        onClick={handleSmallChatbotToggle}
      >
        Open Chat
      </button>
      {showSmallChatbot && <SmallChatbot onClose={handleSmallChatbotToggle} />}
    </div>
  );
}
