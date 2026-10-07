"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50/30 flex items-center justify-center px-6">
      <div className="text-center max-w-md w-full space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-slate-800">Error</h1>
          <h2 className="text-2xl font-semibold text-slate-700">Something went wrong!</h2>
          <p className="text-slate-600">An unexpected error occurred. Please try again.</p>
        </div>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors duration-200"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
