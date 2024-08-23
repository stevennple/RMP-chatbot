'use client'
import { useState, useEffect } from 'react';

/* const flashcards = [
    {
      question: 'What is the capital of France?',
      answer: 'Paris',
    },
    {
      question: 'What is 2 + 2?',
      answer: '4',
    },
    {
      question: 'Who wrote "To Kill a Mockingbird"?',
      answer: 'Harper Lee',
    },
]; */

interface Flashcard {
    question: string;
    answer: string;
}

const FlashcardPage = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [flashcardId, setFlashcardId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [color, setColor] = useState<string>('white');

    useEffect(() => {
        // Get the query parameters from the URL
        const url = new URL(window.location.href);
        setFlashcardId(url.searchParams.get('flashcardId'));
        setUserId(url.searchParams.get('userId'));
    }, []);

    // Fetch for 
    useEffect(() => {
        if (flashcardId && userId) {
            const fetchquestions = async () => {
                try {
                    const response = await fetch(`/api/getDeck?flashcardId=${flashcardId}&userId=${userId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('Deck information received:', data);

                        if (data.color) {
                            setColor(data.color);
                        }

                        if (data.flashcards) {
                            const flashcardArray: Flashcard[] = Object.keys(data.flashcards).flatMap((key) => {
                                return data.flashcards[key].map((q: any) => ({
                                    question: q.front,
                                    answer: q.back,
                                }));
                            });

                            setFlashcards(flashcardArray);
                        }
                    } else {
                        console.error('Failed to fetch conversations:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error fetching conversations:', error);
                }
            };

            fetchquestions();
        }
    }, [flashcardId, userId]);

    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
        prevIndex === flashcards.length - 1 ? 0 : prevIndex + 1
        );
        setIsFlipped(false); // Reset flip when moving to next card
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1
        );
        setIsFlipped(false); // Reset flip when moving to previous card
    };

    const handleFlip = () => {
        setIsFlipped((prevFlipped) => !prevFlipped);
    };
    
    if (flashcards.length === 0) {
        return<div>Loading...</div>;
    }


    return (
        <div className="flex justify-center items-center h-screen">
            <div className="relative flex items-center justify-center w-full max-w-md mx-auto">
                {/* Previous Button */}
                <button
                    onClick={handlePrev}
                    className="absolute left-[-3rem] text-3xl bg-gray-200 hover:bg-gray-300 rounded-full p-2 shadow-lg"
                    >
                    &lt;
                </button>

                {/* Flashcard */}
                <div
                    onClick={handleFlip}
                    className={`bg-gray-200 w-full p-8 rounded-lg shadow-lg text-center cursor-pointer transition-transform duration-500 transform ${
                        isFlipped ? 'rotate-y-180' : ''
                    }`}
                >
                    <h2 className="text-xl font-semibold">
                        {isFlipped
                        ? flashcards[currentIndex].answer
                        : flashcards[currentIndex].question}
                    </h2>
                </div>

                {/* Next Button */}
                <button
                    onClick={handleNext}
                    className="absolute right-[-3rem] text-3xl bg-gray-200 hover:bg-gray-300 rounded-full p-2 shadow-lg"
                >
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default FlashcardPage;
