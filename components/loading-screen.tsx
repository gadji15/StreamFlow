import React from 'react';

type LoadingScreenProps = {
  message?: string;
};

export default function LoadingScreen({ message = "Chargement..." }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <svg className="animate-spin h-8 w-8 text-gray-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        />
      </svg>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}