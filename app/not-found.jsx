import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center mt-10 px-6 bg-background">
      <div className="max-w-lg p-8 text-center bg-card rounded-3xl shadow-sm dark:shadow-xl">
        {/* light mode and dark mode use different gradients */}
        <h1 className="text-[120px] font-extrabold tracking-tight leading-none bg-linear-to-r from-slate-800 via-violet-600 to-blue-500 bg-clip-text text-transparent">
          404
        </h1>

        <h2 className="mt-3 text-2xl font-semibold text-foreground">
          Oops! Page not found
        </h2>

        <p className="mt-3 leading-relaxed text-muted-foreground">
          The page you’re looking for doesn’t exist or has been moved. Let’s get
          you back on track.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors duration-150"
          >
            Go Home
          </Link>
        </div>

        <div className="mt-10 pt-4 text-sm text-muted-foreground">
          Error code: 404 — Resource not found
        </div>
      </div>
    </div>
  );
}
