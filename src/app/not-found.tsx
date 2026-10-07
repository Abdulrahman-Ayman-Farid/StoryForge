import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center px-6">
      <div className="text-center max-w-md w-full space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-slate-800">404</h1>
          <h2 className="text-2xl font-semibold text-slate-700">Page Not Found</h2>
          <p className="text-slate-600">The page you are looking for does not exist or has been moved.</p>
        </div>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors duration-200"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
