import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <h1 className="text-9xl font-bold">404</h1>
      <p className="mt-4 text-2xl">Page Not Found</p>
      <p className="mt-2 text-lg text-base-content/80">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        Go Back Home
      </Link>
    </div>
  );
}