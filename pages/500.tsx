import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1>Error 500</h1>
      <div>
        <p>An unexpected error occured on the server</p>
        <Link href="/">Go back</Link>
      </div>
    </main>
  );
}
