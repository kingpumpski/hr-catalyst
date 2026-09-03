import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-6 text-foreground">
      <section className="w-full max-w-lg text-center" aria-labelledby="not-found-title">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Page not found</p>
        <h1 id="not-found-title" className="mb-4 mt-3 text-5xl font-bold">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">The page you requested does not exist or may have moved.</p>
        <Link
          to="/"
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90"
        >
          Return to Home
        </Link>
      </section>
    </main>
  );
};

export default NotFound;
