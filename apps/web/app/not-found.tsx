import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col min-h-0 items-center justify-center px-4 py-6">
      <div className="text-center max-w-md">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-50 mb-2">Tag not found</h1>
        <p className="text-base text-slate-400 mb-6 leading-relaxed">
          This link may be invalid or the tag may have been deactivated.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 text-base text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline touch-manipulation"
        >
          Go to Tagback home
        </Link>
      </div>
    </main>
  );
}
