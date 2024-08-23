import React, { useState } from "react";

const colors = [
  { id: 1, name: "Yellow", color: "bg-yellow-400" },
  { id: 2, name: "Green", color: "bg-teal-400" },
  { id: 3, name: "Purple", color: "bg-purple-300" },
  { id: 4, name: "Pink", color: "bg-pink-300" },
  { id: 5, name: "Blue", color: "bg-blue-300" },
];

interface CreateStepProps {
  userId: string | null;
  setDeckName: (name: string) => void;
  setActiveStep: (step: number) => void;
}

export default function CreateStep({ userId, setDeckName, setActiveStep  }: CreateStepProps) {
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [deckName, setDeckNameLocal] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error and loading state
    setError(null);
    setIsLoading(true);

    if (!userId) {
      setError("User ID is required.");
      setIsLoading(false);
      return;
    }

    console.log('User ID:', userId);
    console.log('Deck Name:', deckName);
    console.log('Selected Color:', selectedColor.name);
    console.log('Description:', description);

    try {
      const response = await fetch('/api/createDeck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          deckName: deckName,
          color: selectedColor.color,
          description: description,
        }),
      });
      const result = await response.json();

      if (response.ok) {
        console.log('Deck created successfully:', result.flashcardId);
        setDeckName(deckName); // Pass the deck name to the parent component\
        setActiveStep(1); // Move to the next step
      } else {
        setError(result.error || 'Failed to create deck.');
      }
    } catch (err) {
      console.error('Error creating deck:', err);
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">New Flashcard Deck</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-lg mb-2" htmlFor="deck-name">
            Deck Name
          </label>
          <input
            id="deck-name"
            type="text"
            maxLength={24}
            className="w-full border border-gray-300 rounded-lg p-2 shadow-inner focus:ring focus:ring-teal-300 outline-none"
            placeholder="Deck name"
            value={deckName}
            onChange={(e) => setDeckNameLocal(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-lg mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            maxLength={60}
            className="w-full border border-gray-300 rounded-lg p-2 shadow-inner h-24 focus:ring focus:ring-teal-300 outline-none"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <span className="block text-lg mb-2">Color</span>
          <div className="flex space-x-4">
            {colors.map((color) => (
              <button
                key={color.id}
                type="button"
                className={`w-12 h-12 rounded-full border-4 ${
                  selectedColor.id === color.id
                    ? "border-black"
                    : "border-transparent"
                } ${color.color}`}
                onClick={() => setSelectedColor(color)}
              ></button>
            ))}
          </div>
        </div>
        {error && (
          <div className="text-red-500 mb-4">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="mt-8 w-full bg-teal-500 text-white p-3 rounded-lg shadow-md hover:bg-teal-600 transition"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Deck'}
        </button>
      </form>
    </div>
  );
}
