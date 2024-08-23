import Link from 'next/link';

interface Question {
  front: string;
  back: string;
}

interface FlashcardProps {
  flashcardId: string;
  userId: string;
  title: string;
  description: string;
  color: string;
}

export const Flashcard: React.FC<FlashcardProps> = ({ flashcardId, userId, title, description, color }) => {
  const href = `/dashboard/flashcards/flashcard?flashcardId=${flashcardId}&userId=${userId}`;

  return (
    <Link href={href}>
      <div className={`${color} w-60 h-32 rounded-lg shadow-lg p-4 relative cursor-pointer`}>
        <h2 className="font-semibold text-lg">{title}</h2>
        <p className="text-gray-500 text-xs mt-2">{description}</p>
        
        {/* Three dots menu */}
        <div className="absolute top-2 right-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12 12a.75.75 0 100-1.5.75.75 0 000 1.5zM12 17.25a.75.75 0 100-1.5.75.75 0 000 1.5z" />
          </svg>
        </div>
      </div>
    </Link>
  );
};
