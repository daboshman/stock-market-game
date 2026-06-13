'use client';

interface ErrorStateProps {
  title?: string;
  message?: string;
  retry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  retry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {message && <p className="text-sm text-gray-400 max-w-sm mb-4">{message}</p>}
      {retry && (
        <button
          onClick={retry}
          className="text-sm text-indigo-400 hover:text-indigo-300 underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
