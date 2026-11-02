"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-background font-sans text-primary">
        <main className="mx-auto my-[10vh] max-w-160 p-6 text-center">
          <h1>Something went wrong</h1>
          <p className="text-secondary">A safe error was logged without internal details. Please try again.</p>
          <button
            onClick={reset}
            className="mt-4 min-h-11 rounded-control bg-accent px-5 py-3 font-bold text-onAccent"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
