import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Data fetching patterns for Next.js & Sanity</h1>
      <p>
        Read the{" "}
        <a href="https://dev.to/fibonacid/data-fetching-patterns-for-nextjs-sanity-4bgh">
          article
        </a>
      </p>
      <ul>
        <li>
          <Link href="/ssr/home">Server Rendering</Link>
        </li>
        <li>
          <Link href="/server-swr/home">Server SWR</Link>
        </li>
        <li>
          <Link href="/e2e-swr/home">End-to-End SWR</Link>
        </li>
        <li>
          <Link href="/eager-e2e-swr/home">Eager E2E SWR</Link>
        </li>
      </ul>
    </main>
  );
}
