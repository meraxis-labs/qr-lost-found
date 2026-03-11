import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-slate-50 mb-1">Tag not found</h1>
        <p className="text-sm text-slate-400 mb-4">
          This link may be invalid or the tag may have been deactivated.
        </p>
        <Link
          href="/"
          className="text-sm text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline"
        >
          Go to Tagback home
        </Link>
      </div>
    </main>
  );
}
