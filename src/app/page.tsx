import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="flex flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
        <div className="flex-shrink-0">
          <Image
            src="/images/megacodist-002.jpg"
            alt="A photo of Mohsen"
            width={128}
            height={128}
            className="rounded-full"
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold">Hi, I'm Mohsen</h1>
          <p className="mt-4 text-lg">
            I'm a software engineer passionate about building things for the web.
            This is my personal space where I share my projects, articles, and
            studies.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-8">Explore My Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link
            href="/abali"
            className="card bg-base-200 transition-colors hover:bg-base-300"
          >
            <div className="card-body">
              <h3 className="card-title">Abali</h3>
              <p>My pseudocode flavor of choice.</p>
            </div>
          </Link>
          <Link
            href="/algorithms"
            className="card bg-base-200 transition-colors hover:bg-base-300"
          >
            <div className="card-body">
              <h3 className="card-title">Algorithms</h3>
              <p>My study of algorithms, implemented in Abali.</p>
            </div>
          </Link>
          <Link
            href="/articles"
            className="card bg-base-200 transition-colors hover:bg-base-300"
          >
            <div className="card-body">
              <h3 className="card-title">Articles</h3>
              <p>My articles on different stuff, usually tech.</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}