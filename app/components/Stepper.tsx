// /app/components/Stepper.tsx
import React from 'react';

interface StepperProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
}

/* Recreate the stepper for create -> type-choice https://primereact.org/stepper/ */
const Stepper: React.FC<StepperProps> = ({ activeStep, setActiveStep }) => {
  return (
    <div className="flex justify-around mb-8">
      <button
        className={`px-4 py-2 text-lg font-medium ${activeStep === 0 ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded hover:bg-gray-300`}
        onClick={() => setActiveStep(0)}
      >
        Create
      </button>
      <button
        className={`px-4 py-2 text-lg font-medium ${activeStep === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded hover:bg-gray-300`}
        onClick={() => setActiveStep(0)}
      >
        Source
      </button>
    </div>
  );
};

export default Stepper;
