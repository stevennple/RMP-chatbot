import { useState } from "react";

export default function ToggleSwitch() {
  const [selectedOption, setSelectedOption] = useState("monthly");

  return (
    <div className="flex rounded-full bg-gray-800 p-1">
      <button
        className={`px-4 py-2 text-sm font-medium rounded-full focus:outline-none ${
          selectedOption === "monthly"
            ? "bg-white text-gray-900"
            : "text-gray-400"
        }`}
        onClick={() => setSelectedOption("monthly")}
      >
        Monthly
      </button>
      <button
        className={`px-4 py-2 text-sm font-medium rounded-full focus:outline-none ${
          selectedOption === "annually"
            ? "bg-white text-gray-900"
            : "text-gray-400"
        }`}
        onClick={() => setSelectedOption("annually")}
      >
        Annually
      </button>
    </div>
  );
}
