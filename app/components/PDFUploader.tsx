import React, { useState, useRef } from 'react';
import { toast } from "@/app/components/ui/use-toast";

const PDFUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (file) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('pdf', file);

      try {
        const response = await fetch('/api/chunk-doc', {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          const { extractedContent, chunks } = data;         
          // Embed and store the chunks
          try {
            const embedResponse = await fetch('/api/embed-chunks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chunks }),
            });

            if (embedResponse.ok) {
                toast({
                    title: "Upload Successful",
                    description: "Knowledge base updated. The AI is now equipped to handle queries about your uploaded document.",
                    variant: "default",
                });
            } else {
                throw new Error("Failed to embed chunks");
            }
          } catch (embedError) {
              console.error('Error embedding and storing content:', embedError);
              toast({
                  title: "Embedding Failed",
                  description: "There was an error embedding your content.",
                  variant: "destructive",
              });
          }

          toast({
            title: "Upload Successful",
            description: "Knowledge base updated. The AI is now equipped to handle queries about your uploaded document.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error('Error uploading and embedding PDF:', error);
        /* toast({
          title: "Upload Failed",
          description: "There was an error uploading your PDF.",
          variant: "destructive",
        }); */
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <button 
        onClick={handleIconClick} 
        className="p-2 hover:bg-gray-100 rounded-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-paperclip" viewBox="0 0 16 16">
            <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default PDFUploader;
