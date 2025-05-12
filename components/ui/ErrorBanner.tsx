import React from "react";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center my-2" role="alert">
      <svg className="fill-current w-5 h-5 mr-2 text-red-500" viewBox="0 0 20 20">
        <path d="M18.364 17.364A9 9 0 1 1 2.636 2.636a9 9 0 0 1 15.728 14.728zM11 7v4h-2V7h2zm0 6v2h-2v-2h2z" />
      </svg>
      <span className="block">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-auto bg-red-200 hover:bg-red-300 text-red-800 font-bold py-1 px-3 rounded"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}