import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1>Error 404</h1>
      <div>
        <p>The page you requested was not found</p>
        <Link href="/">Go back</Link>
      </div>
    </main>
  );
}
